import Accelerate
import CoreML
import Foundation
import UIKit
import Vision
import VisionCamera

private func cgImageOrientation(from o: UIImage.Orientation) -> CGImagePropertyOrientation {
  switch o {
  case .up: return .up
  case .upMirrored: return .upMirrored
  case .down: return .down
  case .downMirrored: return .downMirrored
  case .left: return .left
  case .leftMirrored: return .leftMirrored
  case .right: return .right
  case .rightMirrored: return .rightMirrored
  @unknown default: return .up
  }
}

@objc(BottleSegFrameProcessor)
public class BottleSegFrameProcessor: FrameProcessorPlugin {
  private static let modelInputW = 960
  private static let modelInputH = 544
  private static let protoH = 136
  private static let protoW = 240
  private static let coefCount = 32
  private static let bottleClassId = 39  // COCO "bottle"

  private var visionRequest: VNCoreMLRequest?
  private var modelLoadError: String?
  private let scoreThreshold: Float = 0.40
  private let maskThreshold: Float = 0.50

  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]!) {
    super.init(proxy: proxy, options: options)
    loadModel()
  }

  private func loadModel() {
    let bundle = Bundle.main
    guard let modelURL = bundle.url(forResource: "yolo26n-seg", withExtension: "mlmodelc")
            ?? bundle.url(forResource: "yolo26n-seg", withExtension: "mlpackage")
    else {
      modelLoadError = "yolo26n-seg model not found in app bundle"
      NSLog("[BottleSeg] %@", modelLoadError!)
      return
    }
    do {
      let cfg = MLModelConfiguration()
      if #available(iOS 16.0, *) {
        cfg.computeUnits = .cpuAndNeuralEngine
      } else {
        cfg.computeUnits = .all
      }
      let mlModel = try MLModel(contentsOf: modelURL, configuration: cfg)
      let visionModel = try VNCoreMLModel(for: mlModel)
      let request = VNCoreMLRequest(model: visionModel)
      request.imageCropAndScaleOption = .scaleFill
      visionRequest = request
      NSLog("[BottleSeg] model loaded from %@", modelURL.lastPathComponent)
    } catch {
      modelLoadError = "model load failed: \(error.localizedDescription)"
      NSLog("[BottleSeg] %@", modelLoadError!)
    }
  }

  public override func callback(_ frame: Frame, withArguments _: [AnyHashable: Any]?) -> Any? {
    guard let request = visionRequest else {
      return ["error": modelLoadError ?? "no request", "detections": []]
    }
    let pixelBuffer = frame.buffer
    guard let cvPixelBuffer = CMSampleBufferGetImageBuffer(pixelBuffer) else {
      return ["error": "no pixel buffer", "detections": []]
    }

    let cgOrientation = cgImageOrientation(from: frame.orientation)
    let handler = VNImageRequestHandler(cvPixelBuffer: cvPixelBuffer,
                                        orientation: cgOrientation,
                                        options: [:])
    do {
      try handler.perform([request])
    } catch {
      return ["error": "vision perform: \(error.localizedDescription)", "detections": []]
    }

    guard let results = request.results as? [VNCoreMLFeatureValueObservation],
          results.count >= 2 else {
      return ["error": "expected 2 outputs, got \(request.results?.count ?? 0)", "detections": []]
    }

    var detTensor: MLMultiArray?
    var protoTensor: MLMultiArray?
    for r in results {
      guard let arr = r.featureValue.multiArrayValue else { continue }
      if arr.shape.count == 3 {
        detTensor = arr  // (1, N, 38) or (1, 38, N)
      } else if arr.shape.count == 4 {
        protoTensor = arr  // (1, 32, H, W)
      }
    }
    guard let det = detTensor, let proto = protoTensor else {
      return ["error": "missing det or proto tensor", "detections": []]
    }

    let detections = decodeDetections(det: det, proto: proto)
    return ["detections": detections]
  }

  private func decodeDetections(det: MLMultiArray, proto: MLMultiArray) -> [[String: Any]] {
    let s = det.shape.map { $0.intValue }
    guard s.count == 3, s[0] == 1 else { return [] }
    let dim1 = s[1], dim2 = s[2]

    let nDet: Int
    let featStride: Int
    let detStride: Int
    if dim2 == 38 {
      nDet = dim1
      detStride = 38
      featStride = 1
    } else if dim1 == 38 {
      nDet = dim2
      detStride = 1
      featStride = dim2
    } else {
      NSLog("[BottleSeg] unexpected det shape %@", "\(s)")
      return []
    }

    let detPtr = det.dataPointer.bindMemory(to: Float32.self, capacity: det.count)

    let pShape = proto.shape.map { $0.intValue }
    guard pShape.count == 4, pShape[1] == Self.coefCount else { return [] }
    let pH = pShape[2]
    let pW = pShape[3]
    let pixelsPerProto = pH * pW
    let protoPtr = proto.dataPointer.bindMemory(to: Float32.self, capacity: proto.count)

    var protoFlat = [Float](repeating: 0, count: Self.coefCount * pixelsPerProto)
    for c in 0..<Self.coefCount {
      let src = protoPtr.advanced(by: c * pixelsPerProto)
      let dst = c * pixelsPerProto
      for i in 0..<pixelsPerProto {
        protoFlat[dst + i] = src[i]
      }
    }

    var out: [[String: Any]] = []
    var coefs = [Float](repeating: 0, count: Self.coefCount)

    for i in 0..<nDet {
      let base = i * detStride
      func f(_ idx: Int) -> Float { detPtr[base + idx * featStride] }

      let score = f(4)
      if score < scoreThreshold { continue }
      let cls = Int(f(5))
      if cls != Self.bottleClassId { continue }

      // box: ultralytics CoreML seg export emits xywh in normalized [0,1] (cx,cy,w,h)
      let cx = f(0), cy = f(1), w = f(2), h = f(3)
      var x1 = cx - w / 2
      var y1 = cy - h / 2
      var x2 = cx + w / 2
      var y2 = cy + h / 2
      if max(abs(cx), abs(cy), abs(w), abs(h)) > 1.5 {
        // values look like model-input pixels, not normalized — convert
        x1 /= Float(Self.modelInputW)
        x2 /= Float(Self.modelInputW)
        y1 /= Float(Self.modelInputH)
        y2 /= Float(Self.modelInputH)
      }
      x1 = min(max(x1, 0), 1); x2 = min(max(x2, 0), 1)
      y1 = min(max(y1, 0), 1); y2 = min(max(y2, 0), 1)
      if x2 - x1 < 0.01 || y2 - y1 < 0.01 { continue }

      for c in 0..<Self.coefCount {
        coefs[c] = f(6 + c)
      }

      // mask = sigmoid(coefs (1,32) · proto (32, pH*pW)) → (1, pH*pW)
      var maskFlat = [Float](repeating: 0, count: pixelsPerProto)
      coefs.withUnsafeBufferPointer { cPtr in
        protoFlat.withUnsafeBufferPointer { pPtr in
          maskFlat.withUnsafeMutableBufferPointer { mPtr in
            cblas_sgemm(CblasRowMajor, CblasNoTrans, CblasNoTrans,
                        1, Int32(pixelsPerProto), Int32(Self.coefCount),
                        1.0,
                        cPtr.baseAddress, Int32(Self.coefCount),
                        pPtr.baseAddress, Int32(pixelsPerProto),
                        0.0,
                        mPtr.baseAddress, Int32(pixelsPerProto))
          }
        }
      }
      // sigmoid in place
      for k in 0..<pixelsPerProto {
        maskFlat[k] = 1.0 / (1.0 + expf(-maskFlat[k]))
      }

      // crop to bbox region in proto-space
      let mx1 = Int(floor(x1 * Float(pW)))
      let my1 = Int(floor(y1 * Float(pH)))
      let mx2 = max(mx1 + 1, Int(ceil(x2 * Float(pW))))
      let my2 = max(my1 + 1, Int(ceil(y2 * Float(pH))))
      let cmx1 = min(max(mx1, 0), pW - 1)
      let cmx2 = min(max(mx2, cmx1 + 1), pW)
      let cmy1 = min(max(my1, 0), pH - 1)
      let cmy2 = min(max(my2, cmy1 + 1), pH)

      // binarize cropped region into a small grid; everything outside bbox = 0
      let cropW = cmx2 - cmx1
      let cropH = cmy2 - cmy1
      var binMask = [UInt8](repeating: 0, count: cropW * cropH)
      for yy in 0..<cropH {
        for xx in 0..<cropW {
          let v = maskFlat[(cmy1 + yy) * pW + (cmx1 + xx)]
          binMask[yy * cropW + xx] = v >= maskThreshold ? 1 : 0
        }
      }

      let polygon = extractPolygon(binMask: binMask, width: cropW, height: cropH,
                                   originX: Float(cmx1) / Float(pW),
                                   originY: Float(cmy1) / Float(pH),
                                   pixelW: 1.0 / Float(pW),
                                   pixelH: 1.0 / Float(pH),
                                   maxPoints: 64)

      out.append([
        "x": x1, "y": y1, "w": x2 - x1, "h": y2 - y1,
        "score": score, "classId": cls,
        "polygon": polygon
      ])
    }

    // Optional: cap at top-K by score
    let topK = 20
    if out.count > topK {
      out.sort { ($0["score"] as? Float ?? 0) > ($1["score"] as? Float ?? 0) }
      out = Array(out.prefix(topK))
    }
    return out
  }

  /// Extract a coarse polygon outline from a binary mask via boundary trace.
  /// Returns flat [x,y,x,y,...] in normalized [0,1] image coords, downsampled to maxPoints.
  private func extractPolygon(binMask: [UInt8], width: Int, height: Int,
                              originX: Float, originY: Float,
                              pixelW: Float, pixelH: Float,
                              maxPoints: Int) -> [Float] {
    // Find first foreground pixel (top-left scan).
    var startX = -1, startY = -1
    outer: for y in 0..<height {
      for x in 0..<width where binMask[y * width + x] == 1 {
        startX = x; startY = y; break outer
      }
    }
    if startX < 0 { return [] }

    // Moore-Neighbor boundary tracing.
    let dx = [0, 1, 1, 1, 0, -1, -1, -1]
    let dy = [-1, -1, 0, 1, 1, 1, 0, -1]
    func at(_ x: Int, _ y: Int) -> Bool {
      if x < 0 || y < 0 || x >= width || y >= height { return false }
      return binMask[y * width + x] == 1
    }

    var points: [(Int, Int)] = [(startX, startY)]
    var cx = startX, cy = startY
    var prevDir = 6  // came from west
    let maxIter = width * height * 4
    var iter = 0
    while iter < maxIter {
      iter += 1
      var found = false
      // start checking from (prevDir + 6) % 8 (turn left from incoming dir)
      let startDir = (prevDir + 6) % 8
      for k in 0..<8 {
        let d = (startDir + k) % 8
        let nx = cx + dx[d]
        let ny = cy + dy[d]
        if at(nx, ny) {
          cx = nx; cy = ny
          prevDir = (d + 4) % 8  // direction we came from
          points.append((cx, cy))
          found = true
          break
        }
      }
      if !found { break }
      if cx == startX && cy == startY && points.count > 2 { break }
      if points.count > maxPoints * 8 { break }
    }

    // Downsample to maxPoints
    let n = points.count
    if n == 0 { return [] }
    let step = max(1, n / maxPoints)
    var out: [Float] = []
    out.reserveCapacity((n / step + 1) * 2)
    var i = 0
    while i < n {
      let p = points[i]
      let nx = originX + (Float(p.0) + 0.5) * pixelW
      let ny = originY + (Float(p.1) + 0.5) * pixelH
      out.append(nx)
      out.append(ny)
      i += step
    }
    return out
  }
}

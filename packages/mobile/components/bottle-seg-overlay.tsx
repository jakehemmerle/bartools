import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Canvas, Path, Rect, Skia, type SkPath } from '@shopify/react-native-skia'
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  VisionCameraProxy,
  type Frame,
} from 'react-native-vision-camera'
import { Worklets } from 'react-native-worklets-core'

const plugin = VisionCameraProxy.initFrameProcessorPlugin('bottleSeg', {})

type Detection = {
  x: number
  y: number
  w: number
  h: number
  score: number
  classId: number
  polygon: number[]
}

type PluginResult = {
  detections?: Detection[]
  error?: string
}

function bottleSeg(frame: Frame): Detection[] {
  'worklet'
  if (plugin == null) {
    throw new Error('bottleSeg frame processor plugin not registered')
  }
  const result = plugin.call(frame) as unknown as PluginResult
  if (result?.error) {
    console.warn('[bottleSeg]', result.error)
  }
  return result?.detections ?? []
}

export function BottleSegOverlay() {
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()
  const [detections, setDetections] = useState<Detection[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [fps, setFps] = useState(0)

  useEffect(() => {
    if (!hasPermission) requestPermission()
  }, [hasPermission, requestPermission])

  const setDetectionsJS = useMemo(
    () => Worklets.createRunOnJS(setDetections),
    [],
  )
  const setFpsJS = useMemo(() => Worklets.createRunOnJS(setFps), [])

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet'
      const t0 = performance.now()
      const dets = bottleSeg(frame)
      const dt = performance.now() - t0
      setDetectionsJS(dets)
      setFpsJS(dt > 0 ? Math.round(1000 / dt) : 0)
    },
    [setDetectionsJS, setFpsJS],
  )

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera Permission Needed</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant</Text>
        </TouchableOpacity>
      </View>
    )
  }
  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>No back camera available</Text>
      </View>
    )
  }

  return (
    <View
      style={styles.flex}
      onLayout={(e) =>
        setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        fps={15}
        pixelFormat="yuv"
        resizeMode="cover"
      />
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        {detections.map((d, i) => (
          <DetectionShape key={i} d={d} cw={size.w} ch={size.h} />
        ))}
      </Canvas>
      <View style={styles.hud} pointerEvents="none">
        <Text style={styles.hudText}>
          {detections.length} bottle{detections.length === 1 ? '' : 's'}
        </Text>
        <Text style={styles.hudSub}>~{fps} model fps</Text>
      </View>
    </View>
  )
}

function DetectionShape({
  d,
  cw,
  ch,
}: {
  d: Detection
  cw: number
  ch: number
}) {
  const path = useMemo<SkPath | null>(() => {
    if (!d.polygon || d.polygon.length < 6) return null
    const p = Skia.Path.Make()
    p.moveTo(d.polygon[0] * cw, d.polygon[1] * ch)
    for (let i = 2; i < d.polygon.length; i += 2) {
      p.lineTo(d.polygon[i] * cw, d.polygon[i + 1] * ch)
    }
    p.close()
    return p
  }, [d, cw, ch])

  const x = d.x * cw
  const y = d.y * ch
  const w = d.w * cw
  const h = d.h * ch

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        color="rgba(255,183,130,0.85)"
        style="stroke"
        strokeWidth={2}
      />
      {path && (
        <>
          <Path path={path} color="rgba(255,183,130,0.30)" style="fill" />
          <Path
            path={path}
            color="rgba(255,183,130,1)"
            style="stroke"
            strokeWidth={1.5}
          />
        </>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131313',
    gap: 16,
    padding: 24,
  },
  title: { fontSize: 18, color: '#FFB782', fontWeight: '600', textAlign: 'center' },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFB782',
    borderRadius: 10,
  },
  btnText: { color: '#131313', fontWeight: '700', fontSize: 16 },
  hud: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hudText: { color: '#FFB782', fontSize: 16, fontWeight: '700' },
  hudSub: { color: '#A08D80', fontSize: 11, marginTop: 2 },
})

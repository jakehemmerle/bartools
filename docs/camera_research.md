react-native-vision-camera (specifically version 5 and above in 2026) provides significant benefits for your liquor bottle application by serving as a high-performance bridge between the raw camera hardware and your AI logic. It does not just "capture" images; it enables a sophisticated on-device pre-processing pipeline that can drastically reduce backend costs and improve user experience.

Pre-processing and Data Organization
The library's primary benefit for your app is its Frame Processor architecture, which allows you to run "worklets" (small, fast JavaScript or native C++ functions) on every single frame the camera sees.

GPU-Accelerated Resizing: You can use the built-in GPU resizer to downscale raw 4K or 12MP frames to the exact dimensions required by your backend (e.g., 1024px or the specific 224/448px inputs used by models like PaliGemma 2) before the data leaves the camera buffer.

Coordinate Conversion: V5 supports native coordinate system conversions. If a local model detects a bottle at specific pixel coordinates, the library can map those coordinates to the UI, allowing you to draw a bounding box that perfectly tracks the bottle in the user's viewfinder.

Bandwidth Efficiency: By cropping the image to just the detected bottle on-device, you can send a 100KB "bottle-only" snippet to your backend rather than a 5MB full-room photo, cutting upload latency and token costs by up to 50%.

Expediting Video-to-Image Workflows
react-native-vision-camera is specifically designed to enable the "video-to-backend-image" approach you described. Instead of a user taking a static photo and hoping it's in focus, the app can "scan" a video feed and intelligently decide when to send data.

Intelligent Frame Extraction: By plugging a lightweight model like YOLO26n into a Frame Processor via react-native-executorch, the app can analyze the live stream at 30–60 FPS.

The "Best Frame" Trigger: Instead of sending every frame of a video (which would be prohibitively expensive), the Frame Processor can wait until:

A bottle is detected with >90% confidence.

The bottle is centered in the frame and not motion-blurred.

The lighting is sufficient.

Asynchronous Uploads: You can use the runAsync function within the Frame Processor to trigger a backend identification call in the background without interrupting the smooth 60 FPS camera preview. This makes the app feel "instant"—the user just points their phone at a shelf, and identifications start popping up as they move the camera.

2026 Recommended Implementation
For your Expo MVP, the most efficient architecture using this library is:

Local "Sentry": Use VisionCamera V5 with a YOLO26 model exported to ExecuTorch format. This runs on the phone's CPU/NPU to find the bottle's bounding box.

Selective Capture: Once the local model "locks on" to a bottle for more than 500ms, extract that specific frame, crop it to the bounding box, and convert it to a compressed JPEG.

Cloud Analysis: Send that optimized, cropped image to a model like GPT-5.4-nano or Gemini 3.1 Flash-Lite for the final brand identification and fill-level estimation.

This approach ensures you only hit your paid API for images that are guaranteed to contain a clear, well-framed liquor bottle, maximizing your accuracy while minimizing your "wasteful" spend on blurry or empty frames.

BarBack Tier Mapping
The "best frame" trigger pattern isn't just a Tier 2/3 feature — it could improve Tier 1 UX as well. Instead of requiring the user to manually tap a shutter button, the camera could auto-capture when it detects a clear, well-framed bottle. This turns single-bottle capture from "take a photo" into "point at the bottle" — faster for the user and more consistent input for the VLM.

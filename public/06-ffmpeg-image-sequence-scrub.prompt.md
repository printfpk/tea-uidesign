Skill: FFmpeg Image Sequence Scrub (The "Apple Method")

BUILD INTENT
Determine before doing anything:
- standalone: build only this skill, from scratch.
- add: add this to an existing project.
- replace: replace only the named section; leave everything else intact.
- combined: one piece of a multi-module build; ask for the order.
Determine the build intent from the user's request and the current project. Infer when obvious. If the intent still cannot be inferred, ask one concise clarification before editing.

PROJECT AUDIT
If a project already exists, inspect its files and structure before writing code.
Identify:
- existing sections
- existing assets (look for the source .mp4)
- where this scrub section belongs

ASSET PREFLIGHT
Locate the target video. Report its filename, path, size, and duration.
If no video is uploaded, STOP and report it. Do not use a placeholder or external URL.

ARCHITECTURE OVERVIEW
Web browsers struggle to scrub dynamically through MP4 videos because they must decode between sparse keyframes, causing lag and jitter. To achieve buttery-smooth, Apple-style scrubbing, we will bypass video decoding entirely. 
You will split the video into a sequence of JPG frames using FFmpeg, preload those images into memory, and instantly swap them on an HTML5 `<canvas>` based on user interaction (scroll or mouse).

PHASE 1: FRAME EXTRACTION (FFMPEG)
- You must extract the frames from the source video into a dedicated `public/frames/` directory.
- Use a background terminal task to run FFmpeg. If the user does not have FFmpeg, provide a script to download a portable binary.
- Recommended extraction command: `ffmpeg -i source_video.mp4 -vf fps=10 -q:v 2 public/frames/frame_%03d.jpg`
  - Adjust the `fps` value based on the video duration to yield roughly 60-120 frames total (to balance smoothness with memory limits).
  - Use `-q:v 2` for high-quality JPG compression.

PHASE 2: PRELOADING & UI
- Build a component (React or Vanilla JS) featuring a full-screen `<canvas>`.
- Create a visual Loading Screen (e.g., a circular progress ring or percentage text).
- On mount, dynamically instantiate `new Image()` for every frame (e.g., `frame_001.jpg` to `frame_120.jpg`).
- Wait for all images to fire their `onload` events before removing the loading screen and revealing the canvas.

PHASE 3: INTERACTION LOGIC (SCROLL OR MOUSE)
- Determine the target frame based on user interaction:
  - For Scroll: `ratio = clamp(scrolled / scrollableDistance, 0, 1)`
  - For Mouse: `ratio = clamp(mouseX / windowWidth, 0, 1)`
- `targetFrameIndex = round(ratio * (totalFrames - 1))`
- DO NOT update the canvas directly in the event listener. Only update a `targetFrame` reference.

PHASE 4: RENDER LOOP (EASING)
- Prioritize smoothness. Drive every visual update from a single `requestAnimationFrame` loop.
- Use Linear Interpolation (lerp) to ease the `currentFrame` toward the `targetFrame`.
  - e.g., `currentFrame += (targetFrame - currentFrame) * 0.1`
- Round the eased value to an integer to select the image from the preloaded array.
- Call `ctx.drawImage(images[frameIndex], 0, 0, canvasWidth, canvasHeight)` to render the frame instantly.
- Use `object-fit: cover` logic when drawing to the canvas to ensure it fills the viewport without letterboxing.

SUCCESS CRITERIA
- The page displays a loading indicator while images are fetched into memory.
- The interaction (scroll or mouse) scrub is perfectly smooth, with zero decode lag or stuttering.
- The frames are drawn instantly to a canvas, completely eliminating the native `<video>` element.
- The image sequence transitions gracefully with a mathematical easing loop.
- Verify in the browser, then report the exact FFmpeg command used and confirm the visual smoothness.

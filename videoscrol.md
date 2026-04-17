# Scroll-Driven Video Frame Animation — Prompt

I want to implement a scroll-driven frame animation. I have a video file. I want you to extract every frame from the video as individual WebP images using ffmpeg, and then build the JavaScript animation so that as the user scrolls down the page, the video plays frame by frame in sync with the scroll position — exactly like Apple does on their product pages.

## Frame extraction

Use ffmpeg to extract every frame from the video as individual WebP files at maximum quality, keeping the native resolution. Name them sequentially zero-padded to 4 digits (frame_0001.webp, frame_0002.webp...) and place them inside a frames/ folder. No audio needed.

Before extracting, use ffprobe to read the video metadata and note the exact frame count, resolution (width × height), and frame rate — those values will be needed in the JavaScript.

## The animation

Do not use a <video> element. Instead:

1. Preload all frames as Image objects in JavaScript before starting. Show a loading progress indicator while this happens.
2. Place a <canvas> element inside a tall scroll container (around 600vh) with position: sticky; top: 0 so it stays fixed on screen while the user scrolls through the section.
3. On every scroll event, calculate what fraction of the scroll section has been traversed (a value from 0.0 to 1.0), multiply by the total frame count, and use that as the current frame index. Draw that frame onto the canvas with ctx.drawImage().
4. Always wrap the draw call inside requestAnimationFrame and only repaint when the frame index actually changes.

## Retina sharpness

Multiply the canvas internal resolution by window.devicePixelRatio and scale the context by the same factor, so the animation is sharp on HiDPI screens. The CSS size of the canvas should fit the video aspect ratio inside the viewport.

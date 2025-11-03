import { parseFrameHeader } from "./parse-frame-header";

// https://www.mp3-tech.org/programmer/frame_header.html
// count the number of frames across an mp3 file buffer
export const countFrames = (buffer: ArrayBuffer) => {
    let frameCount = 0;
    for (let index = 0; index < buffer.byteLength - 1; index++) {
        const bytes = new Uint8Array(buffer.slice(index, index + 2));
        const frameData = parseFrameHeader(bytes);

        if (!frameData) {
            continue;
        }

        frameCount += 1;
    }

    return frameCount;
};

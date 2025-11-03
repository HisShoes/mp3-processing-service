import { parseFrameHeader } from "./parse-frame-header";

// https://www.mp3-tech.org/programmer/frame_header.html
// count the number of frames across an mp3 file buffer
export const countFrames = (buffer: ArrayBuffer) => {
    let frameCount = 0;
    let index = 0;

    while (index + 4 <= buffer.byteLength) {
        const bytes = new Uint8Array(buffer.slice(index, index + 4));
        const frameData = parseFrameHeader(bytes);

        // frameLength should be calculated and attached to frameData
        const frameLength = frameData?.frameLength;
        if (!frameData || !frameLength || index + frameLength > buffer.byteLength) {
            index += 1; // move forward one byte and try again
            continue;
        }

        if (index + frameData.frameLength! < buffer.byteLength) {
            frameCount += 1;
        }

        index += frameLength;
    }
    return frameCount;
};

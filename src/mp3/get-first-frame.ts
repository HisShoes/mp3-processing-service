import { parseFrameHeader } from "./parse-frame-header";

// parse the first frame of a file buffer to get the metadata
export const getFirstFrame = (buffer: ArrayBuffer) => {
    for (let index = 0; index < buffer.byteLength - 1; index++) {
        const bytes = new Uint8Array(buffer.slice(index, index + 2));
        const frameData = parseFrameHeader(bytes);

        if (frameData) {
            return frameData;
        }
    }
};

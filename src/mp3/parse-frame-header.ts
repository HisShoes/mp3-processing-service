export type MPEGMetadata = Exclude<
    ReturnType<typeof parseFrameHeader>,
    undefined
>;

type MPEGVersion = "UNKNOWN" |
    "MPEG_V2_5" |
    "RESERVED" |
    "MPEG_V2" |
    "MPEG_V1";

type MPEGLayer = "UNKNOWN" | "LAYER_1" | "LAYER_2" | "LAYER_3";

// Check for frame sync bits
// Only supports MPEG v1 and Layer 3 at the moment
export const parseFrameHeader = (bytes: Uint8Array) => {
    // 2 bytes required to check the values we are looking for
    if (bytes.byteLength < 2) return;

    if (!hasFrameSyncBits(bytes)) {
        return;
    }

    const mpegVersion = getMpegVersion(bytes[1]);
    const layer = getLayer(bytes[1]);

    return {
        mpegVersion,
        layer,
        // protection
        // bitrate
        // sample rate
        // channel, mode, copyright etc.
    };
};

// first 11 bits must be set to 1
export const hasFrameSyncBits = (bytes: Uint8Array) => {
    // First 8 bits must be 1 -> 0xFF
    // Next 3 bits (top 3 bits of the second byte) must be 1 -> mask 0xE0 === 0b1110_0000
    return bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0;
};

export const getMpegVersion = (bits: number): MPEGVersion => {
    const versionBits = (bits & 0x18) >> 3; // extract bits 4..3

    // Mapping per MPEG audio header:
    switch (versionBits) {
        // 10 -> MPEG Version 2
        case 0b10:
            return "MPEG_V2";
        // 11 -> MPEG Version 1
        case 0b11:
            return "MPEG_V1";
        default:
            return "UNKNOWN";
    }
};

export const getLayer = (bits: number): MPEGLayer => {
    const layerBits = (bits & 0x06) >> 1; // extract bits 2..1

    // Mapping per MPEG audio header:
    switch (layerBits) {
        // 01 -> Layer III
        case 0b01:
            return "LAYER_3";
        // 10 -> Layer II
        case 0b10:
            return "LAYER_2";
        // 11 -> Layer I
        case 0b11:
            return "LAYER_1";
        default:
            return "UNKNOWN";
    }
};

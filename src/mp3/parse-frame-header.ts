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
    if (bytes.byteLength < 4) return;

    if (!hasFrameSyncBits(bytes)) {
        return;
    }

    const mpegVersion = getMpegVersion(bytes[1]);
    const layer = getLayer(bytes[1]);
    const frameLength = getFrameLength(bytes);

    return {
        mpegVersion,
        layer,
        frameLength
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

// Bitrate lookup tables (kbps)
const BITRATE_TABLE: Record<string, number[]> = {
    // Only common values for MPEG V1, Layer III and MPEG V2, Layer III
    // Index 0 is 'free', 1 is 32kbps, etc. (see spec)
    // MPEG V1, Layer III
    'MPEG_V1_L3': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
    // MPEG V2, Layer III
    'MPEG_V2_L3': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
};

// Sample rate lookup tables (Hz)
const SAMPLERATE_TABLE: Record<string, number[]> = {
    'MPEG_V1': [44100, 48000, 32000, 0],
    'MPEG_V2': [22050, 24000, 16000, 0],
};

export const getFrameLength = (bytes: Uint8Array): number | undefined => {
    if (bytes.length < 4) return undefined;

    const version = getMpegVersion(bytes[1]);

    // Bitrate index: bits 7..4 of third byte
    const bitrateIdx = (bytes[2] & 0xF0) >> 4;
    // Sample rate index: bits 3..2 of third byte
    const samplerateIdx = (bytes[2] & 0x0C) >> 2;
    // Padding bit: bit 1 of third byte
    const padding = (bytes[2] & 0x02) >> 1;

    let bitrate: number | undefined;
    let samplerate: number | undefined;
    if (version === "MPEG_V1") {
        bitrate = BITRATE_TABLE['MPEG_V1_L3'][bitrateIdx] * 1000;
        samplerate = SAMPLERATE_TABLE['MPEG_V1'][samplerateIdx];
    } else if (version === "MPEG_V2") {
        bitrate = BITRATE_TABLE['MPEG_V2_L3'][bitrateIdx] * 1000;
        samplerate = SAMPLERATE_TABLE['MPEG_V2'][samplerateIdx];
    } else {
        return undefined;
    }
    if (!bitrate || !samplerate) return undefined;

    // Frame length formula for Layer III:
    // V1: frameLen = 144 * bitrate / samplerate + padding
    // V2: frameLen = 72 * bitrate / samplerate + padding
    const coeff = version === "MPEG_V1" ? 144 : 72;
    return Math.floor((coeff * bitrate) / samplerate + padding);
};
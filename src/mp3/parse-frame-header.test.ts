import { describe, expect, it } from "bun:test";
import { getFrameLength, getLayer, getMpegVersion, hasFrameSyncBits, parseFrameHeader } from "./parse-frame-header";

describe("hasFrameSyncBits", () => {
    it("returns true for valid sync bits", () => {
        // 0xFF, 0xE0: first 11 bits are 1
        const bytes = new Uint8Array([0xFF, 0xE0]);
        expect(hasFrameSyncBits(bytes)).toBe(true);
    });

    it("returns false for invalid sync bits", () => {
        const bytes = new Uint8Array([0xFE, 0xE0]); // first byte not all 1s
        expect(hasFrameSyncBits(bytes)).toBe(false);

        const bytes2 = new Uint8Array([0xFF, 0xC0]); // top 3 bits of second byte not all 1s
        expect(hasFrameSyncBits(bytes2)).toBe(false);
    });

    it("returns false for short buffer", () => {
        expect(hasFrameSyncBits(new Uint8Array([0xFF]))).toBe(false);
        expect(hasFrameSyncBits(new Uint8Array([]))).toBe(false);
    });
});

describe("getMpegVersion", () => {
    it("returns MPEG_V2 for bits 10", () => {
        expect(getMpegVersion(0x10)).toBe("MPEG_V2");
    });

    it("returns MPEG_V1 for bits 11", () => {
        expect(getMpegVersion(0x18)).toBe("MPEG_V1");
    });

    it("returns UNKNOWN for bits 01", () => {
        expect(getMpegVersion(0x08)).toBe("UNKNOWN");
    });
});

describe("getLayer", () => {
    it("returns LAYER_3 for bits 01", () => {
        expect(getLayer(0x02)).toBe("LAYER_3");
    });

    it("returns LAYER_2 for bits 10", () => {
        expect(getLayer(0x04)).toBe("LAYER_2");
    });

    it("returns LAYER_1 for bits 11", () => {
        expect(getLayer(0x06)).toBe("LAYER_1");
    });

    it("returns UNKNOWN for reserved bits 00", () => {
        expect(getLayer(0x00)).toBe("UNKNOWN");
    });
});

describe("parseFrameHeader", () => {
    it("returns metadata and frameLength for valid MPEG v2 Layer 3 header", () => {
        // Sync: 0xFF, 0xE0; Version: bits 10 (0x10); Layer: bits 01 (0x02)
        // Bitrate: 80kbps (index 9), Sample rate: 22050Hz (index 0), Padding: 0
        // bytes[0]=0xFF, bytes[1]=0xF2, bytes[2]=0x92
        const bytes = new Uint8Array([0xFF, 0xF2, 0x92, 0x00]);
        const result = parseFrameHeader(bytes);
        expect(result).toEqual({
            mpegVersion: "MPEG_V2",
            layer: "LAYER_3",
            frameLength: 262,
        });
        // Check frameLength calculation
        expect(result?.frameLength).toBeGreaterThan(0);
    });

    it("returns undefined for invalid sync bits", () => {
        const bytes = new Uint8Array([0xFE, 0xF2, 0x92, 0x00]);
        expect(parseFrameHeader(bytes)).toBeUndefined();
    });

    it("returns unknown for unknown layer", () => {
        const bytes = new Uint8Array([0xFF, 0xF8, 0x92, 0x00]);
        const result = parseFrameHeader(bytes);
        expect(result).toEqual({
            mpegVersion: "MPEG_V1",
            layer: "UNKNOWN",
            frameLength: 418
        });
    });

    it("returns unknown for unknown mpeg version", () => {
        const bytes = new Uint8Array([0xFF, 0xE4, 0x92, 0x00]);
        const result = parseFrameHeader(bytes);
        expect(result).toEqual({
            mpegVersion: "UNKNOWN",
            layer: "LAYER_2",
            frameLength: undefined
        });
    });

    it("returns undefined for short buffer", () => {
        expect(parseFrameHeader(new Uint8Array([0xFF]))).toBeUndefined();
        expect(parseFrameHeader(new Uint8Array([]))).toBeUndefined();
    });
});

describe("getFrameLength", () => {
    it("calculates frame length for valid MPEG V2 Layer 3 header", () => {
        // bytes: [0xFF, 0xF2, 0x92, 0x00]
        // Sync: 0xFF, 0xE0; Version: bits 10 (0x10); Layer: bits 01 (0x02)
        // Bitrate: 80kbps (index 9), Sample rate: 22050Hz (index 0), Padding: 0
        const bytes = new Uint8Array([0xFF, 0xF2, 0x92, 0x00]);
        const length = getFrameLength(bytes);
        expect(length).toBeGreaterThan(0);
        // For this header, expected length: Math.floor((72 * 80000) / 22050)
        expect(length).toBe(Math.ceil((72 * 80000) / 22050));
    });

    it("returns undefined for short buffer", () => {
        expect(getFrameLength(new Uint8Array([0xFF]))).toBeUndefined();
        expect(getFrameLength(new Uint8Array([]))).toBeUndefined();
    });
});

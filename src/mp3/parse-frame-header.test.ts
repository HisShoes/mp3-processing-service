import { describe, expect, it } from "bun:test";
import { getLayer, getMpegVersion, hasFrameSyncBits, parseFrameHeader } from "./parse-frame-header";

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
    it("returns metadata for valid MPEG v2 Layer 3 header", () => {
        // Sync: 0xFF, 0xE0; Version: bits 10 (0x10); Layer: bits 01 (0x02)
        // bytes[0]=0xFF, bytes[1]=0xF2 (0xE0 sync, 0x10 version, 0x02 layer)
        const bytes = new Uint8Array([0xFF, 0xF2]);
        const result = parseFrameHeader(bytes);
        expect(result).toEqual({
            mpegVersion: "MPEG_V2",
            layer: "LAYER_3",
            // protection, bitrate, sample rate, etc. are not parsed yet
        });
    });

    it("returns undefined for invalid sync bits", () => {
        const bytes = new Uint8Array([0xFE, 0xF2]);
        expect(parseFrameHeader(bytes)).toBeUndefined();
    });

    it("returns unknown for unknown layer", () => {
        const bytes = new Uint8Array([0xFF, 0xF8]);
        expect(parseFrameHeader(bytes)).toEqual({
            mpegVersion: "MPEG_V1",
            layer: "UNKNOWN"
        });
    });

    it("returns unknown for unknown mpeg version", () => {
        const bytes = new Uint8Array([0xFF, 0xE4]);
        expect(parseFrameHeader(bytes)).toEqual({
            mpegVersion: "UNKNOWN",
            layer: "LAYER_2"
        });
    });

    it("returns undefined for short buffer", () => {
        expect(parseFrameHeader(new Uint8Array([0xFF]))).toBeUndefined();
        expect(parseFrameHeader(new Uint8Array([]))).toBeUndefined();
    });
});

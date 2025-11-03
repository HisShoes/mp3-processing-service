import { describe, expect, it } from "bun:test";
import app from "./mp3";

describe("mp3 router", () => {
    describe("/file-upload", () => {
        it("returns the correct frame count for a valid file", async () => {
            const mp3SampleFile = Bun.file("./test-data/sample.mp3");
            const formData = new FormData();
            formData.append("upload", mp3SampleFile);

            const response = await app.request("/file-upload", {
                method: "POST",
                body: formData,
            });
            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.frameCount).toBe(6089);
        });


        it("returns a 400 where no file is uploaded", async () => {
            const response = await app.request("/file-upload", { method: "POST" });
            expect(response.status).toBe(400);
        });
    });
});
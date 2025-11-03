import { Hono } from 'hono';
import { countFrames } from '../mp3/count-frames';
import { getFirstFrame } from '../mp3/get-first-frame';

const app = new Hono();

app.post('/file-upload', async (c) => {
    const body = await c.req.parseBody();
    if (!body || !body['upload']) {
        return c.text("invalid request, expected an MP3 file in upload field of request", 400);
    }

    const file = body['upload'] as File;
    if (file.type !== "audio/mpeg") {
        return c.text("invalid request, expected an MP3 file in upload field of request", 400);
    }

    const buffer = await file.arrayBuffer();

    try {
        // verify the file type matches the spec
        // anything other than MPEG v1 and Layer 3 is rejected
        const firstFrame = getFirstFrame(buffer);
        if (firstFrame?.layer !== 'LAYER_3' || firstFrame.mpegVersion !== "MPEG_V1") {
            return c.text("invalid request, expected MPEG version 1 and Layer 3", 400);
        }

        const frameCount = countFrames(buffer);
        return c.body(JSON.stringify({
            frameCount
        }));
    } catch (e) {
        console.log("failed to count frames", e);
        c.text("Failed to count frames in file", 500);
    }

});

export default app;

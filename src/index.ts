import { Hono } from 'hono';
import { logger } from "hono/logger";
import mp3 from "./routes/mp3";

const app = new Hono();

app.use(logger());

app.route("/", mp3);

export default app;

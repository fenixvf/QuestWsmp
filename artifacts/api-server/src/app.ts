import express, { type RequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttpModule, { type Options as PinoHttpOptions } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const pinoHttp = pinoHttpModule as unknown as (
  options: PinoHttpOptions,
) => RequestHandler;
const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Replit mounts the API under /api, while Vercel Functions may pass the
// request path with the /api prefix already removed. Supporting both forms
// keeps the shared Express app correct in either runtime.
app.use(["/api", "/"], router);

export default app;

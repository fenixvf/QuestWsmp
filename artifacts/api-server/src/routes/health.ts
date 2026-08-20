import { Router } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import type { Request, Response } from "express-serve-static-core";

const router = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;

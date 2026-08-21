import { Router } from "express";
import type { Request, Response } from "express-serve-static-core";

const router = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;

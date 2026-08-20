import { Router, type IRouter } from "express";
import authRouter from "./auth.js";
import healthRouter from "./health.js";
import storeRouter from "./store.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(storeRouter);

export default router;

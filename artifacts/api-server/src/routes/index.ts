import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import storeRouter from "./store";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(storeRouter);

export default router;

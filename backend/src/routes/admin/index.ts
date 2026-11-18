// backend/src/routes/admin/index.ts
import { Router } from "express";
import usersRouter from "./users";
import questionsRouter from "./questions";
import optionsRouter from "./options";
import statsRouter from "./stats";

const router = Router();

// Mount sub‑routers under /admin
router.use("/users", usersRouter);
router.use("/questions", questionsRouter);
router.use("/options", optionsRouter);
router.use("/stats", statsRouter);

export default router;

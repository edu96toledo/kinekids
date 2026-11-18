// backend/src/routes/admin/questions.ts
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);
router.use(requireRole(["SuperAdmin"]));

// Create question
router.post(
  "/",
  body("text").isString().isLength({ min: 1 }),
  body("ageMinMonths").isInt({ min: 0 }),
  body("ageMaxMonths").isInt({ min: 0, max: 144 }),
  body("active").optional().isBoolean(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { text, ageMinMonths, ageMaxMonths, active } = req.body;
    if (ageMinMonths > ageMaxMonths) return res.status(400).json({ error: "ageMinMonths must be <= ageMaxMonths" });
    const q = await prisma.question.create({
      data: { text, ageMinMonths: Number(ageMinMonths), ageMaxMonths: Number(ageMaxMonths), active: active ?? true },
    });
    res.status(201).json(q);
  }
);

// List questions (optional filter by active)
router.get("/", async (req, res) => {
  const active = req.query.active ? Boolean(req.query.active) : undefined;
  const where: any = {};
  if (active !== undefined) where.active = active;
  const list = await prisma.question.findMany({ where, include: { options: true } });
  res.json(list);
});

// Update question
router.put(
  "/:id",
  param("id").isInt(),
  body("text").optional().isString(),
  body("ageMinMonths").optional().isInt({ min: 0 }),
  body("ageMaxMonths").optional().isInt({ min: 0, max: 144 }),
  body("active").optional().isBoolean(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { text, ageMinMonths, ageMaxMonths, active } = req.body;
    if (ageMinMonths && ageMaxMonths && ageMinMonths > ageMaxMonths) {
      return res.status(400).json({ error: "ageMinMonths must be <= ageMaxMonths" });
    }
    const updated = await prisma.question.update({
      where: { id: Number(id) },
      data: { text, ageMinMonths, ageMaxMonths, active },
      include: { options: true },
    });
    res.json(updated);
  }
);

// Delete question (cascades options)
router.delete(
  "/:id",
  param("id").isInt(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    await prisma.question.delete({ where: { id: Number(id) } });
    res.status(204).send();
  }
);

export default router;

// backend/src/routes/admin/options.ts
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);
router.use(requireRole(["SuperAdmin"]));

// Create option for a question
router.post(
  "/:questionId/options",
  param("questionId").isInt(),
  body("text").isString().isLength({ min: 1 }),
  body("isDefault").optional().isBoolean(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { questionId } = req.params;
    const { text, isDefault } = req.body;
    // Ensure question exists
    const q = await prisma.question.findUnique({ where: { id: Number(questionId) } });
    if (!q) return res.status(404).json({ error: "Question not found" });
    const opt = await prisma.option.create({
      data: { questionId: Number(questionId), text, isDefault: isDefault ?? false },
    });
    res.status(201).json(opt);
  }
);

// Update option
router.put(
  "/options/:id",
  param("id").isInt(),
  body("text").optional().isString(),
  body("isDefault").optional().isBoolean(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { text, isDefault } = req.body;
    const updated = await prisma.option.update({
      where: { id: Number(id) },
      data: { text, isDefault },
    });
    res.json(updated);
  }
);

// Delete option
router.delete(
  "/options/:id",
  param("id").isInt(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    await prisma.option.delete({ where: { id: Number(id) } });
    res.status(204).send();
  }
);

export default router;

// backend/src/routes/forms.ts
import { Router } from "express";
import { param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// All users with a valid token can fetch age‑appropriate questions
router.use(requireAuth);
router.use(requireRole(["Parent", "Clinician", "SuperAdmin"]));

// Helper: age in months
const ageInMonths = (birth: Date): number => {
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

// GET /api/forms/questions?childId=XYZ
router.get("/questions", async (req: AuthRequest, res) => {
  const childId = Number(req.query.childId);
  if (!childId) return res.status(400).json({ error: "childId query param required" });

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return res.status(404).json({ error: "Child not found" });

  // If Parent, ensure ownership
  if (req.user!.role === "Parent" && child.userId !== Number(req.user!.sub))
    return res.status(403).json({ error: "Forbidden" });

  const ageMonths = ageInMonths(child.birthDate);

  const questions = await prisma.question.findMany({
    where: {
      active: true,
      ageMinMonths: { lte: ageMonths },
      ageMaxMonths: { gte: ageMonths },
    },
    include: { options: true },
  });

  res.json({ ageYears: Math.floor(ageMonths / 12), ageMonths: ageMonths % 12, questions });
});

export default router;

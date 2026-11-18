// backend/src/routes/evaluations.ts
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// Helper: calculate age in months
const ageInMonths = (birth: Date): number => {
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

// All evaluation routes require auth (Parent or Clinician)
router.use(requireAuth);
router.use(requireRole(["Parent", "Clinician"]));

// Parent creates an evaluation (answers payload will be validated later)
router.post(
  "/",
  body("childId").isInt(),
  body("answers").isArray({ min: 1 }),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { childId, answers } = req.body;

    // Verify child belongs to the parent
    const child = await prisma.child.findUnique({
      where: { id: Number(childId) },
    });
    if (!child) return res.status(404).json({ error: "Child not found" });
    if (child.userId !== Number(req.user!.sub))
      return res.status(403).json({ error: "Not authorized for this child" });

    // Compute age
    const months = ageInMonths(child.birthDate);
    const ageYears = Math.floor(months / 12);
    const ageMonths = months % 12;

    // Create evaluation record
    const evalRec = await prisma.evaluation.create({
      data: {
        childId: child.id,
        evaluationDate: new Date(),
        ageYears,
        ageMonths,
        answers: {
          create: answers.map((a: any) => ({
            questionId: Number(a.questionId),
            optionId: a.optionId ? Number(a.optionId) : undefined,
            customValue: a.customValue || undefined,
          })),
        },
      },
      include: { answers: true },
    });
    res.status(201).json(evalRec);
  }
);

// Parent or Clinician list evaluations (optional filter by child)
router.get("/", async (req: AuthRequest, res) => {
  const childId = req.query.childId ? Number(req.query.childId) : undefined;
  const where: any = {};
  if (req.user!.role === "Parent") {
    // limit to own children
    const myChildren = await prisma.child.findMany({ where: { userId: Number(req.user!.sub) } });
    const ids = myChildren.map(c => c.id);
    where.childId = { in: ids };
  }
  if (childId) where.childId = childId;
  const evals = await prisma.evaluation.findMany({ where, include: { child: true } });
  res.json(evals);
});

// Get evaluation detail (including answers)
router.get(
  "/:id",
  param("id").isInt(),
  async (req: AuthRequest, res) => {
    const evalId = Number(req.params.id);
    const evalRec = await prisma.evaluation.findUnique({
      where: { id: evalId },
      include: { answers: { include: { question: true, option: true } }, child: true },
    });
    if (!evalRec) return res.status(404).json({ error: "Evaluation not found" });
    // Authorize: Parent must own the child, Clinician must be assigned (or any clinician if desired)
    if (req.user!.role === "Parent" && evalRec.child.userId !== Number(req.user!.sub))
      return res.status(403).json({ error: "Forbidden" });
    if (req.user!.role === "Clinician" && evalRec.clinicianId && evalRec.clinicianId !== Number(req.user!.sub))
      return res.status(403).json({ error: "Forbidden" });
    res.json(evalRec);
  }
);

// Clinician adds/edits notes on an evaluation
router.patch(
  "/:id/notes",
  requireRole(["Clinician"]),
  param("id").isInt(),
  body("notes").isString().isLength({ min: 1 }),
  async (req: AuthRequest, res) => {
    const evalId = Number(req.params.id);
    const { notes } = req.body;
    const evalRec = await prisma.evaluation.findUnique({ where: { id: evalId } });
    if (!evalRec) return res.status(404).json({ error: "Evaluation not found" });
    // Only allow clinician assigned to this evaluation or any clinician (policy can be refined)
    const updated = await prisma.evaluation.update({
      where: { id: evalId },
      data: { notesClinician: notes },
    });
    res.json(updated);
  }
);

export default router;

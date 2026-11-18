// backend/src/routes/children.ts
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// All child routes require authentication and Parent role
router.use(requireAuth);
router.use(requireRole(["Parent"]));

// Helper: calculate age in months from birth date
const ageInMonths = (birth: Date): number => {
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

// Create child profile (validate <= 12 years = 144 months)
router.post(
  "/",
  body("name").isString().isLength({ min: 1 }),
  body("birthDate").isISO8601(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, birthDate } = req.body;
    const ageMonths = ageInMonths(new Date(birthDate));
    if (ageMonths > 144) return res.status(400).json({ error: "Child must be 12 years or younger" });
    const child = await prisma.child.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        userId: Number(req.user!.sub),
      },
    });
    res.status(201).json(child);
  }
);

// List own children
router.get("/", async (req: AuthRequest, res) => {
  const children = await prisma.child.findMany({
    where: { userId: Number(req.user!.sub) },
    select: { id: true, name: true, birthDate: true },
  });
  res.json(children);
});

// Get child details + calculated age
router.get(
  "/:id",
  param("id").isInt(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const child = await prisma.child.findUnique({
      where: { id: Number(id), userId: Number(req.user!.sub) },
    });
    if (!child) return res.status(404).json({ error: "Child not found" });
    const months = ageInMonths(child.birthDate);
    res.json({ ...child, ageYears: Math.floor(months / 12), ageMonths: months % 12 });
  }
);

// Update child (only name & birthDate)
router.put(
  "/:id",
  param("id").isInt(),
  body("name").optional().isString(),
  body("birthDate").optional().isISO8601(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { name, birthDate } = req.body;
    if (birthDate) {
      const months = ageInMonths(new Date(birthDate));
      if (months > 144) return res.status(400).json({ error: "Child must be 12 years or younger" });
    }
    const child = await prisma.child.update({
      where: { id: Number(id), userId: Number(req.user!.sub) },
      data: { name, birthDate: birthDate ? new Date(birthDate) : undefined },
    });
    res.json(child);
  }
);

// Delete child
router.delete(
  "/:id",
  param("id").isInt(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    await prisma.child.delete({ where: { id: Number(id), userId: Number(req.user!.sub) } });
    res.status(204).send();
  }
);

export default router;

// backend/src/routes/admin/stats.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);
router.use(requireRole(["SuperAdmin"]));

// Simple global statistics endpoint
router.get("/", async (_req, res) => {
  const [userCounts, childCount, evaluationCount] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.child.count(),
    prisma.evaluation.count(),
  ]);

  const roleStats = userCounts.reduce((acc, cur) => {
    acc[cur.role] = cur._count._all;
    return acc;
  }, {} as Record<string, number>);

  res.json({ usersByRole: roleStats, totalChildren: childCount, totalEvaluations: evaluationCount });
});

export default router;

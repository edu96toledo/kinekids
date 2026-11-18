// backend/src/routes/admin/users.ts
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);
router.use(requireRole(["SuperAdmin"]));

// List users (optional filter by role)
router.get("/", async (req, res) => {
  const role = req.query.role ? (req.query.role as string) : undefined;
  const where: any = {};
  if (role) where.role = role;
  const users = await prisma.user.findMany({
    where,
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });
  res.json(users);
});

// Create user (Parent or Clinician)
router.post(
  "/",
  body("username").isString().isLength({ min: 3 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("role").isIn(["Parent", "Clinician"]),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash: hash, role: role as Role },
    });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  }
);

// Update user (username, email, role, password optional)
router.put(
  "/:id",
  param("id").isInt(),
  body("username").optional().isString(),
  body("email").optional().isEmail(),
  body("password").optional().isLength({ min: 6 }),
  body("role").optional().isIn(["Parent", "Clinician", "SuperAdmin"]),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    const data: any = {};
    if (username) data.username = username;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({ where: { id: Number(id) }, data });
    res.json({ id: updated.id, username: updated.username, role: updated.role });
  }
);

// Delete user
router.delete(
  "/:id",
  param("id").isInt(),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(204).send();
  }
);

export default router;

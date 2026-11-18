import { Router, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { CLINICIAN_RESPONSE_TEMPLATES } from "../utils/gaitEvaluator";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

/**
 * GET /api/v1/referrals/clinicians
 * Lista los kinesiólogos disponibles en la app para derivación
 */
router.get("/clinicians", async (_req: AuthRequest, res: Response) => {
  const clinicians = await prisma.user.findMany({
    where: { role: "Clinician" },
    select: {
      id: true,
      name: true,
      email: true,
      rut: true,
    },
  });
  res.json(clinicians);
});

/**
 * GET /api/v1/referrals/templates
 * Retorna las plantillas de respuesta rápida predefinidas para el kinesiólogo
 */
router.get("/templates", (_req: AuthRequest, res: Response) => {
  res.json(CLINICIAN_RESPONSE_TEMPLATES);
});

/**
 * POST /api/v1/evaluations/:id/refer
 * El padre deriva la ficha de evaluación a un Kinesiólogo seleccionado
 */
router.post(
  "/evaluations/:id/refer",
  requireRole(["Parent"]),
  param("id").isInt(),
  body("clinicianId").isInt().withMessage("Debe seleccionar un profesional kinesiólogo"),
  body("parentQuery").optional().isString(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const evalId = Number(req.params.id);
    const { clinicianId, parentQuery } = req.body;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evalId },
      include: { child: true },
    });

    if (!evaluation) return res.status(404).json({ error: "Evaluación no encontrada" });
    if (evaluation.child.userId !== Number(req.user!.sub)) {
      return res.status(403).json({ error: "No autorizado para derivar esta evaluación" });
    }

    const clinician = await prisma.user.findFirst({
      where: { id: Number(clinicianId), role: "Clinician" },
    });
    if (!clinician) return res.status(404).json({ error: "Kinesiólogo no encontrado" });

    // Actualizar evaluación con asignación y duda del padre
    const updated = await prisma.evaluation.update({
      where: { id: evalId },
      data: {
        clinicianId: Number(clinicianId),
        // En base de datos se guarda en notas o en campos dedicados
        notesClinician: parentQuery ? `[CONSULTA DEL PADRE]: ${parentQuery}` : undefined,
      },
      include: { clinician: true, child: true },
    });

    res.json({
      message: "Caso derivado exitosamente al Kinesiólogo.",
      evaluation: updated,
    });
  }
);

/**
 * GET /api/v1/clinician/cases
 * Bandeja de entrada de casos derivados para el Kinesiólogo autenticado
 */
router.get("/clinician/cases", requireRole(["Clinician", "SuperAdmin"]), async (req: AuthRequest, res: Response) => {
  const clinicianId = Number(req.user!.sub);
  
  const where: any = {};
  if (req.user!.role === "Clinician") {
    where.clinicianId = clinicianId;
  }

  const cases = await prisma.evaluation.findMany({
    where,
    include: {
      child: { include: { user: { select: { name: true, email: true, rut: true } } } },
      answers: { include: { question: true, option: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(cases);
});

/**
 * POST /api/v1/evaluations/:id/respond
 * El kinesiólogo envía una respuesta clínica ágil al padre usando plantillas o texto libre
 */
router.post(
  "/evaluations/:id/respond",
  requireRole(["Clinician", "SuperAdmin"]),
  param("id").isInt(),
  body("feedbackMessage").isString().isLength({ min: 5 }).withMessage("El mensaje de respuesta no puede estar vacío"),
  body("internalNotes").optional().isString(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const evalId = Number(req.params.id);
    const { feedbackMessage, internalNotes } = req.body;

    const evalRec = await prisma.evaluation.findUnique({ where: { id: evalId } });
    if (!evalRec) return res.status(404).json({ error: "Evaluación no encontrada" });

    // Guardar respuesta oficial y nota interna opcional
    const combinedNotes = `[RESPUESTA AL PADRE]: ${feedbackMessage}${internalNotes ? ` | [NOTA INTERNA PRIVADA]: ${internalNotes}` : ""}`;

    const updated = await prisma.evaluation.update({
      where: { id: evalId },
      data: {
        notesClinician: combinedNotes,
      },
    });

    res.json({
      message: "Respuesta clínica enviada exitosamente al padre.",
      evaluation: updated,
    });
  }
);

export default router;

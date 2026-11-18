import { Router, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

/**
 * POST /api/v1/clinical/evaluations/:id/official-response
 * El Kinesiólogo emite su dictamen clínico oficial
 */
router.post(
  "/evaluations/:id/official-response",
  requireRole(["Clinician", "SuperAdmin"]),
  param("id").isInt(),
  body("tipoResolucion")
    .isIn(["NORMAL", "OBSERVACION_TELE", "REQUIERE_PRESENCIAL"])
    .withMessage("El tipo de resolución debe ser NORMAL, OBSERVACION_TELE o REQUIERE_PRESENCIAL"),
  body("mensajeOficialPadre")
    .isString()
    .isLength({ min: 10 })
    .withMessage("El mensaje oficial para el padre debe tener al menos 10 caracteres"),
  body("requiereConsultaPresencial").isBoolean().optional(),
  body("indicacionesDomiciliarias").isString().optional(),
  body("datosContactoAgenda").isString().optional(),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const evalId = Number(req.params.id);
    const clinicianId = Number(req.user!.sub);
    const { tipoResolucion, requiereConsultaPresencial, mensajeOficialPadre, indicacionesDomiciliarias, datosContactoAgenda, notaInternaPrivada } = req.body;

    // 1. Verificar evaluación
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evalId },
      include: { child: true },
    });

    if (!evaluation) return res.status(404).json({ error: "Evaluación no encontrada." });

    const esPresencial = tipoResolucion === "REQUIERE_PRESENCIAL" || requiereConsultaPresencial === true;
    const nuevoEstado = esPresencial ? "REQUIERE_PRESENCIAL" : "REVISADO_CON_RESPUESTA";

    // 2. Crear o actualizar dictamen oficial (upsert)
    const officialResponse = await prisma.officialClinicalResponse.upsert({
      where: { evaluationId: evalId },
      create: {
        evaluationId: evalId,
        clinicianId,
        tipoResolucion,
        requiereConsultaPresencial: esPresencial,
        mensajeOficialPadre,
        indicacionesDomiciliarias: indicacionesDomiciliarias || null,
        datosContactoAgenda: datosContactoAgenda || null,
        fechaRespuesta: new Date(),
      },
      update: {
        clinicianId,
        tipoResolucion,
        requiereConsultaPresencial: esPresencial,
        mensajeOficialPadre,
        indicacionesDomiciliarias: indicacionesDomiciliarias || null,
        datosContactoAgenda: datosContactoAgenda || null,
        fechaRespuesta: new Date(),
      },
    });

    // 3. Actualizar estado de la evaluación y nota interna privada si se envió
    await prisma.evaluation.update({
      where: { id: evalId },
      data: {
        status: nuevoEstado,
        referralStatus: "Respondida",
        clinicianId,
        notesClinician: notaInternaPrivada ? notaInternaPrivada : undefined,
      },
    });

    return res.json({
      message: "Dictamen clínico oficial emitido y registrado con éxito.",
      officialResponse: {
        ...officialResponse,
        id: officialResponse.id.toString(),
        evaluationId: officialResponse.evaluationId.toString(),
        clinicianId: officialResponse.clinicianId.toString(),
      },
      nuevoEstado,
    });
  }
);

/**
 * GET /api/v1/evaluations/:id/official-response
 * Consulta el dictamen clínico oficial de una evaluación
 */
router.get("/evaluations/:id/official-response", param("id").isInt(), async (req: AuthRequest, res: Response) => {
  const evalId = Number(req.params.id);

  const officialResponse = await prisma.officialClinicalResponse.findUnique({
    where: { evaluationId: evalId },
    include: {
      clinician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          clinicAddress: true,
          clinicBookingUrl: true,
        },
      },
      evaluation: {
        include: { child: true },
      },
    },
  });

  if (!officialResponse) {
    return res.status(404).json({ error: "Aún no se ha emitido un dictamen clínico para esta evaluación." });
  }

  // Verificar pertenencia si es Parent
  if (req.user!.role === "Parent" && officialResponse.evaluation.child.userId !== Number(req.user!.sub)) {
    return res.status(403).json({ error: "No autorizado para consultar este expediente." });
  }

  return res.json({
    ...officialResponse,
    id: officialResponse.id.toString(),
    evaluationId: officialResponse.evaluationId.toString(),
    clinicianId: officialResponse.clinicianId.toString(),
  });
});

export default router;

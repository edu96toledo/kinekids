import { Router, Response } from "express";
import { param, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

/**
 * REGLAS TÉCNICAS DE MULTIMEDIA:
 * - Hasta 3 fotos (.jpg, .png, .webp) de máx 10MB cada una.
 * - Hasta 2 videos (.mp4, .mov, .webm) de máx 30 segundos o 50MB cada uno.
 */
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * POST /api/v1/evaluations/:id/media
 * Sube o registra un archivo multimedia vinculado a la evaluación
 */
router.post(
  "/:id/media",
  param("id").isInt(),
  async (req: AuthRequest, res: Response) => {
    const evalId = Number(req.params.id);
    const { tipoArchivo, categoriaVista, tituloDescriptivo, urlArchivo, nombreArchivo, mimeType, tamanoBytes, duracionSegundos } = req.body;

    // 1. Verificar existencia de la evaluación y permisos
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evalId },
      include: { child: true, media: true },
    });

    if (!evaluation) return res.status(404).json({ error: "Evaluación no encontrada." });

    // Solo el padre dueño del niño o el kinesiólogo asignado pueden subir medios
    if (req.user!.role === "Parent" && evaluation.child.userId !== Number(req.user!.sub)) {
      return res.status(403).json({ error: "No autorizado para adjuntar archivos a este paciente." });
    }

    // 2. Validar límites de cantidad (hasta 3 fotos y 2 videos)
    const existingPhotos = evaluation.media.filter(m => m.tipoArchivo === "FOTO").length;
    const existingVideos = evaluation.media.filter(m => m.tipoArchivo === "VIDEO").length;

    if (tipoArchivo === "FOTO") {
      if (existingPhotos >= 3) {
        return res.status(400).json({ error: "Límite alcanzado: Máximo 3 fotos por evaluación." });
      }
      if (!ALLOWED_PHOTO_TYPES.includes(mimeType)) {
        return res.status(400).json({ error: "Formato de imagen no permitido. Use .jpg, .png o .webp." });
      }
      if (tamanoBytes > MAX_PHOTO_BYTES) {
        return res.status(400).json({ error: "La foto supera el límite máximo de 10MB." });
      }
    } else if (tipoArchivo === "VIDEO") {
      if (existingVideos >= 2) {
        return res.status(400).json({ error: "Límite alcanzado: Máximo 2 videos cortos por evaluación." });
      }
      if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
        return res.status(400).json({ error: "Formato de video no permitido. Use .mp4, .mov o .webm." });
      }
      if (tamanoBytes > MAX_VIDEO_BYTES) {
        return res.status(400).json({ error: "El video supera el peso máximo permitido de 50MB." });
      }
      if (duracionSegundos && duracionSegundos > 30) {
        return res.status(400).json({ error: "El video supera la duración recomendada de 30 segundos." });
      }
    } else {
      return res.status(400).json({ error: "El tipo de archivo debe ser FOTO o VIDEO." });
    }

    // 3. Crear registro en evaluation_media
    const newMedia = await prisma.evaluationMedia.create({
      data: {
        evaluationId: evalId,
        tipoArchivo,
        categoriaVista: categoriaVista || "FRENTE",
        tituloDescriptivo: tituloDescriptivo || (tipoArchivo === "VIDEO" ? "Video de marcha" : "Foto de apoyo"),
        urlArchivo,
        nombreArchivo,
        mimeType,
        tamanoBytes: BigInt(tamanoBytes),
        duracionSegundos: duracionSegundos ? Number(duracionSegundos) : null,
      },
    });

    return res.status(201).json({
      message: "Evidencia multimedia adjuntada exitosamente.",
      media: {
        ...newMedia,
        id: newMedia.id.toString(),
        evaluationId: newMedia.evaluationId.toString(),
        tamanoBytes: newMedia.tamanoBytes.toString(),
      },
    });
  }
);

/**
 * GET /api/v1/evaluations/:id/media
 * Obtiene la galería multimedia de una evaluación
 */
router.get("/:id/media", param("id").isInt(), async (req: AuthRequest, res: Response) => {
  const evalId = Number(req.params.id);

  const mediaList = await prisma.evaluationMedia.findMany({
    where: { evaluationId: evalId },
    orderBy: { createdAt: "asc" },
  });

  const formatted = mediaList.map(m => ({
    ...m,
    id: m.id.toString(),
    evaluationId: m.evaluationId.toString(),
    tamanoBytes: m.tamanoBytes.toString(),
  }));

  return res.json(formatted);
});

/**
 * DELETE /api/v1/evaluations/media/:mediaId
 * Elimina un archivo multimedia
 */
router.delete("/media/:mediaId", param("mediaId").isInt(), async (req: AuthRequest, res: Response) => {
  const mediaId = Number(req.params.mediaId);

  const media = await prisma.evaluationMedia.findUnique({
    where: { id: mediaId },
    include: { evaluation: { include: { child: true } } },
  });

  if (!media) return res.status(404).json({ error: "Archivo multimedia no encontrado." });

  // Solo el dueño puede eliminar
  if (req.user!.role === "Parent" && media.evaluation.child.userId !== Number(req.user!.sub)) {
    return res.status(403).json({ error: "No autorizado para eliminar este archivo." });
  }

  await prisma.evaluationMedia.delete({ where: { id: mediaId } });

  return res.json({ message: "Archivo multimedia eliminado con éxito." });
});

export default router;

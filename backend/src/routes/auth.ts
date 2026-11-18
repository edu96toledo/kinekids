import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";
import { cleanRut, validateRut, detectIdentifierType } from "../utils/rutValidator";

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /api/v1/auth/login
 * Inicio de sesión dual (RUT o Correo Electrónico)
 */
router.post(
  "/login",
  body("identificador").notEmpty().withMessage("Debe ingresar su RUT o Correo Electrónico"),
  body("password").notEmpty().withMessage("Debe ingresar su contraseña"),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identificador, password } = req.body;
    const type = detectIdentifierType(identificador);

    let user = null;

    if (type === "EMAIL") {
      const emailNormalizado = identificador.trim().toLowerCase();
      user = await prisma.user.findFirst({
        where: { email: emailNormalizado },
      });
    } else if (type === "RUT") {
      const rutLimpio = cleanRut(identificador);
      if (!validateRut(rutLimpio)) {
        return res.status(400).json({ error: "El RUT ingresado no es válido (dígito verificador incorrecto)." });
      }
      user = await prisma.user.findFirst({
        where: { rut: rutLimpio },
      });
    } else {
      // Intento fallback: buscar por email o por rut limpio directamente
      const rutLimpio = cleanRut(identificador);
      const emailNormalizado = identificador.trim().toLowerCase();
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: emailNormalizado },
            { rut: rutLimpio }
          ]
        }
      });
    }

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas. Verifique su RUT/Correo y contraseña." });
    }

    // Comprobación de contraseña encriptada con bcrypt
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas. Verifique su RUT/Correo y contraseña." });
    }

    // Generar Token JWT con información del usuario y su Rol
    const secret = process.env.JWT_SECRET || "kine_secret_fallback_key";
    const token = jwt.sign(
      {
        sub: user.id.toString(),
        rut: user.rut,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        rut: user.rut,
        role: user.role,
      },
    });
  }
);

/**
 * POST /api/v1/auth/register
 * Registro de Padres/Kinesiólogos con RUT y/o Email
 */
router.post(
  "/register",
  body("name").isString().isLength({ min: 2 }).withMessage("El nombre es obligatorio"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres"),
  body("role").isIn(["Parent", "Clinician"]).withMessage("El rol debe ser Parent o Clinician"),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, rut, password, role } = req.body;

    // Al menos uno de los dos debe estar presente
    if (!email && !rut) {
      return res.status(400).json({ error: "Debe proporcionar al menos un RUT o un Correo Electrónico para registrarse." });
    }

    let rutLimpio: string | null = null;
    if (rut) {
      rutLimpio = cleanRut(rut);
      if (!validateRut(rutLimpio)) {
        return res.status(400).json({ error: "El RUT ingresado no es válido." });
      }
    }

    let emailNormalizado: string | null = null;
    if (email) {
      emailNormalizado = email.trim().toLowerCase();
    }

    // Verificar si ya existe el usuario por RUT o Email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(emailNormalizado ? [{ email: emailNormalizado }] : []),
          ...(rutLimpio ? [{ rut: rutLimpio }] : [])
        ]
      }
    });

    if (existing) {
      if (emailNormalizado && existing.email === emailNormalizado) {
        return res.status(409).json({ error: "El correo electrónico ya se encuentra registrado." });
      }
      if (rutLimpio && existing.rut === rutLimpio) {
        return res.status(409).json({ error: "El RUT ya se encuentra registrado en el sistema." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email: emailNormalizado,
          rut: rutLimpio,
          passwordHash: hashedPassword,
          role: role as Role,
        },
      });

      return res.status(201).json({
        message: "Usuario registrado con éxito",
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          rut: user.rut,
          role: user.role,
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: "Error al registrar el usuario: " + e.message });
    }
  }
);

export default router;

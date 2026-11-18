import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de base de datos...");

  // Hash para la contraseña requerida '123456789'
  const passwordHash = await bcrypt.hash("123456789", 10);

  // 1. Crear o actualizar la cuenta Maestra de Super Administrador
  const superAdmin = await prisma.user.upsert({
    where: { email: "toledoordenes1920@gmail.com" },
    update: {
      passwordHash,
      role: Role.SuperAdmin,
    },
    create: {
      name: "Super Administrador",
      email: "toledoordenes1920@gmail.com",
      rut: "192019204", // RUT de prueba 19.201.920-4
      passwordHash,
      role: Role.SuperAdmin,
    },
  });
  console.log("Cuenta Maestra SuperAdmin creada/actualizada:", superAdmin.email);

  // 2. Kinesiólogo de prueba
  await prisma.user.upsert({
    where: { email: "msilva@clinica.cl" },
    update: {},
    create: {
      name: "Dr. Matías Silva (Kinesiólogo)",
      email: "msilva@clinica.cl",
      rut: "18456123K",
      passwordHash,
      role: Role.Clinician,
    },
  });

  // 3. Padre / Tutor de prueba
  await prisma.user.upsert({
    where: { email: "carolina@gmail.com" },
    update: {},
    create: {
      name: "Carolina Toledo (Madre)",
      email: "carolina@gmail.com",
      rut: "178904562",
      passwordHash,
      role: Role.Parent,
    },
  });

  console.log("Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

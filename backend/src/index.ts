import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";
import authRouter from "./routes/auth";
import childrenRouter from "./routes/children";
import evaluationRouter from "./routes/evaluations";
import adminRouter from "./routes/admin";
import formRouter from "./routes/forms";
import referralsRouter from "./routes/referrals";
import mediaRouter from "./routes/media";
import clinicalVerdictRouter from "./routes/clinicalVerdict";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(cors());
app.use(json());

// Servir archivos estáticos del frontend si existen
app.use(express.static("public"));

// Rutas de API v1
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/children", childrenRouter);
app.use("/api/v1/evaluations", evaluationRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/forms", formRouter);
app.use("/api/v1/referrals", referralsRouter);
app.use("/api/v1/evaluations", mediaRouter);
app.use("/api/v1/clinical", clinicalVerdictRouter);

// Manejador centralizado de errores
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor KineGait escuchando en http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "dotenv";
import serverless from "serverless-http"; // ✅ Needed for Vercel

import promisePool from "./config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import companiesRoutes from "./src/routes/companiesRoutes.js";
import letterRoutes from "./src/routes/lettersRoutes.js";
import pdfRoutes from "./src/routes/pdfRoutes.js";
import auditListsRoutes from "./src/routes/auditListsRoutes.js";
import auditListCompaniesRoutes from "./src/routes/auditListCompaniesRoutes.js";
// testing
config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Register routes
app.use("/users", userRoutes);
app.use("/companies", companiesRoutes);
app.use("/letters", letterRoutes);
app.use("/pdf", pdfRoutes);
app.use("/audit-lists", auditListsRoutes);
app.use("/audit-list-companies", auditListCompaniesRoutes);

export const handler = serverless(app);

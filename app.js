import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "dotenv";

import promisePool from "./config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import companiesRoutes from "./src/routes/companiesRoutes.js";
import letterRoutes from "./src/routes/lettersRoutes.js";
import pdfRoutes from "./src/routes/pdfRoutes.js";
import auditListsRoutes from "./src/routes/auditListsRoutes.js";
import auditListCompaniesRoutes from "./src/routes/auditListCompaniesRoutes.js";
import auditInProgressRoutes from "./src/routes/auditInProgressRoutes.js";

// Load environment variables
config();

const app = express();

// ✅ Allow both localhost and Vercel frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://audit-crm-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/users", userRoutes);
app.use("/companies", companiesRoutes);
app.use("/letters", letterRoutes);
app.use("/pdf", pdfRoutes);
app.use("/audit-lists", auditListsRoutes);
app.use("/audit-list-companies", auditListCompaniesRoutes);
app.use("/audit-in-progress", auditInProgressRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

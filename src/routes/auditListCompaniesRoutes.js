// src/routes/auditListCompanies.js
import express from "express";
import {
  getAllAuditListCompanies,
  getAuditListCompanyById,
  getCompaniesByAuditListId,
  createAuditListCompany,
  deleteAuditListCompany,
  updateAuditListCompany,
} from "../controllers/auditListCompaniesController.js";

import { authenticate, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();

// 🔓 Public routes
router.get("/", getAllAuditListCompanies);
router.get("/audit/:audit_list_id", getCompaniesByAuditListId);
router.put("/:id", updateAuditListCompany);

// 🔐 Protected routes
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "user"),
  getAuditListCompanyById
);

router.post(
  "/",

  createAuditListCompany
);

router.delete("/:id", deleteAuditListCompany);

export default router;

import express from "express";
import {
  getAllAuditInProgress,
  getAuditInProgressById,
  getAuditInProgressByCompanyId,
  createAuditInProgress,
  updateAuditInProgress,
  deleteAuditInProgress,
} from "../controllers/auditInProgressController.js";

import { authenticate, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", getAllAuditInProgress);
router.get("/company/:company_id", getAuditInProgressByCompanyId);
router.put("/:id", updateAuditInProgress);

router.get("/:id", getAuditInProgressById);

router.post("/", createAuditInProgress);

router.delete("/:id", deleteAuditInProgress);

export default router;

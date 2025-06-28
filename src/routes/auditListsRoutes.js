// src/routes/auditLists.js
import express from "express";
import {
  getAllAuditYears,
  getAuditYearById,
  getAuditYearByYear,
  createAuditYear,
  deleteAuditYear,
} from "../controllers/auditListsController.js";

import { authenticate, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();

// 🔓 Public routes
router.get("/", getAllAuditYears);
router.get("/year/:year", getAuditYearByYear);

// 🔐 Protected routes
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "user"),
  getAuditYearById
);

router.post("/", createAuditYear);

router.delete("/:id", authenticate, authorizeRoles("admin"), deleteAuditYear);

export default router;

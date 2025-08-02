import express from "express";
import {
  getCompanyById,
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companiesController.js";

import { authenticate, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllCompanies); // List all companies
router.post("/", createCompany); // Create new company

// Protected routes
router.get(
  "/:id",
  // authenticate,
  // authorizeRoles("admin", "user"),
  getCompanyById
);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;

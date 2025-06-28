// src/routes/letters.js
import express from "express";
import {
  getLetterById,
  getAllLetters,
  getLettersByCompanyId,
  createLetter,
  updateLetter,
  deleteLetter,
  createLettersBulk,
  generateAndStoreLetters,
  getLettersByYear,
  exportExcel,
} from "../controllers/lettersController.js";

import { authenticate, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllLetters); // List all letters
router.post("/", createLetter); // Create new letter
router.post("/bulk", createLettersBulk);

router.post("/export-excel", exportExcel);

// Get all letters for a specific company
router.get(
  "/company/:companyId",
  authenticate,
  authorizeRoles("admin", "user"),
  getLettersByCompanyId
);

// Protected routes
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "user"),
  getLetterById
);
router.put("/:id", authenticate, authorizeRoles("admin"), updateLetter);
// router.delete("/:id", authenticate, authorizeRoles("admin"), deleteLetter);
router.delete("/company/:companyId/year/:year", deleteLetter);
router.post("/generate-bulk", generateAndStoreLetters);
router.get("/year/:year", getLettersByYear);

export default router;

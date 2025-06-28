import express from "express";
import {
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getAllUsers,
} from "../controllers/userController.js";

import { authenticate, authorizeRoles } from "../../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", getAllUsers);

// Protected routes - example: only authenticated users can access
router.get("/:id", authenticate, authorizeRoles("admin", "user"), getUserById);
router.get(
  "/username/:username",
  authenticate,
  authorizeRoles("admin", "user"),
  getUserByUsername
);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

import User from "../models/User.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signJwt } from "../../utils/jwt.js";

// Get user by ID (no password sent)
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (user) {
      res.send({ status: "ok", data: user });
    } else {
      res.send({ status: "error", data: "User not found" });
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.send({ status: "error", data: "Error retrieving user" });
  }
};

// Get user by username (no password sent)
const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findByUsername(username);
    if (user) {
      // exclude password before sending
      const { password, ...userWithoutPassword } = user;
      res.send({ status: "ok", data: userWithoutPassword });
    } else {
      res.send({ status: "error", data: "User not found" });
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.send({ status: "error", data: "Error retrieving user" });
  }
};

// Get all users (excluding passwords)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // Assumes this returns an array of user objects
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.send({ status: "ok", data: usersWithoutPasswords });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).send({ status: "error", data: "Error retrieving users" });
  }
};

// Create user with hashed password
const createUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res
        .status(400)
        .send({ status: "error", data: "Username already taken" });
    }

    const hashedPassword = await hashPassword(password);
    const userId = await User.create(username, hashedPassword, role || "user");

    res.send({ status: "ok", data: `User created with ID ${userId}` });
  } catch (error) {
    console.error("Error creating user:", error);
    res.send({ status: "error", data: "Error creating user" });
  }
};

// Update user info
const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // If password is included, hash it before updating
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    await User.update(id, updateData);
    res.send({ status: "ok", data: "User updated" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.send({ status: "error", data: "Error updating user" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.delete(id);
    res.send({ status: "ok", data: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.send({ status: "error", data: "Error deleting user" });
  }
};

// New: Login user and return JWT
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res
        .status(401)
        .send({ status: "error", data: "Invalid credentials" });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .send({ status: "error", data: "Invalid credentials" });
    }

    const token = signJwt({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // exclude password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    res.send({
      status: "ok",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ status: "error", data: "Login failed" });
  }
};

export {
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getAllUsers,
};

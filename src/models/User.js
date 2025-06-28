import getDB from "../../config/db.js";

class User {
  static async findById(id) {
    const pool = getDB();
    try {
      const [rows] = await pool.query(
        "SELECT id, username, role FROM users WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(error);
      throw new Error("Error finding user by ID");
    }
  }

  static async findByUsername(username) {
    const pool = getDB();
    try {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(error);
      throw new Error("Error finding user by username");
    }
  }

  static async findAll() {
    const pool = getDB();
    try {
      const [rows] = await pool.query("SELECT id, username, role FROM users");
      return rows;
    } catch (error) {
      console.error(error);
      throw new Error("Error retrieving all users");
    }
  }

  static async create(username, password, role = "user") {
    const pool = getDB();
    try {
      const [result] = await pool.query(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, password, role]
      );
      return result.insertId;
    } catch (error) {
      console.error(error);
      throw new Error("Error creating user");
    }
  }

  static async update(id, updateData) {
    const pool = getDB();
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      throw new Error("No data provided to update");
    }

    let query = `UPDATE users SET `;
    query += keys.map((key) => `${key} = ?`).join(", ");
    query += ` WHERE id = ?`;
    values.push(id);

    try {
      await pool.query(query, values);
    } catch (error) {
      console.error(error);
      throw new Error("Error updating user");
    }
  }

  static async delete(id) {
    const pool = getDB();
    try {
      await pool.query("DELETE FROM users WHERE id = ?", [id]);
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting user");
    }
  }
}

export default User;

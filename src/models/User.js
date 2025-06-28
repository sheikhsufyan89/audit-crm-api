import promisePool from "../../config/db.js"; // Adjust path as needed

class User {
  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        "SELECT id, username, role FROM users WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding user by ID");
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding user by username");
    }
  }
  static async findAll() {
    try {
      const [rows] = await promisePool.query(
        "SELECT id, username, role FROM users"
      );
      return rows;
    } catch (error) {
      throw new Error("Error retrieving all users");
    }
  }

  static async create(username, password, role = "user") {
    try {
      const [result] = await promisePool.query(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, password, role]
      );
      return result.insertId;
    } catch (error) {
      throw new Error("Error creating user");
    }
  }

  static async update(id, updateData) {
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
      await promisePool.query(query, values);
    } catch (error) {
      throw new Error("Error updating user");
    }
  }

  static async delete(id) {
    try {
      await promisePool.query("DELETE FROM users WHERE id = ?", [id]);
    } catch (error) {
      throw new Error("Error deleting user");
    }
  }
}

export default User;

import promisePool from "../../config/db.js";

class AuditLists {
  static async findAll() {
    try {
      const [rows] = await promisePool.query("SELECT * FROM audit_lists");
      return rows;
    } catch (error) {
      throw new Error("Error retrieving all audit years");
    }
  }

  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM audit_lists WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding audit year by ID");
    }
  }

  static async findByYear(year) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM audit_lists WHERE year = ?",
        [year]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding audit year by year");
    }
  }

  static async create(year) {
    try {
      const [result] = await promisePool.query(
        "INSERT INTO audit_lists (year) VALUES (?)",
        [year]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("This year already exists in audit list");
      }
      throw new Error("Error creating audit year");
    }
  }

  static async delete(id) {
    try {
      await promisePool.query("DELETE FROM audit_lists WHERE id = ?", [id]);
    } catch (error) {
      throw new Error("Error deleting audit year");
    }
  }
}

export default AuditLists;

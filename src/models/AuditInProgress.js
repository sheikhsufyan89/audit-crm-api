import promisePool from "../../config/db.js";

class AuditInProgress {
  static async findAll() {
    try {
      const [rows] = await promisePool.query("SELECT * FROM audit_in_progress");
      return rows;
    } catch (error) {
      throw new Error("Error retrieving all audit in progress entries");
    }
  }

  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM audit_in_progress WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding audit in progress by ID");
    }
  }

  static async findByCompanyId(companyId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT aip.*, c.name AS company_name
         FROM audit_in_progress aip
         JOIN companies c ON aip.company_id = c.id
         WHERE aip.company_id = ?`,
        [companyId]
      );
      return rows;
    } catch (error) {
      throw new Error("Error finding audit in progress by company ID");
    }
  }

  static async create(data) {
    const {
      company_id,
      client,
      audit_started,
      audit_completed,
      invoice_issued,
      fee_received,
    } = data;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO audit_in_progress (
          company_id, client, audit_started, audit_completed, invoice_issued, fee_received
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          company_id,
          client,
          audit_started,
          audit_completed,
          invoice_issued,
          fee_received,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw new Error("Error creating audit in progress entry");
    }
  }

  static async update(id, data) {
    const {
      company_id, // may be undefined (correctly), see controller
      client,
      audit_started,
      audit_completed,
      invoice_issued,
      fee_received,
    } = data;

    try {
      const [result] = await promisePool.query(
        `UPDATE audit_in_progress SET
        client = ?,
        audit_started = ?,
        audit_completed = ?,
        invoice_issued = ?,
        fee_received = ?
       WHERE id = ?`,
        [
          client,
          audit_started,
          audit_completed,
          invoice_issued,
          fee_received,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("MySQL Update Error:", error); // ⬅️ THIS IS THE KEY LINE
      throw new Error("Error updating audit in progress entry");
    }
  }

  static async delete(id) {
    try {
      await promisePool.query("DELETE FROM audit_in_progress WHERE id = ?", [
        id,
      ]);
    } catch (error) {
      throw new Error("Error deleting audit in progress entry");
    }
  }
}

export default AuditInProgress;

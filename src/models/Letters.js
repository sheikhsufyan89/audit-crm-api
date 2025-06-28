// src/models/Letter.js
import promisePool from "../../config/db.js";

class Letter {
  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM letters WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding letter by ID");
    }
  }

  static async findAll() {
    try {
      const [rows] = await promisePool.query("SELECT * FROM letters");
      return rows;
    } catch (error) {
      throw new Error("Error retrieving all letters");
    }
  }

  static async findByCompanyId(companyId) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM letters WHERE company_id = ?",
        [companyId]
      );
      return rows;
    } catch (error) {
      throw new Error("Error retrieving letters by company ID");
    }
  }

  static async createBulk(letterArray) {
    if (!Array.isArray(letterArray) || letterArray.length === 0) {
      throw new Error("Invalid input for bulk letter creation");
    }

    // Sanitize and transform data into array of arrays
    const values = letterArray.map((letter) => [
      letter.company_id,
      letter.letter_type,
      letter.year,
      letter.pdf_path,
    ]);

    try {
      const [result] = await promisePool.query(
        `
      INSERT INTO letters (company_id, letter_type, year, pdf_path)
      VALUES ${values.map(() => "(?, ?, ?, ?)").join(", ")}
    `,
        values.flat()
      );

      return result;
    } catch (error) {
      console.error("SQL ERROR:", error);
      throw new Error("Error inserting letters in bulk");
    }
  }

  static async create(data) {
    const { company_id, letter_type, year, pdf_path = null } = data;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO letters (company_id, letter_type, year, pdf_path)
         VALUES (?, ?, ?, ?)`,
        [company_id, letter_type, year, pdf_path]
      );
      return result.insertId;
    } catch (error) {
      throw new Error("Error creating letter");
    }
  }

  static async update(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      throw new Error("No data provided to update");
    }

    let query = `UPDATE letters SET `;
    query += keys.map((key) => `${key} = ?`).join(", ");
    query += ` WHERE id = ?`;
    values.push(id);

    try {
      await promisePool.query(query, values);
    } catch (error) {
      throw new Error("Error updating letter");
    }
  }

  static async delete(id) {
    try {
      await promisePool.query("DELETE FROM letters WHERE id = ?", [id]);
    } catch (error) {
      throw new Error("Error deleting letter");
    }
  }
  static async deleteByCompanyIdAndYear(companyId, year) {
    try {
      await promisePool.query(
        "DELETE FROM letters WHERE company_id = ? AND year = ?",
        [companyId, year]
      );
    } catch (error) {
      throw new Error("Error deleting letter by company ID and year");
    }
  }

  static async findByYear(year) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM letters WHERE year = ?",
        [year]
      );
      return rows;
    } catch (error) {
      throw new Error("Error retrieving letters by year");
    }
  }
  static async findByCompanyIdAndYear(companyId, year) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM letters WHERE company_id = ? AND year = ?",
        [companyId, year]
      );
      return rows;
    } catch (error) {
      throw new Error("Error retrieving letters by year and company_id");
    }
  }

  static async findCompanyExportRowsByAuditListId(auditListId) {
    try {
      const [rows] = await promisePool.query(
        `
      SELECT
        c.name,
        c.pic_listed,
        c.pic_not_listed,
        c.lsc,
        c.msc,
        c.ssc,
        c.others,
        c.nature_of_business,
        c.name_of_parent,
        c.investments_in,
        alc.prior_year_restatement,
        alc.name_of_engagement_partner,
        alc.audit_partner_since,
        alc.eqc_reviewer,
        alc.eqc_reviewer_since,
        alc.other_service_provided,
        alc.consent_obtained,
        alc.latest_audit_report_issued,
        alc.last_audit_report_modified,
        alc.material_uncertainty,
        alc.paid_up_capital,
        alc.turnover,
        alc.profit_after_tax,
        alc.no_of_employees,
        alc.total_assets,
        alc.total_hours_spent_on_engagement,
        alc.engagement_partner_hours,
        alc.eqc_reviewer_hours_spent,
        alc.remarks
      FROM audit_list_companies alc
      INNER JOIN companies c ON alc.company_id = c.id
      WHERE alc.audit_list_id = ?
      `,
        [auditListId]
      );
      return rows;
    } catch (error) {
      console.error("SQL error in findCompanyExportRowsByAuditListId:", error);
      throw new Error("Error retrieving export data for audit list");
    }
  }
}

export default Letter;

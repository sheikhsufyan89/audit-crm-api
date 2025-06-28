// src/models/AuditListCompanies.js
import promisePool from "../../config/db.js";

class AuditListCompanies {
  static async findByAuditListAndCompany(auditListId, companyId) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM audit_list_companies WHERE audit_list_id = ? AND company_id = ?",
        [auditListId, companyId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error checking for existing audit list company entry");
    }
  }

  static async findAll() {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM audit_list_companies"
      );
      return rows;
    } catch (error) {
      throw new Error("Error retrieving all audit list companies");
    }
  }

  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM audit_list_companies WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding audit list company by ID");
    }
  }

  static async findByAuditListId(auditListId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT 
         alc.*, 
         c.name AS company_name 
       FROM audit_list_companies alc
       JOIN companies c ON alc.company_id = c.id
       WHERE alc.audit_list_id = ?`,
        [auditListId]
      );
      return rows;
    } catch (error) {
      throw new Error("Error finding companies by audit list ID");
    }
  }

  static async create(data) {
    const {
      audit_list_id,
      company_id,
      prior_year_restatement,
      name_of_engagement_partner,
      audit_partner_since,
      eqc_reviewer,
      eqc_reviewer_since,
      other_service_provided,
      consent_obtained,
      latest_audit_report_issued,
      last_audit_report_modified,
      material_uncertainty,
      paid_up_capital,
      turnover,
      profit_after_tax,
      no_of_employees,
      total_assets,
      total_hours_spent_on_engagement,
      engagement_partner_hours,
      eqc_reviewer_hours_spent,
      remarks,
    } = data;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO audit_list_companies (
          audit_list_id, company_id, prior_year_restatement, name_of_engagement_partner,
          audit_partner_since, eqc_reviewer, eqc_reviewer_since, other_service_provided,
          consent_obtained, latest_audit_report_issued, last_audit_report_modified,
          material_uncertainty, paid_up_capital, turnover, profit_after_tax,
          no_of_employees, total_assets, total_hours_spent_on_engagement,
          engagement_partner_hours, eqc_reviewer_hours_spent, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          audit_list_id,
          company_id,
          prior_year_restatement,
          name_of_engagement_partner,
          audit_partner_since,
          eqc_reviewer,
          eqc_reviewer_since,
          other_service_provided,
          consent_obtained,
          latest_audit_report_issued,
          last_audit_report_modified,
          material_uncertainty,
          paid_up_capital,
          turnover,
          profit_after_tax,
          no_of_employees,
          total_assets,
          total_hours_spent_on_engagement,
          engagement_partner_hours,
          eqc_reviewer_hours_spent,
          remarks,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw new Error("Error creating audit list company entry");
    }
  }
  static async update(id, data) {
    const {
      audit_list_id,
      prior_year_restatement,
      name_of_engagement_partner,
      audit_partner_since,
      eqc_reviewer,
      eqc_reviewer_since,
      other_service_provided,
      consent_obtained,
      latest_audit_report_issued,
      last_audit_report_modified,
      material_uncertainty,
      paid_up_capital,
      turnover,
      profit_after_tax,
      no_of_employees,
      total_assets,
      total_hours_spent_on_engagement,
      engagement_partner_hours,
      eqc_reviewer_hours_spent,
      remarks,
    } = data;

    try {
      const [result] = await promisePool.query(
        `UPDATE audit_list_companies SET
        audit_list_id = ?, 
        prior_year_restatement = ?, 
        name_of_engagement_partner = ?, 
        audit_partner_since = ?, 
        eqc_reviewer = ?, 
        eqc_reviewer_since = ?, 
        other_service_provided = ?, 
        consent_obtained = ?, 
        latest_audit_report_issued = ?, 
        last_audit_report_modified = ?, 
        material_uncertainty = ?, 
        paid_up_capital = ?, 
        turnover = ?, 
        profit_after_tax = ?, 
        no_of_employees = ?, 
        total_assets = ?, 
        total_hours_spent_on_engagement = ?, 
        engagement_partner_hours = ?, 
        eqc_reviewer_hours_spent = ?, 
        remarks = ?
      WHERE id = ?`,
        [
          audit_list_id,
          prior_year_restatement,
          name_of_engagement_partner,
          audit_partner_since,
          eqc_reviewer,
          eqc_reviewer_since,
          other_service_provided,
          consent_obtained,
          latest_audit_report_issued,
          last_audit_report_modified,
          material_uncertainty,
          paid_up_capital,
          turnover,
          profit_after_tax,
          no_of_employees,
          total_assets,
          total_hours_spent_on_engagement,
          engagement_partner_hours,
          eqc_reviewer_hours_spent,
          remarks,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error updating audit list company entry");
    }
  }

  static async delete(id) {
    try {
      await promisePool.query("DELETE FROM audit_list_companies WHERE id = ?", [
        id,
      ]);
    } catch (error) {
      throw new Error("Error deleting audit list company");
    }
  }
}

export default AuditListCompanies;

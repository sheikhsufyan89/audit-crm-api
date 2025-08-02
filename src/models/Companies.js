import promisePool from "../../config/db.js"; // Adjust path as needed

class Company {
  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        "SELECT * FROM companies WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error("Error finding company by ID");
    }
  }

  static async findAll() {
    try {
      const [rows] = await promisePool.query("SELECT * FROM companies");
      return rows;
    } catch (error) {
      throw new Error("Error retrieving all companies");
    }
  }

  static async create(data) {
    const {
      name,
      pic_listed = false,
      pic_not_listed = false,
      lsc = false,
      msc = false,
      ssc = false,
      others = false,
      nature_of_business = null,
      name_of_parent = null,
      investments_in = null,
    } = data;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO companies 
         (name, pic_listed, pic_not_listed, lsc, msc, ssc, others, 
          nature_of_business, name_of_parent, investments_in)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          pic_listed,
          pic_not_listed,
          lsc,
          msc,
          ssc,
          others,
          nature_of_business,
          name_of_parent,
          investments_in,
        ]
      );
      return result.insertId;
    } catch (error) {
      throw new Error("Error creating company");
    }
  }

  static async update(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      throw new Error("No data provided to update");
    }

    let query = `UPDATE companies SET `;
    query += keys.map((key) => `${key} = ?`).join(", ");
    query += ` WHERE id = ?`;
    values.push(id);

    try {
      await promisePool.query(query, values);
    } catch (error) {
      throw new Error("Error updating company");
    }
  }

  static async delete(id) {
    const conn = await promisePool.getConnection();
    try {
      await conn.beginTransaction();

      // Delete dependent records first
      await conn.query("DELETE FROM letters WHERE company_id = ?", [id]);
      await conn.query("DELETE FROM audit_in_progress WHERE company_id = ?", [
        id,
      ]);
      // Add other dependent deletions here if needed

      // Now delete the company
      await conn.query("DELETE FROM companies WHERE id = ?", [id]);

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error("Failed to delete company:", error);
      throw new Error("Error deleting company");
    } finally {
      conn.release();
    }
  }
}

export default Company;

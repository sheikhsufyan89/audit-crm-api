// src/controllers/AuditListCompaniesController.js

import AuditListCompanies from "../models/AuditListCompanies.js";
import Companies from "../models/Companies.js";

// Update an audit list company entry
const updateAuditListCompany = async (req, res) => {
  const { id } = req.params;
  const updatedFields = { ...req.body };

  try {
    const existing = await AuditListCompanies.findById(id);

    if (!existing) {
      return res.status(404).send({
        status: "error",
        data: "Audit list company not found",
      });
    }

    // Prevent company_id from being updated
    delete updatedFields.company_id;

    await AuditListCompanies.update(id, updatedFields);
    const updatedEntry = await AuditListCompanies.findById(id);

    // Attach company name
    const company = await Companies.findById(updatedEntry.company_id);
    updatedEntry.company_name = company?.name || "Unknown";

    res.send({ status: "ok", data: updatedEntry });
  } catch (error) {
    console.error("Error updating audit list company:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error updating audit list company" });
  }
};

// Get all audit list company entries
const getAllAuditListCompanies = async (req, res) => {
  try {
    const companies = await AuditListCompanies.findAll();
    res.send({ status: "ok", data: companies });
  } catch (error) {
    console.error("Error fetching audit list companies:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error fetching audit list companies" });
  }
};

// Get a single audit list company entry by ID
const getAuditListCompanyById = async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await AuditListCompanies.findById(id);
    if (entry) {
      res.send({ status: "ok", data: entry });
    } else {
      res
        .status(404)
        .send({ status: "error", data: "Audit list company not found" });
    }
  } catch (error) {
    console.error("Error fetching audit list company by ID:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error fetching audit list company" });
  }
};

// Get all companies for a specific audit list
const getCompaniesByAuditListId = async (req, res) => {
  const { audit_list_id } = req.params;
  try {
    const rows = await AuditListCompanies.findByAuditListId(audit_list_id);
    res.send({ status: "ok", data: rows });
  } catch (error) {
    console.error("Error fetching companies for audit list:", error);
    res.status(500).send({
      status: "error",
      data: "Error fetching companies for audit list",
    });
  }
};

// Create a new audit list company entry
const createAuditListCompany = async (req, res) => {
  const { audit_list_id, company_id } = req.body;

  try {
    // Check for duplicate
    const existing = await AuditListCompanies.findByAuditListAndCompany(
      audit_list_id,
      company_id
    );

    if (existing) {
      return res.status(400).send({
        status: "error",
        data: "This company has already been added to the audit list.",
      });
    }

    // Create the new audit list company entry
    const id = await AuditListCompanies.create(req.body);
    const newEntry = await AuditListCompanies.findById(id);

    // 🔥 Fetch company details to attach name
    const company = await Companies.findById(company_id);
    newEntry.company_name = company.name;

    res.status(201).send({ status: "ok", data: newEntry });
  } catch (error) {
    console.error("Error creating audit list company:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error creating audit list company" });
  }
};

// Delete an audit list company entry
const deleteAuditListCompany = async (req, res) => {
  const { id } = req.params;

  try {
    await AuditListCompanies.delete(id);
    res.send({
      status: "ok",
      data: `Audit list company with ID ${id} deleted`,
    });
  } catch (error) {
    console.error("Error deleting audit list company:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error deleting audit list company" });
  }
};

export {
  getAllAuditListCompanies,
  getAuditListCompanyById,
  getCompaniesByAuditListId,
  createAuditListCompany,
  deleteAuditListCompany,
  updateAuditListCompany,
};

import AuditInProgress from "../models/AuditInProgress.js";
import Companies from "../models/Companies.js";

// Get all audit in progress entries
const getAllAuditInProgress = async (req, res) => {
  try {
    const rows = await AuditInProgress.findAll();
    res.send({ status: "ok", data: rows });
  } catch (error) {
    console.error("Error fetching audit in progress entries:", error);
    res.status(500).send({
      status: "error",
      data: "Error fetching audit in progress entries",
    });
  }
};

// Get a single audit in progress entry by ID
const getAuditInProgressById = async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await AuditInProgress.findById(id);
    if (entry) {
      res.send({ status: "ok", data: entry });
    } else {
      res.status(404).send({
        status: "error",
        data: "Audit in progress entry not found",
      });
    }
  } catch (error) {
    console.error("Error fetching audit in progress by ID:", error);
    res.status(500).send({
      status: "error",
      data: "Error fetching audit in progress entry",
    });
  }
};

// Get audit in progress entries for a specific company
const getAuditInProgressByCompanyId = async (req, res) => {
  const { company_id } = req.params;
  try {
    const rows = await AuditInProgress.findByCompanyId(company_id);
    res.send({ status: "ok", data: rows });
  } catch (error) {
    console.error("Error fetching audit in progress by company ID:", error);
    res.status(500).send({
      status: "error",
      data: "Error fetching audit in progress for company",
    });
  }
};

// Create a new audit in progress entry
// controllers/auditInProgressController.js

const createAuditInProgress = async (req, res) => {
  const {
    company_id,
    client,
    audit_started,
    audit_completed,
    invoice_issued,
    fee_received,
  } = req.body;

  if (!company_id) {
    return res
      .status(400)
      .json({ status: "error", data: "Company ID is required" });
  }

  try {
    // 🛑 Check if entry already exists for this company
    const existingEntries = await AuditInProgress.findByCompanyId(company_id);

    if (existingEntries.length > 0) {
      return res.status(400).json({
        status: "error",
        data: "Audit progress already exists for this company.",
      });
    }

    const insertedId = await AuditInProgress.create({
      company_id,
      client,
      audit_started,
      audit_completed,
      invoice_issued,
      fee_received,
    });

    const newEntry = await AuditInProgress.findById(insertedId);
    res.status(201).json({ status: "ok", data: newEntry });
  } catch (error) {
    console.error("Error creating audit in progress entry:", error);
    res.status(500).json({
      status: "error",
      data: "Error creating audit in progress entry",
    });
  }
};

// Update an existing audit in progress entry
const updateAuditInProgress = async (req, res) => {
  const { id } = req.params;
  const updatedFields = { ...req.body };
  console.log(updatedFields);

  try {
    const existing = await AuditInProgress.findById(id);

    if (!existing) {
      return res.status(404).send({
        status: "error",
        data: "Audit in progress entry not found",
      });
    }

    // Prevent company_id from being updated
    delete updatedFields.company_id;

    await AuditInProgress.update(id, updatedFields);
    const updatedEntry = await AuditInProgress.findById(id);

    const company = await Companies.findById(updatedEntry.company_id);
    updatedEntry.company_name = company?.name || "Unknown";

    res.send({ status: "ok", data: updatedEntry });
  } catch (error) {
    console.error("Error updating audit in progress entry:", error);
    res.status(500).send({
      status: "error",
      data: "Error updating audit in progress entry",
    });
  }
};

// Delete an audit in progress entry
const deleteAuditInProgress = async (req, res) => {
  const { id } = req.params;

  try {
    await AuditInProgress.delete(id);
    res.send({
      status: "ok",
      data: `Audit in progress entry with ID ${id} deleted`,
    });
  } catch (error) {
    console.error("Error deleting audit in progress entry:", error);
    res.status(500).send({
      status: "error",
      data: "Error deleting audit in progress entry",
    });
  }
};

export {
  getAllAuditInProgress,
  getAuditInProgressById,
  getAuditInProgressByCompanyId,
  createAuditInProgress,
  updateAuditInProgress,
  deleteAuditInProgress,
};

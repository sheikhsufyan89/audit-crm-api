import AuditLists from "../models/AuditLists.js";

// Get all audit years
const getAllAuditYears = async (req, res) => {
  try {
    const years = await AuditLists.findAll();
    res.send({ status: "ok", data: years });
  } catch (error) {
    console.error("Error fetching audit years:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error fetching audit years" });
  }
};

// Get audit year by ID
const getAuditYearById = async (req, res) => {
  const { id } = req.params;
  try {
    const year = await AuditLists.findById(id);
    if (year) {
      res.send({ status: "ok", data: year });
    } else {
      res.status(404).send({ status: "error", data: "Audit year not found" });
    }
  } catch (error) {
    console.error("Error fetching audit year by ID:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error fetching audit year" });
  }
};

// Get audit year by year value
const getAuditYearByYear = async (req, res) => {
  const { year } = req.params;
  try {
    const result = await AuditLists.findByYear(year);
    if (result) {
      res.send({ status: "ok", data: result });
    } else {
      res
        .status(404)
        .send({ status: "error", data: "Year not found in audit list" });
    }
  } catch (error) {
    console.error("Error fetching year:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error fetching audit year" });
  }
};

// Create a new audit year
// Create a new audit year
const createAuditYear = async (req, res) => {
  const { year } = req.body;

  if (!year || isNaN(parseInt(year))) {
    return res.status(400).send({ status: "error", data: "Invalid year" });
  }

  try {
    const parsedYear = parseInt(year);
    const id = await AuditLists.create(parsedYear);

    // ✅ Fetch the full newly created object to return
    const newAuditYear = await AuditLists.findById(id);

    res.status(201).send({ status: "ok", data: newAuditYear });
  } catch (error) {
    console.error("Error creating audit year:", error);
    const message =
      error.code === "ER_DUP_ENTRY"
        ? "This year already exists in audit list."
        : "Error creating audit year";
    res.status(500).send({ status: "error", data: message });
  }
};

// Delete audit year
const deleteAuditYear = async (req, res) => {
  const { id } = req.params;

  try {
    await AuditLists.delete(id);
    res.send({ status: "ok", data: `Audit year with ID ${id} deleted` });
  } catch (error) {
    console.error("Error deleting audit year:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error deleting audit year" });
  }
};

export {
  getAllAuditYears,
  getAuditYearById,
  getAuditYearByYear,
  createAuditYear,
  deleteAuditYear,
};

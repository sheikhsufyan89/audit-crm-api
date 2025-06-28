import Company from "../models/Companies.js";
import Letters from "../models/Letters.js";

const getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        status: "error",
        message: "Company not found",
      });
    }

    const letters = await Letters.findByCompanyId(id);

    res.status(200).json({
      status: "ok",
      data: {
        company,
        letters,
      },
    });
  } catch (error) {
    console.error("Error fetching company and letters:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch company and letters",
    });
  }
};

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.send({ status: "ok", data: companies });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error retrieving companies" });
  }
};

// Create a new company
// Create a new company
const createCompany = async (req, res) => {
  try {
    const newCompanyId = await Company.create(req.body);

    // Fetch full company details after creation
    const company = await Company.findById(newCompanyId);

    // Optional: Fetch related letters if needed, or leave it empty
    const letters = await Letters.findByCompanyId(newCompanyId);

    res.status(201).json({
      status: "ok",
      data: {
        company,
        letters,
      },
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error creating company" });
  }
};

// Update a company
const updateCompany = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    await Company.update(id, updateData);
    res.send({ status: "ok", data: "Company updated" });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).send({ status: "error", data: "Error updating company" });
  }
};

// Delete a company
const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    await Company.delete(id);
    res.send({ status: "ok", data: "Company deleted" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send({ status: "error", data: "Error deleting company" });
  }
};

export {
  getCompanyById,
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};

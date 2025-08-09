import Letter from "../models/Letters.js";
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

import puppeteer from "puppeteer";
import Company from "../models/Companies.js";

cloudinary.config({
  cloud_name: "djumpm4o6",
  api_key: "284473795147635",
  api_secret: "ex5IO0ACec3BHKsPkWviYfA74wA",
});

const uploadPdfToCloudinary = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: `letters/${fileName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const generateAndStoreLetters = async (req, res) => {
  const { letters } = req.body;

  if (!Array.isArray(letters) || letters.length === 0) {
    return res.status(400).json({
      status: "error",
      data: "Request must include a non-empty 'letters' array",
    });
  }

  let browser;
  const duplicateEntries = [];

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const storedLetters = [];

    const sanitizeFileName = (name) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    for (const entry of letters) {
      try {
        const { company_id, letter_type, letter_date, year } = entry;

        // 🔒 Check for duplicate
        const existing = await Letter.findByCompanyIdAndYear(company_id, year);
        if (existing.length > 0) {
          const company = await Company.findById(company_id);
          duplicateEntries.push(`${company?.name || company_id} (${year})`);
          continue;
        }

        const company = await Company.findById(company_id);
        if (!company) continue;

        const formattedDate = new Date(letter_date).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );

        const html = generateLetterHTML(
          company.name,
          year,
          formattedDate,
          letter_type.toLowerCase() === "reappointment"
        );

        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
        });

        if (!pdfBuffer || pdfBuffer.length < 1000) {
          console.warn("Empty/invalid PDF for", company.name);
          continue;
        }

        const safeCompanyName = sanitizeFileName(company.name);
        const fileName = `letter_${safeCompanyName}_${year}`;
        const uploadResult = await uploadPdfToCloudinary(pdfBuffer, fileName);

        storedLetters.push({
          company_id,
          letter_type,
          year,
          pdf_path: uploadResult.secure_url,
          letter_date,
        });
      } catch (err) {
        console.error("Error processing entry:", err);
      }
    }

    await browser.close();

    if (storedLetters.length === 0) {
      return res.status(409).json({
        status: "error",
        type: "duplicate_entries",
        data: "Letters already issued for selected companies.",
        duplicates: duplicateEntries,
      });
    }

    const result = await Letter.createBulk(storedLetters);

    const message =
      `${result.affectedRows} letters generated and saved.` +
      (duplicateEntries.length
        ? ` Skipped duplicates for: ${duplicateEntries.join(", ")}`
        : "");

    res.status(201).json({
      status: "ok",
      message,
      letters: storedLetters,
      skipped_duplicates: duplicateEntries,
    });
  } catch (error) {
    console.error("Fatal error in letter generation:", error);
    if (browser) await browser.close();
    res.status(500).json({
      status: "error",
      data: "Failed to generate and store letters",
    });
  }
};

const getLetterById = async (req, res) => {
  const { id } = req.params;
  try {
    const letter = await Letter.findById(id);
    if (letter) {
      res.send({ status: "ok", data: letter });
    } else {
      res.send({ status: "error", data: "Letter not found" });
    }
  } catch (error) {
    console.error("Error retrieving letter:", error);
    res.send({ status: "error", data: "Error retrieving letter" });
  }
};

// Get all letters
const getAllLetters = async (req, res) => {
  try {
    const letters = await Letter.findAll();
    res.send({ status: "ok", data: letters });
  } catch (error) {
    console.error("Error retrieving letters:", error);
    res.status(500).send({ status: "error", data: "Error retrieving letters" });
  }
};

// Get letters by company ID
const getLettersByCompanyId = async (req, res) => {
  const { companyId } = req.params;
  try {
    const letters = await Letter.findByCompanyId(companyId);
    res.send({ status: "ok", data: letters });
  } catch (error) {
    console.error("Error retrieving letters for company:", error);
    res.status(500).send({ status: "error", data: "Error retrieving letters" });
  }
};

const createLettersBulk = async (req, res) => {
  const { letters } = req.body;

  if (!Array.isArray(letters) || letters.length === 0) {
    return res.status(400).json({
      status: "error",
      data: "Request must include a non-empty 'letters' array",
    });
  }

  try {
    const result = await Letter.createBulk(letters);
    res.status(201).json({
      status: "ok",
      data: `${result.affectedRows} letters created successfully`,
    });
  } catch (error) {
    console.error("Error bulk creating letters:", error);
    res.status(500).json({
      status: "error",
      data: "Error creating letters",
    });
  }
};
// Create a new letter
const createLetter = async (req, res) => {
  try {
    const newLetterId = await Letter.create(req.body);
    res.send({ status: "ok", data: `Letter created with ID ${newLetterId}` });
  } catch (error) {
    console.error("Error creating letter:", error);
    res.status(500).send({ status: "error", data: "Error creating letter" });
  }
};

// Update a letter
const updateLetter = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    await Letter.update(id, updateData);
    res.send({ status: "ok", data: "Letter updated" });
  } catch (error) {
    console.error("Error updating letter:", error);
    res.status(500).send({ status: "error", data: "Error updating letter" });
  }
};

const deleteLetter = async (req, res) => {
  const { companyId, year } = req.params;

  try {
    // 1. Find the letter
    const rows = await Letter.findByCompanyIdAndYear(companyId, year);
    if (!rows || rows.length === 0) {
      return res.status(404).send({
        status: "error",
        data: "Letter not found for given company and year",
      });
    }

    const letter = rows[0];
    const match = letter.pdf_path.match(/letters\/([^\/]+)$/);
    if (!match) {
      return res
        .status(400)
        .send({ status: "error", data: "Invalid Cloudinary path" });
    }

    const publicId = `letters/${match[1]}`;
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    await Letter.deleteByCompanyIdAndYear(companyId, year);

    return res.send({
      status: "ok",
      data: `Letter for company ID ${companyId} and year ${year} deleted from Cloudinary and database.`,
    });
  } catch (error) {
    console.error("Error deleting letter:", error);
    return res
      .status(500)
      .send({ status: "error", data: "Failed to delete letter" });
  }
};
const header =
  "https://res.cloudinary.com/djumpm4o6/image/upload/v1754503327/oeuoavifjkbgb5yn2cgh.jpg";

const imgUrl =
  "https://res.cloudinary.com/djumpm4o6/image/upload/v1754245584/d6ahojqhoinficscl5vf.png";

const generateLetterHTML = (companyName, year, dateStr, isRecurring) => {
  return `
    <div style="font-family: Georgia, serif; color: black; background: white; margin: 0 auto; display: flex; align-items: center; flex-direction: column">
        <div style="text-align: center; margin-bottom: 40px;">
        <img src="${header}" alt="Letterhead" style="width: 100%; object-fit: contain;" />
      </div>
      <div style="max-width: 700px;">
      <p>${dateStr}</p>
      <p>The Board of Directors<br/>${companyName.toUpperCase()},<br/>Karachi.</p>
      <p>Dear Sirs,</p>
      <h3 style="font-weight: bold;">Consent to act as Auditors for the year ending June 30, ${year}</h3>
      <p>${
        isRecurring
          ? `With reference to your communication, we are pleased to convey our willingness to continue audit of the financial statements of your company for the year ending June 30, ${year}.`
          : `With reference to your communication, we are pleased to convey our willingness to be appointed as auditors of the above named Company for the year ending June 30, ${year}.`
      }</p>
      <br/>
      <p>Yours truly,</p>

      <img src="${imgUrl}" alt="Digital Signature" style="width: 250px; height: auto;" />
      <p style="font-weight:bold;margin-top:10px">
        Clarkson Hyde Saud Ansari<br/>
        <span style="font-weight:normal">Chartered Accountants</span>
      </p>
      </div>
    </div>
  `;
};

const getLettersByYear = async (req, res) => {
  const { year } = req.params;

  if (!year || isNaN(parseInt(year))) {
    return res
      .status(400)
      .send({ status: "error", data: "Invalid year parameter" });
  }

  try {
    const letters = await Letter.findByYear(parseInt(year));
    res.send({ status: "ok", data: letters });
  } catch (error) {
    console.error("Error retrieving letters by year:", error);
    res
      .status(500)
      .send({ status: "error", data: "Error retrieving letters by year" });
  }
};

const exportExcel = async (req, res) => {
  const { audit_list_id, audit_year } = req.body;

  if (!audit_list_id) {
    return res.status(400).json({
      status: "error",
      data: "Missing 'audit_list_id'",
    });
  }

  try {
    const rows = await Letter.findCompanyExportRowsByAuditListId(audit_list_id);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: "error",
        data: "No data found for given audit_list_id",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("template.xlsx");
    const worksheet = workbook.getWorksheet(1);

    const insertAfterRow = 9;
    const referenceRow = worksheet.getRow(insertAfterRow);

    for (let i = 0; i < rows.length; i++) {
      const rowIndex = insertAfterRow + 1 + i;
      worksheet.spliceRows(rowIndex, 0, []);
      const newRow = worksheet.getRow(rowIndex);

      const row = rows[i];

      const rowData = [
        i + 1, // s.no
        row.name,
        row.pic_listed ? "✔" : "",
        row.pic_not_listed ? "✔" : "",
        row.lsc ? "✔" : "",
        row.msc ? "✔" : "",
        row.ssc ? "✔" : "",
        row.others ? "✔" : "",
        row.nature_of_business,
        row.name_of_parent,
        row.investments_in,
        row.prior_year_restatement,
        row.name_of_engagement_partner,
        row.audit_partner_since,
        row.eqc_reviewer,
        row.eqc_reviewer_since,
        row.other_service_provided ? "✔" : "",
        row.other_service_provided ? "" : "✔",
        row.consent_obtained ? "✔" : "",
        row.consent_obtained ? "" : "✔",
        row.latest_audit_report_issued,
        row.last_audit_report_modified,
        row.material_uncertainty,
        row.paid_up_capital,
        row.turnover,
        row.profit_after_tax,
        row.no_of_employees,
        row.total_assets,
        row.total_hours_spent_on_engagement,
        row.engagement_partner_hours,
        row.eqc_reviewer_hours_spent,
        row.remarks,
      ];

      // Apply styles and values
      for (let col = 1; col <= referenceRow.cellCount; col++) {
        newRow.getCell(col).style = { ...referenceRow.getCell(col).style };
      }

      for (let col = 0; col < rowData.length; col++) {
        newRow.getCell(col + 1).value = rowData[col];
      }

      newRow.commit();
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=audit_export_${audit_year || "data"}.xlsx`
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({
      status: "error",
      data: "Failed to generate Excel file",
    });
  }
};
export {
  getLetterById,
  getAllLetters,
  getLettersByCompanyId,
  createLetter,
  updateLetter,
  deleteLetter,
  createLettersBulk,
  getLettersByYear,
  generateAndStoreLetters,
  exportExcel,
};

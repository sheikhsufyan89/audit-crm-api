import express from "express";
import puppeteer from "puppeteer";
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

const router = express.Router();

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djumpm4o6/upload";
const CLOUDINARY_UPLOAD_PRESET = "consent-letters";

router.post("/generate", async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: "Missing HTML content" });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Convert buffer to stream
    const stream = new Readable();
    stream.push(pdfBuffer);
    stream.push(null); // end of stream

    const form = new FormData();
    form.append("file", stream, {
      filename: "letter.pdf",
      contentType: "application/pdf",
    });
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const uploadRes = await axios.post(CLOUDINARY_URL, form, {
      headers: form.getHeaders(),
    });

    return res.json({ url: uploadRes.data.secure_url });
  } catch (err) {
    console.error("PDF generation/upload failed:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

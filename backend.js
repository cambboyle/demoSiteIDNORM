// Simple Express backend for document extraction
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// Document extraction endpoint
app.post("/api/extract", async (req, res) => {
  const { base64Image } = req.body;
  const errorId = Math.random().toString(36).substring(2, 10);
  const licenseKey = process.env.IDNORM_LICENSE_KEY;
  const idexServerUrl = process.env.IDEX_SERVER_URL;

  if (!base64Image) {
    return res
      .status(400)
      .json({ success: false, message: "No image provided." });
  }

  try {
    const requestBody = {
      config: {
        returnDocumentImage: {},
        returnVisualFields: {
          typeFilter: [
            "VISUAL_FIELD_TYPE_FACE_PHOTO",
            "VISUAL_FIELD_TYPE_SIGNATURE",
          ],
        },
      },
      imageJpeg: base64Image,
    };

    const response = await fetch(idexServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "idnorm-license-key": licenseKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[${errorId}] Error response from idexServerUrl:`,
        errorText
      );
      return res.status(500).json({
        success: false,
        message: `[${errorId}] Failed to get valid response for data processing!`,
        error: errorText,
      });
    }

    const apiResponse = await response.json();
    return res.status(200).json({
      success: true,
      message: "",
      data: { response: apiResponse },
    });
  } catch (error) {
    console.error(`[${errorId}] Exception in /api/extract:`, error);
    return res.status(500).json({
      success: false,
      message: `[${errorId}] Error while processing provided image!`,
      error: error.message || error,
    });
  }
});

app.listen(PORT, () => {});

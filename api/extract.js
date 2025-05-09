// Vercel serverless function for document extraction
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { base64Image } = req.body;
  const errorId = Math.random().toString(36).substring(2, 10);
  const licenseKey = process.env.IDNORM_LICENSE_KEY;
  const idexServerUrl = process.env.IDEX_SERVER_URL;

  if (!base64Image) {
    return res.status(400).json({ success: false, message: 'No image provided.' });
  }

  try {
    const requestBody = {
      config: {
        returnDocumentImage: {},
        returnVisualFields: {
          typeFilter: [
            'VISUAL_FIELD_TYPE_FACE_PHOTO',
            'VISUAL_FIELD_TYPE_SIGNATURE',
          ],
        },
      },
      imageJpeg: base64Image,
    };

    const response = await fetch(idexServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'idnorm-license-key': licenseKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: `[${errorId}] Failed to get valid response for data processing!`,
      });
    }

    const apiResponse = await response.json();
    return res.status(200).json({
      success: true,
      message: '',
      data: { response: apiResponse },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `[${errorId}] Error while processing provided image!`,
    });
  }
}

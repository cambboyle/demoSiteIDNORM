// Utility to robustly extract the document number from the extraction API response
// Covers MRZ, barcode, and text fields, with fallback to regex pattern matching

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractDocumentNumber(apiResponse: any): string | null {
  // 1. MRZ
  const mrzDocNum = apiResponse?.data?.mrz?.fields?.documentNumber;
  if (mrzDocNum && mrzDocNum.trim()) return mrzDocNum.trim();

  // 2. Barcode
  const barcodeDocNum = apiResponse?.data?.pdf417Barcode?.customerId;
  if (barcodeDocNum && barcodeDocNum.trim()) return barcodeDocNum.trim();

  // 3. Text Fields
  const textFields = apiResponse?.data?.textField || [];
  for (const field of textFields) {
    if (
      field.type === "TYPE_DOCUMENT_NUMBER" ||
      field.type === "TYPE_ID_NUMBER" ||
      field.type === "TYPE_PERSONAL_NUMBER"
    ) {
      if (field.value && field.value.trim()) return field.value.trim();
    }
  }

  // 4. Fallback: scan for document-number-like values
  for (const field of textFields) {
    if (field.value && /^[A-Z]{1,2}\d{6,8}$/.test(field.value.trim())) {
      return field.value.trim();
    }
  }

  return null;
}

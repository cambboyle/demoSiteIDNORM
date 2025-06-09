import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ResultCard,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Calendar,
  Flag,
  FileText,
  CreditCard,
  Fingerprint,
  Barcode,
  ArrowRight,
  ClipboardCopy,
  BookCopy,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extractDocumentNumber } from "@/lib/extractDocumentNumber";

interface ExtractedData {
  status: string;
  documentImage?: string;
  classification?: {
    documentClass?: string;
    documentType?: string;
    countryCode?: string;
  };
  data?: {
    textField?: Array<{
      type: string;
      value: string;
      _id?: string;
    }>;
    dateField?: Array<{
      type: string;
      value: string;
      date?: {
        day: number;
        month: number;
        year: number;
      };
      _id?: string;
    }>;
    sexField?: Array<{
      value: string;
      sex: string;
      _id?: string;
      segments?: Array<{ value?: string }>;
    }>;
    visualField?: Array<{
      type: string;
      image: string;
    }>;
    mrz?: {
      status: string;
      fields: Record<string, string>;
    };
    pdf417Barcode?: Record<string, string>;
  };
  detection?: {
    status: string;
  };
}

interface IDResultsDisplayProps {
  extractionData: ExtractedData | null;
  isLoading: boolean;
  error: string | null;
}

const IDResultsDisplay: React.FC<IDResultsDisplayProps> = ({
  extractionData,
  isLoading,
  error,
}) => {
  // State for managing the active tab in the results UI
  const [activeTab, setActiveTab] = useState("summary");

  if (isLoading) {
    // Show loading skeleton while processing
    return (
      <div className="my-8 p-8 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 w-full max-w-md bg-gray-200 rounded"></div>
        </div>
        <p className="mt-6 text-idnorm-lightText">Processing your ID...</p>
      </div>
    );
  }

  if (error) {
    // Show error card if extraction failed
    return (
      <Card className="my-8 border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert size={24} />
            Error Processing ID
          </CardTitle>
          <CardDescription>
            We encountered an issue while extracting data from your ID
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-idnorm-lightText">{error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!extractionData) {
    // No data to display
    return null;
  }

  const documentImage = extractionData.documentImage
    ? `data:image/jpeg;base64,${extractionData.documentImage}`
    : null;

  // Organize fields by type
  const fieldDict: Record<
    string,
    {
      type: string;
      value: string;
      _id?: string;
      date?: { day: number; month: number; year: number };
      sex?: string;
    }
  > = {};

  // Process text fields
  if (extractionData.data?.textField) {
    for (const item of extractionData.data.textField) {
      if (item.type === "TYPE_SIGNATURE") continue;

      const newItem = { ...item };
      newItem._id = newItem.type.replace(/_/g, "-");
      fieldDict[newItem.type] = newItem;
    }
  }

  // Process date fields
  if (extractionData.data?.dateField) {
    for (const item of extractionData.data.dateField) {
      const newItem = { ...item };
      newItem._id = newItem.type.replace(/_/g, "-");
      fieldDict[newItem.type] = newItem;
    }
  }

  // Process sex fields
  const sexFieldsRaw = extractionData.data?.sexField;
  const sexFields = Array.isArray(sexFieldsRaw)
    ? sexFieldsRaw
    : sexFieldsRaw
    ? [sexFieldsRaw]
    : [];
  if (sexFields.length > 0) {
    let dummy_id = 0;
    for (const item of sexFields) {
      const newItem = {
        ...item,
        type: "TYPE_SEX", // Add the type property that was missing
      };
      newItem._id = String(dummy_id);
      fieldDict[newItem.type] = newItem;
      dummy_id += 1;
    }
  }

  // Patch nationality if missing from text fields but present in MRZ or barcode
  // (Now handled by extractDocumentNumber utility in UI, so this fallback is optional)
  if (!fieldDict["TYPE_NATIONALITY"]) {
    const mrzNationality = extractionData.data?.mrz?.fields?.nationality;
    // Try all possible barcode keys for nationality
    const barcode = extractionData.data?.pdf417Barcode || {};
    const possibleBarcodeNationalityKeys = [
      "nationality",
      "countryIdentification",
      "issuingCountry",
      "countryCode",
      "country",
    ];
    let barcodeNationality = null;
    for (const key of possibleBarcodeNationalityKeys) {
      if (barcode[key]) {
        barcodeNationality = barcode[key];
        break;
      }
    }
    if (mrzNationality) {
      fieldDict["TYPE_NATIONALITY"] = {
        type: "TYPE_NATIONALITY",
        value: mrzNationality,
        _id: "TYPE-NATIONALITY-MRZ",
      };
    } else if (barcodeNationality) {
      fieldDict["TYPE_NATIONALITY"] = {
        type: "TYPE_NATIONALITY",
        value: barcodeNationality,
        _id: "TYPE-NATIONALITY-BARCODE",
      };
    }
  }

  // Patch ID number if missing from text fields but present in MRZ or barcode
  // (Now handled by extractDocumentNumber utility in UI, so this fallback is optional)
  if (
    !fieldDict["TYPE_DOCUMENT_NUMBER"] &&
    !fieldDict["TYPE_PERSONAL_IDENTITY_NUMBER"] &&
    !fieldDict["TYPE_ID_NUMBER"]
  ) {
    const docNum = extractDocumentNumber(extractionData);
    if (docNum) {
      fieldDict["TYPE_DOCUMENT_NUMBER"] = {
        type: "TYPE_DOCUMENT_NUMBER",
        value: docNum,
        _id: "TYPE-DOCUMENT-NUMBER-UTILITY",
      };
    }
  }

  // Extract visual fields
  const faceImage = extractionData.data?.visualField?.find(
    (item) => item.type === "TYPE_FACE_PHOTO"
  )?.image;
  const signatureImage = extractionData.data?.visualField?.find(
    (item) => item.type === "TYPE_SIGNATURE"
  )?.image;

  // Extract MRZ and barcode data
  const mrzFields =
    extractionData.data?.mrz?.status === "STATUS_OK"
      ? Object.entries(extractionData.data.mrz.fields || {}).filter(
          ([_, value]) => value !== ""
        )
      : [];

  const barcodeFields = extractionData.data?.pdf417Barcode
    ? Object.entries(extractionData.data.pdf417Barcode).filter(
        ([_, value]) => value !== ""
      )
    : [];

  // Extract classifications
  const classifications = extractionData.classification
    ? Object.entries(extractionData.classification)
        .filter(([_, value]) => value && value !== "NOT_AVAILABLE")
        .map(([key, value]) => ({
          key,
          value: value
            .replace(/COUNTRY_/g, "")
            .replace(/DOCUMENT_TYPE_/g, "")
            .replace(/TERRITORY_/g, ""),
        }))
    : [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  // Extract request and response objects for API debug tabs
  let apiRequest: Record<string, unknown> = {};
  let apiResponse: Record<string, unknown> = {};
  if (typeof extractionData === "object" && extractionData !== null) {
    // Prefer top-level request/response (new structure)
    if ("request" in extractionData && extractionData.request) {
      apiRequest = extractionData.request as Record<string, unknown>;
    } else if (
      "data" in extractionData &&
      extractionData.data &&
      "request" in extractionData.data &&
      extractionData.data.request
    ) {
      apiRequest = extractionData.data.request as Record<string, unknown>;
    }
    if ("response" in extractionData && extractionData.response) {
      apiResponse = extractionData.response as Record<string, unknown>;
    } else if (
      "data" in extractionData &&
      extractionData.data &&
      "response" in extractionData.data &&
      extractionData.data.response
    ) {
      apiResponse = extractionData.data.response as Record<string, unknown>;
    } else {
      // Fallback: treat extractionData as the response itself
      apiResponse = extractionData as unknown as Record<string, unknown>;
    }
  }

  // Compose a full API request object for display (method, headers, body)
  const apiRequestDisplay = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "idnorm-license-key": "LICENSE-KEY", // Replace with actual key if available
    },
    body: apiRequest,
  };

  // Helper: get all visual fields
  const allVisualFields = extractionData.data?.visualField || [];

  return (
    <div className="my-8" id="results-section">
      <h2 className="text-2xl font-bold text-center mb-6">
        ID Extraction Results
      </h2>
      <Tabs
        defaultValue="results"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          {/* All the original results tabs go here, as a nested Tabs component */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="mrz">MRZ Data</TabsTrigger>
              <TabsTrigger value="barcode">Barcode</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                {/* Document Image and Visual Fields (left on desktop) */}
                <Card className="p-0 md:col-span-1 flex flex-col items-center justify-center">
                  <CardContent className="p-2 flex flex-col items-center w-full">
                    {documentImage ? (
                      <img
                        src={documentImage}
                        alt="Document"
                        className="max-w-full max-h-40 object-contain mb-2 pt-4"
                        style={{ width: "100%", height: "auto" }}
                      />
                    ) : (
                      <div className="py-8 text-center text-muted-foreground w-full text-xs">
                        No document image
                      </div>
                    )}
                    {/* Extra visual fields (face, signature, etc) */}
                    {allVisualFields.length > 0 && (
                      <div className="flex flex-wrap gap-4 w-full justify-center mt-2">
                        {allVisualFields.map((vf, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center max-w-[90px]"
                          >
                            <span className="text-xs text-muted-foreground mb-1">
                              {vf.type.replace("TYPE_", "").replace(/_/g, " ")}
                            </span>
                            <img
                              src={`data:image/jpeg;base64,${vf.image}`}
                              alt={vf.type}
                              className="max-h-16 object-contain rounded border"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 flex flex-wrap gap-1 justify-center">
                    {/* Show parsed classification results, hide if not available */}
                    {classifications
                      .filter(({ value }) => value && value !== "NOT_AVAILABLE")
                      .map(({ key, value }) => (
                        <span
                          key={key}
                          className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                        >
                          {/* Format key for display, e.g. 'countryCode' -> 'Country Code' */}
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .replace(/_/g, " ")}
                          : {value}
                        </span>
                      ))}
                  </CardFooter>
                </Card>

                {/* Key Fields (center/right on desktop) */}
                <Card className="md:col-span-2 p-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Document Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <div className="mb-2">
                        <span className="block text-xs text-muted-foreground mb-0.5">
                          Full Name
                        </span>
                        <span className="font-semibold text-base">
                          {fieldDict["TYPE_FULL_NAME"]?.value ||
                            (fieldDict["TYPE_FIRST_NAME"] &&
                            fieldDict["TYPE_LAST_NAME"]
                              ? `${fieldDict["TYPE_FIRST_NAME"].value} ${fieldDict["TYPE_LAST_NAME"].value}`
                              : fieldDict["TYPE_FIRST_NAME"]?.value ||
                                fieldDict["TYPE_LAST_NAME"]?.value ||
                                "Not available")}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-xs text-muted-foreground mb-0.5">
                          Date of Birth
                        </span>
                        <span className="font-semibold text-base">
                          {fieldDict["TYPE_DATE_OF_BIRTH"]?.value ||
                            extractionData.data?.mrz?.fields?.birthdate ||
                            extractionData.data?.pdf417Barcode?.dateOfBirth ||
                            "Not available"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-xs text-muted-foreground mb-0.5">
                          Nationality
                        </span>
                        <span className="font-semibold text-base">
                          {fieldDict["TYPE_NATIONALITY"]?.value ||
                            extractionData.data?.mrz?.fields?.nationality ||
                            extractionData.data?.pdf417Barcode?.nationality ||
                            extractionData.data?.pdf417Barcode
                              ?.countryIdentification ||
                            "Not available"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-xs text-muted-foreground mb-0.5">
                          Sex
                        </span>
                        <span className="font-semibold text-base">
                          {extractSexValue({
                            sexFields,
                            textFields: extractionData.data?.textField || [],
                            mrz: extractionData.data?.mrz,
                            barcode: extractionData.data?.pdf417Barcode,
                          }) || "Not available"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-xs text-muted-foreground mb-0.5">
                          ID Number
                        </span>
                        <span className="font-semibold text-base">
                          {extractDocumentNumber(extractionData) ||
                            "Not available"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-xs text-muted-foreground mb-0.5">
                          Expiry Date
                        </span>
                        <span className="font-semibold text-base">
                          {fieldDict["TYPE_EXPIRY_DATE"]?.value ||
                            "Not available"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(
                            {
                              name:
                                fieldDict["TYPE_FULL_NAME"]?.value ||
                                (fieldDict["TYPE_FIRST_NAME"] &&
                                fieldDict["TYPE_LAST_NAME"]
                                  ? `${fieldDict["TYPE_FIRST_NAME"].value} ${fieldDict["TYPE_LAST_NAME"].value}`
                                  : undefined),
                              dob: fieldDict["TYPE_DATE_OF_BIRTH"]?.value,
                              nationality: fieldDict["TYPE_NATIONALITY"]?.value,
                              sex: extractSexValue({
                                sexFields,
                                textFields:
                                  extractionData.data?.textField || [],
                                mrz: extractionData.data?.mrz,
                                barcode: extractionData.data?.pdf417Barcode,
                              }),
                              idNumber:
                                fieldDict["TYPE_DOCUMENT_NUMBER"]?.value,
                              expiryDate: fieldDict["TYPE_EXPIRY_DATE"]?.value,
                              documentType: classifications.map((c) => c.value),
                            },
                            null,
                            2
                          )
                        )
                      }
                    >
                      <ClipboardCopy className="mr-2 h-4 w-4" />
                      Copy Data
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Fields Tab */}
            <TabsContent value="fields">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={18} />
                    Extracted Text Fields
                  </CardTitle>
                  <CardDescription>
                    All text fields extracted from the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const order = [
                      {
                        key: "ID Number",
                        types: [
                          "type_document_identity_number",
                          "type_document_id_number",
                          "type_document_number",
                          "type_id_number",
                          "type_personal_identity_number",
                        ],
                      },
                      { key: "Last Name", types: ["type_last_name"] },
                      { key: "First Name", types: ["type_first_name"] },
                      { key: "Nationality", types: ["type_nationality"] },
                      { key: "Sex", types: ["sex"] },
                      { key: "Place of Birth", types: ["type_place_of_birth"] },
                      {
                        key: "Issuing Authority",
                        types: ["type_issuing_authority"],
                      },
                    ];
                    const textFields = extractionData.data?.textField || [];
                    // --- Use extractSexValue helper for Sex field ---
                    const rows: Array<{ label: string; value: string }> = [];
                    order.forEach((field) => {
                      if (field.key === "Sex") {
                        const sexValue = extractSexValue({
                          sexFields,
                          textFields,
                          mrz: extractionData.data?.mrz,
                          barcode: extractionData.data?.pdf417Barcode,
                        });
                        if (sexValue) {
                          rows.push({
                            label: "Sex",
                            value: sexValue,
                          });
                        }
                      } else {
                        const textFieldMap = Object.fromEntries(
                          textFields.map((item) => [
                            item.type?.toLowerCase?.(),
                            item,
                          ])
                        );
                        const type = field.types.find((t) => t in textFieldMap);
                        if (type) {
                          const item = textFieldMap[type];
                          rows.push({ label: field.key, value: item.value });
                        }
                      }
                    });
                    // Add any other text fields not in the order
                    textFields.forEach((item) => {
                      const label = item.type
                        .replace("TYPE_", "")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());
                      if (!rows.find((row) => row.value === item.value)) {
                        rows.push({ label, value: item.value });
                      }
                    });
                    // Add any other sex fields not in the order
                    if (sexFields.length > 1) {
                      sexFields.slice(1).forEach((item, idx) => {
                        const rawSex = item.sex || item.value || "";
                        if (rawSex) {
                          rows.push({
                            label: `Sex (${idx + 2})`,
                            value: rawSex,
                          });
                        }
                      });
                    }
                    if (rows.length === 0) {
                      return (
                        <div className="py-8 text-center text-muted-foreground">
                          No text fields were extracted from this document
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        {rows.map((row, idx) => (
                          <ResultCard key={row.label + idx}>
                            <div className="bg-muted px-2 border-b flex justify-between items-center">
                              <h4 className="font-medium text-sm">
                                {row.label}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => copyToClipboard(row.value)}
                              >
                                <ClipboardCopy size={14} />
                              </Button>
                            </div>
                            <div className="px-2">
                              <p className="font-medium font-mono break-all">
                                {row.value}
                              </p>
                            </div>
                          </ResultCard>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MRZ Tab */}
            <TabsContent value="mrz">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookCopy size={18} />
                    Machine Readable Zone (MRZ) Data
                  </CardTitle>
                  <CardDescription>
                    Data extracted from the document's machine readable zone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mrzFields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mrzFields.map(([key, value]) => (
                        <ResultCard key={key}>
                          <div className="bg-muted px-2 border-b flex justify-between items-center">
                            <h4 className="font-medium text-sm">{key}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => copyToClipboard(value)}
                            >
                              <ClipboardCopy size={14} />
                            </Button>
                          </div>
                          <div className="px-2">
                            <p className="font-medium font-mono">{value}</p>
                          </div>
                        </ResultCard>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No MRZ data was extracted from this document or the
                      document doesn't contain an MRZ
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Barcode Tab */}
            <TabsContent value="barcode">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Barcode size={18} />
                    Barcode Data
                  </CardTitle>
                  <CardDescription>
                    Data extracted from PDF417 or other barcodes on the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {barcodeFields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {barcodeFields.map(([key, value]) => (
                        <ResultCard key={key}>
                          <div className="bg-muted px-2 border-b flex justify-between items-center">
                            <h4 className="font-medium text-sm">{key}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => copyToClipboard(value)}
                            >
                              <ClipboardCopy size={14} />
                            </Button>
                          </div>
                          <div className="px-2">
                            <p className="font-medium font-mono break-all">
                              {value}
                            </p>
                          </div>
                        </ResultCard>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No barcode data was extracted from this document
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Document Tab */}
            <TabsContent value="document">
              <Card>
                <CardHeader>
                  <CardTitle>Document Image & Visual Fields</CardTitle>
                  <CardDescription>
                    The processed document image, all detected visual fields,
                    and document classification
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-6 w-full">
                    {/* Left: Document image and visual fields */}
                    <div className="flex-1 flex flex-col items-center gap-4 min-w-[220px]">
                      {documentImage ? (
                        <img
                          src={documentImage}
                          alt="Document"
                          className="max-w-full object-contain rounded-lg border shadow"
                          style={{ maxHeight: "300px" }}
                        />
                      ) : (
                        <div className="py-12 text-center text-muted-foreground w-full">
                          No document image available
                        </div>
                      )}
                      {/* Visual fields (face, signature, etc) */}
                      {allVisualFields.length > 0 && (
                        <div className="flex flex-wrap gap-4 w-full justify-center mt-2">
                          {allVisualFields.map((vf, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center max-w-[120px]"
                            >
                              <span className="text-xs text-muted-foreground mb-1">
                                {vf.type
                                  .replace("TYPE_", "")
                                  .replace(/_/g, " ")}
                              </span>
                              <img
                                src={`data:image/jpeg;base64,${vf.image}`}
                                alt={vf.type}
                                className="max-h-20 object-contain rounded border"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Right: Document classification, left-aligned to images */}
                    <div className="flex-1 flex flex-col justify-start min-w-[220px] md:pl-4 md:pt-2">
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground text-left">
                        Document Classification
                      </h4>
                      {classifications.length > 0 ? (
                        <table className="w-auto text-sm border-separate border-spacing-y-1 text-left">
                          <tbody>
                            {classifications.map(({ key, value }) => (
                              <tr key={key}>
                                <td className="pr-2 text-muted-foreground whitespace-nowrap font-medium text-left align-top">
                                  {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .replace(/_/g, " ")}
                                </td>
                                <td className="pl-2 align-top">
                                  <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                                    {value}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-muted-foreground text-left">
                          No classification available
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>Raw API Request</CardTitle>
              <CardDescription>
                This is the full HTTP request sent to the extraction API,
                including method, headers, and body.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto">
                {JSON.stringify(apiRequestDisplay, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="response">
          <Card>
            <CardHeader>
              <CardTitle>Raw API Response</CardTitle>
              <CardDescription>
                This is the full JSON response from the extraction API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper type guard for text fields with a 'sex' property
function hasSexProp(obj: unknown): obj is { sex: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "sex" in obj &&
    typeof (obj as { sex?: unknown }).sex === "string"
  );
}

// Helper to check if a value is meaningful
const isValidSex = (val: unknown) =>
  typeof val === "string" &&
  val.trim() !== "" &&
  val.trim().toUpperCase() !== "UNKNOWN" &&
  val.trim().toUpperCase() !== "UNSPECIFIED";

// Robust helper to extract the Sex value from all possible sources
function extractSexValue({
  sexFields,
  textFields,
  mrz,
  barcode,
}: {
  sexFields: Array<unknown>;
  textFields: Array<unknown>;
  mrz?: { fields?: Record<string, unknown> };
  barcode?: Record<string, unknown>;
}): string | undefined {
  // 1. Prefer first valid value from sexFields
  const getRawSex = (item: unknown) => {
    if (typeof item !== "object" || item === null) return "";
    const obj = item as Record<string, unknown>;
    let rawSex =
      (typeof obj.sex === "string" ? obj.sex : undefined) ||
      (typeof obj.value === "string" ? obj.value : undefined) ||
      "";
    if (
      (!rawSex ||
        rawSex === "" ||
        rawSex === "UNKNOWN" ||
        rawSex === "UNSPECIFIED") &&
      Array.isArray(obj.segments) &&
      obj.segments.length > 0
    ) {
      const seg = (obj.segments as unknown[]).find(
        (seg) =>
          typeof seg === "object" &&
          seg !== null &&
          typeof (seg as Record<string, unknown>).value === "string" &&
          (seg as Record<string, unknown>).value !== "UNKNOWN" &&
          (seg as Record<string, unknown>).value !== "UNSPECIFIED"
      );
      if (seg && typeof (seg as Record<string, unknown>).value === "string")
        rawSex = String((seg as Record<string, unknown>).value);
    }
    return rawSex;
  };
  for (const item of sexFields) {
    const rawSex = getRawSex(item);
    if (isValidSex(rawSex)) return rawSex;
  }
  // 2. textField: TYPE_SEX, sex, type_gender, gender (prefer first valid)
  const textFieldMap = Object.fromEntries(
    textFields.map((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        typeof (item as Record<string, unknown>).type === "string"
      ) {
        return [
          String((item as Record<string, unknown>).type).toLowerCase(),
          item,
        ];
      }
      return [undefined, item];
    })
  );
  const tfTypes = ["type_sex", "sex", "type_gender", "gender"];
  for (const t of tfTypes) {
    if (t in textFieldMap) {
      const item = textFieldMap[t];
      if (typeof item === "object" && item !== null) {
        if (hasSexProp(item) && isValidSex(item.sex)) return item.sex;
        if (
          "value" in item &&
          typeof (item as Record<string, unknown>).value === "string" &&
          isValidSex((item as Record<string, unknown>).value)
        ) {
          return String((item as Record<string, unknown>).value);
        }
      }
    }
  }
  // 3. Any textField with a 'sex' property
  const fallback = textFields.find(
    (item) => hasSexProp(item) && isValidSex((item as { sex: string }).sex)
  );
  if (fallback && hasSexProp(fallback)) return fallback.sex;
  // 4. MRZ
  const mrzSex = mrz?.fields?.sex;
  if (typeof mrzSex === "string" && isValidSex(mrzSex)) return String(mrzSex);
  // 5. Barcode
  const barcodeGender = barcode?.gender;
  if (typeof barcodeGender === "string" && isValidSex(barcodeGender)) {
    return String(barcodeGender);
  } else if (typeof barcodeGender === "number") {
    if (barcodeGender === 1) return "M";
    if (barcodeGender === 2) return "F";
    if (barcodeGender !== 0) return String(barcodeGender);
  }
  // 6. Not found
  // Uncomment for debug: console.debug("Sex not found", { sexFields, textFields, mrz, barcode });
  return undefined;
}

export default IDResultsDisplay;

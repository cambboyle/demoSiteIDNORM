// IDResultsDisplay presents the extracted data from an ID document in a tabbed interface.
// It organizes and displays summary info, all fields, MRZ, barcode, and the document image.
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
  if (extractionData.data?.sexField) {
    let dummy_id = 0;
    for (const item of extractionData.data.sexField) {
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

  return (
    <div className="my-8" id="results-section">
      {/* Tabbed interface for viewing different aspects of the extracted data */}
      <h2 className="text-2xl font-bold text-center mb-6">
        ID Extraction Results
      </h2>

      <Tabs
        defaultValue="summary"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="mrz">MRZ Data</TabsTrigger>
          <TabsTrigger value="barcode">Barcode</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
                <CardDescription>
                  Key information extracted from your ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Full Name
                    </h4>
                    <p className="text-lg font-medium">
                      {fieldDict["TYPE_FULL_NAME"]?.value ||
                        (fieldDict["TYPE_FIRST_NAME"] &&
                        fieldDict["TYPE_LAST_NAME"]
                          ? `${fieldDict["TYPE_FIRST_NAME"].value} ${fieldDict["TYPE_LAST_NAME"].value}`
                          : fieldDict["TYPE_FIRST_NAME"]?.value ||
                            fieldDict["TYPE_LAST_NAME"]?.value ||
                            "Not available")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Date of Birth
                    </h4>
                    <p className="text-lg font-medium">
                      {fieldDict["TYPE_DATE_OF_BIRTH"]?.value ||
                        extractionData.data?.mrz?.fields?.birthdate ||
                        extractionData.data?.pdf417Barcode?.dateOfBirth ||
                        "Not available"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Nationality
                    </h4>
                    <p className="text-lg font-medium">
                      {fieldDict["TYPE_NATIONALITY"]?.value ||
                        extractionData.data?.mrz?.fields?.nationality ||
                        extractionData.data?.pdf417Barcode?.nationality ||
                        extractionData.data?.pdf417Barcode
                          ?.countryIdentification ||
                        "Not available"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Gender/Sex
                    </h4>
                    <p className="text-lg font-medium">
                      {(() => {
                        const sexFieldRaw = extractionData.data?.sexField;
                        let sexValue: string | undefined = undefined;
                        let rawValue: string | undefined = undefined;
                        if (sexFieldRaw) {
                          if (Array.isArray(sexFieldRaw)) {
                            if (sexFieldRaw.length > 0) {
                              // Parsed value (e.g., MALE/FEMALE/UNSPECIFIED)
                              sexValue =
                                sexFieldRaw[0].sex &&
                                sexFieldRaw[0].sex !== "UNKNOWN" &&
                                sexFieldRaw[0].sex !== "UNSPECIFIED"
                                  ? sexFieldRaw[0].sex
                                  : sexFieldRaw[0].value &&
                                    sexFieldRaw[0].value !== "UNKNOWN" &&
                                    sexFieldRaw[0].value !== "UNSPECIFIED"
                                  ? sexFieldRaw[0].value
                                  : undefined;
                              // Raw value (e.g., M/F/X)
                              rawValue =
                                sexFieldRaw[0].value &&
                                sexFieldRaw[0].value !== sexValue
                                  ? sexFieldRaw[0].value
                                  : undefined;
                            }
                          } else if (
                            typeof sexFieldRaw === "object" &&
                            sexFieldRaw !== null
                          ) {
                            const obj: {
                              sex?: string;
                              value?: string;
                              segments?: Array<{ value?: string }>;
                            } = sexFieldRaw;
                            if (
                              typeof obj.sex === "string" &&
                              obj.sex !== "UNKNOWN" &&
                              obj.sex !== "UNSPECIFIED"
                            ) {
                              sexValue = obj.sex;
                            } else if (
                              Array.isArray(obj.segments) &&
                              obj.segments.length > 0
                            ) {
                              const seg = obj.segments[0];
                              if (
                                seg.value &&
                                seg.value !== "UNKNOWN" &&
                                seg.value !== "UNSPECIFIED"
                              ) {
                                sexValue = seg.value;
                              }
                            }
                            if (
                              typeof obj.value === "string" &&
                              obj.value !== sexValue
                            ) {
                              rawValue = obj.value;
                            }
                          }
                        }
                        // Fallbacks
                        if (!sexValue) {
                          sexValue =
                            extractionData.data?.mrz?.fields?.sex ||
                            extractionData.data?.pdf417Barcode?.gender;
                        }
                        // Compose display
                        if (sexValue && rawValue && sexValue !== rawValue) {
                          return `${sexValue} (${rawValue})`;
                        } else if (sexValue) {
                          return sexValue;
                        } else {
                          return "Not available";
                        }
                      })()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      ID Number
                    </h4>
                    <p className="text-lg font-medium">
                      {/* Use robust extraction utility for document number */}
                      {extractDocumentNumber(extractionData) || "Not available"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Expiry Date
                    </h4>
                    <p className="text-lg font-medium">
                      {fieldDict["TYPE_EXPIRY_DATE"]?.value || "Not available"}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Document Type
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {classifications.map(({ key, value }) => (
                      <div
                        key={key}
                        className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {value}
                      </div>
                    ))}
                    {classifications.length === 0 && (
                      <p className="text-muted-foreground">
                        No classification available
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
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
                          sex: fieldDict["TYPE_SEX"]?.value,
                          idNumber: fieldDict["TYPE_DOCUMENT_NUMBER"]?.value,
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

            <div className="flex flex-col gap-4">
              {faceImage && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">ID Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <img
                      src={`data:image/jpeg;base64,${faceImage}`}
                      alt="ID Face Photo"
                      className="max-h-48 object-contain rounded"
                    />
                  </CardContent>
                </Card>
              )}

              {signatureImage && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Signature</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center bg-gray-50 p-4 rounded">
                    <img
                      src={`data:image/jpeg;base64,${signatureImage}`}
                      alt="ID Signature"
                      className="max-h-24 object-contain"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Define the desired order of fields */}
                {(() => {
                  const order = [
                    {
                      key: "id number",
                      types: [
                        "type_document_identity_number", // Correct API type
                        "type_document_id_number",
                        "type_document_number",
                        "type_id_number",
                        "type_personal_identity_number",
                      ],
                    },
                    { key: "last_name", types: ["type_last_name"] },
                    { key: "first_name", types: ["type_first_name"] },
                    { key: "nationality", types: ["type_nationality"] },
                    { key: "sex", types: ["sex"] },
                    { key: "place of birth", types: ["type_place_of_birth"] },
                    {
                      key: "issuing authority",
                      types: ["type_issuing_authority"],
                    },
                  ];
                  // Collect all text fields and sex fields
                  const textFields = extractionData.data?.textField || [];
                  const sexFields = extractionData.data?.sexField || [];
                  // Helper to get the raw value for sex
                  const getRawSex = (item: {
                    value: string;
                    segments?: Array<{ value?: string }>;
                  }) => {
                    let rawSex = item.value;
                    if (
                      (!rawSex ||
                        rawSex === "" ||
                        rawSex === "UNKNOWN" ||
                        rawSex === "UNSPECIFIED") &&
                      Array.isArray(item.segments) &&
                      item.segments.length > 0
                    ) {
                      const seg = item.segments.find(
                        (seg) =>
                          seg.value &&
                          seg.value !== "UNKNOWN" &&
                          seg.value !== "UNSPECIFIED"
                      );
                      if (seg) rawSex = seg.value;
                    }
                    return rawSex;
                  };
                  // Map for quick lookup by lowercased type
                  const textFieldMap = Object.fromEntries(
                    textFields.map((item) => [item.type.toLowerCase().replace('document_id_number', 'document_id_number'), item])
                  );
                  // Render fields in the specified order
                  return order.map((field, idx) => {
                    if (field.key === "sex" && sexFields.length > 0) {
                      // Only show the first sex field
                      const item = sexFields[0];
                      const rawSex = getRawSex(item);
                      return (
                        <ResultCard key={field.key + idx}>
                          <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                            <h4 className="font-medium text-sm font-mono">
                              sex
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => copyToClipboard(rawSex || "")}
                            >
                              <ClipboardCopy size={14} />
                            </Button>
                          </div>
                          <div className="p-4">
                            <p className="font-medium font-mono">{rawSex}</p>
                          </div>
                        </ResultCard>
                      );
                    } else {
                      // Find the first matching type for this field
                      const type = field.types.find((t) => t in textFieldMap);
                      if (type) {
                        const item = textFieldMap[type];
                        return (
                          <ResultCard key={field.key + idx}>
                            <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                              <h4 className="font-medium text-sm font-mono">
                                {field.key}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => copyToClipboard(item.value)}
                              >
                                <ClipboardCopy size={14} />
                              </Button>
                            </div>
                            <div className="p-4">
                              <p className="font-medium font-mono">
                                {item.value}
                              </p>
                            </div>
                          </ResultCard>
                        );
                      }
                    }
                    return null;
                  });
                })()}
                {/* Fallback for no fields */}
                {(!extractionData.data?.textField ||
                  extractionData.data.textField.length === 0) &&
                  (!extractionData.data?.sexField ||
                    extractionData.data.sexField.length === 0) && (
                    <div className="col-span-2 py-8 text-center text-muted-foreground">
                      No text fields were extracted from this document
                    </div>
                  )}
              </div>
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
                      <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
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
                      <div className="p-4">
                        <p className="font-medium font-mono">{value}</p>
                      </div>
                    </ResultCard>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No MRZ data was extracted from this document or the document
                  doesn't contain an MRZ
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
                      <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
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
                      <div className="p-4">
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
              <CardTitle>Document Image</CardTitle>
              <CardDescription>
                The processed document image with detected regions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-0">
              {documentImage ? (
                <img
                  src="/placeholder.svg"
                  alt="Document"
                  className="max-w-full object-contain rounded-b-lg"
                  style={{ maxHeight: "500px" }}
                />
              ) : (
                <div className="py-12 text-center text-muted-foreground w-full">
                  No document image available
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-6">
              <div className="w-full">
                <h4 className="text-sm font-medium mb-2">
                  Document Classification
                </h4>
                <div className="flex flex-wrap gap-2">
                  {classifications.map(({ key, value }) => (
                    <div
                      key={key}
                      className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {key}: {value}
                    </div>
                  ))}
                  {classifications.length === 0 && (
                    <p className="text-muted-foreground">
                      No classification available
                    </p>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IDResultsDisplay;

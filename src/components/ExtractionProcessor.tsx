// ExtractionProcessor handles the process of extracting data from an uploaded ID image.
// It manages the UI state for processing, error handling, and displaying results.
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  extractDocumentDataReal,
} from "@/services/extractionService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import IDResultsDisplay from "./IDResultsDisplay";

interface ExtractionProcessorProps {
  selectedImage: string | null;
  onReset: () => void;
}

const ExtractionProcessor: React.FC<ExtractionProcessorProps> = ({
  selectedImage,
  onReset,
}) => {
  // State for tracking processing status, errors, and extraction results
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  interface ExtractionResult {
    status: string;
    documentImage?: string;
    classification?: Record<string, string>;
    data?: {
      textField?: { type: string; value: string; _id?: string }[];
      dateField?: {
        type: string;
        value: string;
        date?: { day: number; month: number; year: number };
        _id?: string;
      }[];
      sexField?: { value: string; sex: string; _id?: string }[];
      visualField?: { type: string; image: string }[];
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

  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Handles the main extraction process for the selected image
  const processImage = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowResults(false);

    try {
      // Extract the base64 string part if needed
      const base64Image = selectedImage.includes("data:image")
        ? selectedImage.split(",")[1]
        : selectedImage;

      // Call the extraction service (real backend)
      const result = await extractDocumentDataReal(base64Image);
      // Only log a message if the real backend is used
      console.info("Connected to backend and received extraction result.");
      if (
        !result.data.response ||
        result.data.response.status !== "STATUS_OK" ||
        !result.data.response.detection
      ) {
        setError(
          "Failed to detect a document in the image. Please ensure the document is clearly visible."
        );
        setIsProcessing(false);
        return;
      }

      // Save the extraction result and show results UI
      setExtractionResult({
        ...result.data.response,
        data: {
          ...result.data.response.data,
          sexField: Array.isArray(result.data.response.data?.sexField)
            ? result.data.response.data.sexField.map((field) => ({
                value: field.value,
                sex: field.sex,
              }))
            : result.data.response.data?.sexField
            ? [result.data.response.data.sexField]
            : [],
          visualField: Array.isArray(result.data.response.data?.visualField)
            ? result.data.response.data.visualField.map((field) => ({
                type: field.type,
                image: field.image,
              }))
            : result.data.response.data?.visualField
            ? [result.data.response.data.visualField]
            : [],
          pdf417Barcode: result.data.response.data?.pdf417Barcode || {},
        },
      });
      setShowResults(true);
    } catch (err) {
      // Catch-all for unexpected errors
      console.error("Error processing image:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Resets the processor to allow a new extraction
  const handleReset = () => {
    setExtractionResult(null);
    setShowResults(false);
    setError(null);
    onReset();
  };

  return (
    <div>
      {/* Show extraction button if results are not shown */}
      {!showResults && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={processImage}
            disabled={!selectedImage || isProcessing}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Extract ID Data"
            )}
          </Button>
        </div>
      )}

      {/* Show results if extraction is successful */}
      {showResults && (
        <>
          <IDResultsDisplay
            extractionData={extractionResult}
            isLoading={isProcessing}
            error={error}
          />

          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={handleReset} className="mr-2">
              Process New ID
            </Button>
          </div>
        </>
      )}

      {/* Show error message if extraction failed */}
      {error && !showResults && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-idnorm-lightText">{error}</p>
          <Button variant="outline" onClick={handleReset} className="mt-4">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExtractionProcessor;

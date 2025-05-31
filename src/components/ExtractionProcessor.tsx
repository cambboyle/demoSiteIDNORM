// ExtractionProcessor handles the process of extracting data from an uploaded ID image.
// It manages the UI state for processing, error handling, and displaying results.
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  extractDocumentDataReal,
  extractDocumentData,
} from "@/services/extractionService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import IDResultsDisplay from "./IDResultsDisplay";
import type { ExtractionResult as ServiceExtractionResult } from "@/services/extractionService";

// Define ExtractedData type locally (copied from IDResultsDisplay)
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

// Extend ExtractedData to include request/response for debug tabs
interface ExtractedDataWithDebug extends ExtractedData {
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
}

interface ExtractionProcessorProps {
  selectedImage: string | null;
  onReset: () => void;
  forceReset?: boolean;
  onForceResetHandled?: () => void;
}

// ExtractionProcessor component
const ExtractionProcessor: React.FC<ExtractionProcessorProps> = ({
  selectedImage,
  onReset,
  forceReset,
  onForceResetHandled,
}) => {
  // State for tracking processing status, errors, and extraction results
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] =
    useState<ExtractedDataWithDebug | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Reset all state if forceReset is triggered
  React.useEffect(() => {
    if (forceReset) {
      setExtractionResult(null);
      setShowResults(false);
      setError(null);
      if (onForceResetHandled) onForceResetHandled();
    }
  }, [forceReset, onForceResetHandled]);

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

      // Build the request body to match your provided JSON exactly
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

      // Always use the real extraction API
      const result = await extractDocumentDataReal(base64Image);
      // Save the extraction result and show results UI
      setExtractionResult({
        ...result.data.response,
        request: requestBody, // Show the exact request JSON
        response: result.data.response, // Show the full backend response
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
            <Button
              onClick={handleReset}
              className="bg-[#333] text-white hover:bg-[#444] border-2 border-[#333] flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 shadow-md transition active:scale-95 whitespace-nowrap text-sm mr-2"
            >
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

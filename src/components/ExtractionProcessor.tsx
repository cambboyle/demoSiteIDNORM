// ExtractionProcessor handles the process of extracting data from an uploaded ID image.
// It manages the UI state for processing, error handling, and displaying results.
import React from "react";
import { Button } from "@/components/ui/button";
import IDResultsDisplay from "./IDResultsDisplay";

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
  extractionResult: ExtractedDataWithDebug | null;
  isProcessing: boolean;
  error: string | null;
}

// ExtractionProcessor component
const ExtractionProcessor: React.FC<ExtractionProcessorProps> = ({
  selectedImage,
  onReset,
  forceReset,
  onForceResetHandled,
  extractionResult,
  isProcessing,
  error,
}) => {
  // Remove internal state and extraction logic

  return (
    <div>
      {isProcessing && !extractionResult && !error && (
        <div className="my-8 p-8 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center">
          <div className="animate-spin mb-4">
            <svg
              className="h-10 w-10 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
          <p className="mt-2 text-idnorm-lightText text-lg font-medium">
            Processing your ID...
          </p>
        </div>
      )}
      {extractionResult && (
        <>
          <IDResultsDisplay
            extractionData={extractionResult}
            isLoading={isProcessing}
            error={error}
          />
          <div className="flex justify-center mt-6">
            <Button
              onClick={onReset}
              className="bg-[#333] text-white hover:bg-[#444] border-2 border-[#333] flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 shadow-md transition active:scale-95 whitespace-nowrap text-sm mr-2"
            >
              Process New ID
            </Button>
          </div>
        </>
      )}
      {error && !extractionResult && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-idnorm-lightText">{error}</p>
          <Button variant="outline" onClick={onReset} className="mt-4">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export type { ExtractedDataWithDebug };
export default ExtractionProcessor;

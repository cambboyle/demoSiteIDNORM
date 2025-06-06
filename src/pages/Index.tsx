// Index.tsx is the main landing/demo page for the app.
// It orchestrates the demo flow, manages image selection, and renders the main UI sections.
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import ExampleDocuments from "@/components/ExampleDocuments";
import Support from "@/components/Support";
import ExtractionProcessor from "@/components/ExtractionProcessor";
import type { ExtractedDataWithDebug } from "@/components/ExtractionProcessor";
import ForDevelopers from "@/components/ForDevelopers";
import { FaLinkedin, FaYoutube } from "react-icons/fa";
import React from "react";

const Index = () => {
  // State for the currently selected/uploaded image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [forceResetExtraction, setForceResetExtraction] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] =
    useState<ExtractedDataWithDebug | null>(null);
  const [error, setError] = useState<string | null>(null);
  const demoSectionRef = useRef<HTMLDivElement>(null);

  // Handles image upload from user
  const handleImageUploaded = useCallback((imageDataUrl: string) => {
    toast.success("Image successfully uploaded");
    setSelectedImage(imageDataUrl);
    if (imageDataUrl === null) {
      setForceResetExtraction(true);
    }
  }, []);

  // Handles selection of an example image
  const handleExampleImageSelected = useCallback((imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    toast.success("Example image selected");
    // Scroll to demo section
    setTimeout(() => {
      demoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Resets the demo to allow a new extraction
  const handleReset = () => {
    setSelectedImage(null);
    setForceResetExtraction(true);
    setTimeout(() => {
      if (demoSectionRef.current) {
        // Custom smooth scroll (slower than default)
        const targetY =
          demoSectionRef.current.getBoundingClientRect().top +
          window.pageYOffset;
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const duration = 900; // ms, adjust for speed (900ms is slower than default but not too slow)
        let startTime: number | null = null;

        function scrollStep(timestamp: number) {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease =
            progress < 0.5
              ? 2 * progress * progress
              : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, startY + distance * ease);
          if (progress < 1) {
            window.requestAnimationFrame(scrollStep);
          }
        }
        window.requestAnimationFrame(scrollStep);
      }
    }, 100);
  };

  // Centralized handler for image selection (upload or example)
  const requestImageChange = useCallback(
    (imageDataUrl: string, source: "upload" | "example") => {
      // Always replace the image directly, no confirmation
      if (source === "upload") {
        handleImageUploaded(imageDataUrl);
      } else {
        handleExampleImageSelected(imageDataUrl);
      }
    },
    [handleImageUploaded, handleExampleImageSelected]
  );

  const handleExtractIdData = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setExtractionResult(null);
    try {
      const base64Image = selectedImage.includes("data:image")
        ? selectedImage.split(",")[1]
        : selectedImage;
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
      const { extractDocumentDataReal } = await import(
        "@/services/extractionService"
      );
      const result = await extractDocumentDataReal(base64Image);
      // Check for invalid image or no document found
      if (
        !result.success ||
        result.data?.response?.status !== "STATUS_OK" ||
        !result.data?.response?.data ||
        ((!result.data.response.data.textField ||
          result.data.response.data.textField.length === 0) &&
          (!result.data.response.data.mrz ||
            !result.data.response.data.mrz.fields ||
            Object.keys(result.data.response.data.mrz.fields).length === 0))
      ) {
        setError(
          "No document found in image or the image is invalid. Please try again with a clearer photo."
        );
        setExtractionResult(null);
      } else {
        setExtractionResult({
          ...result.data.response,
          request: requestBody,
          response: result.data.response,
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Renders the main header and hero section */}
      <Header />
      <main className="flex-1">
        {/* Hero Section introduces the app */}
        <section className="bg-gradient-to-b from-idnorm-neutral to-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-light text-idnorm-primary mb-4">
              ID Data Extraction Made Simple
            </h1>
            <p className="text-idnorm-lightText max-w-2xl mx-auto mb-8 text-lg">
              Experience instant, accurate document extraction with global
              coverage—effortless to integrate, ready to try!
            </p>
            <Button
              onClick={() =>
                demoSectionRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              size="lg"
              variant="default"
              className="font-medium"
            >
              Try Demo
            </Button>
          </div>
        </section>

        {/* Example Documents Section */}
        <ExampleDocuments
          onSelectExample={(img) => requestImageChange(img, "example")}
        />

        {/* Demo Section */}
        <section
          ref={demoSectionRef}
          className="py-16 bg-white"
          id="demo-section"
        >
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-idnorm-primary mb-2">
                Photo ID Extraction Demo
              </h2>
              <p className="text-idnorm-lightText max-w-2xl mx-auto mb-4">
                Upload or capture a photo of your ID to see how our data
                extraction works
              </p>
              <div className="text-sm text-idnorm-lightText max-w-lg mx-auto p-3 bg-idnorm-neutral rounded-md mb-8">
                <p className="font-medium mb-2">👋 Welcome to our demo!</p>
                <p>
                  This is a simulated experience. No real personal data is
                  collected or stored.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center mb-8">
              <ImageUploader
                onImageUploaded={(img) => requestImageChange(img, "upload")}
                selectedImage={selectedImage}
                onExtractIdData={handleExtractIdData}
              />

              <div className="mt-8 text-sm text-idnorm-lightText max-w-md text-center">
                <p className="mb-4">
                  Your document should be clearly visible, with all text legible
                  and all corners of the document visible in the frame.
                </p>
              </div>
            </div>

            {/* Show extraction results or loading spinner in the results area */}
            <div className="mt-8 w-full">
              <ExtractionProcessor
                selectedImage={selectedImage}
                onReset={handleReset}
                forceReset={forceResetExtraction}
                onForceResetHandled={() => setForceResetExtraction(false)}
                extractionResult={extractionResult}
                isProcessing={isProcessing}
                error={error}
              />
            </div>
          </div>
        </section>

        {/* Developers Section */}
        <section id="for-developers">
          <ForDevelopers />
        </section>

        {/* Support Section */}
        <Support />
      </main>

      <footer className="relative py-10 bg-gradient-to-t from-idnorm-neutral/80 to-white border-t border-gray-100 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 md:gap-0 border-b border-gray-200 pb-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <img
                src="/images/other/No-padding-Logo-horizontal.svg"
                alt="idnorm logo"
                className="h-8 w-auto"
                style={{ maxWidth: 160 }}
              />
              <img
                src="/images/other/GDPR-CCPA.png"
                alt="GDPR and CCPA Compliant"
                className="h-10 w-auto mt-2"
              />
            </div>
            <nav>
              <ul className="flex flex-wrap justify-center gap-4 md:gap-8">
                <li>
                  <a
                    href="/privacy"
                    className="text-sm text-idnorm-lightText hover:text-idnorm-primary transition-colors font-medium"
                  >
                    Privacy Notice
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-sm text-idnorm-lightText hover:text-idnorm-primary transition-colors font-medium"
                  >
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a
                    href="/conditions"
                    className="text-sm text-idnorm-lightText hover:text-idnorm-primary transition-colors font-medium"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/cookies"
                    className="text-sm text-idnorm-lightText hover:text-idnorm-primary transition-colors font-medium"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </nav>
            <div className="flex justify-center md:justify-end gap-4 mt-4 md:mt-0">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex items-center rounded-full p-2 hover:bg-idnorm-primary/10 transition-colors group"
              >
                <FaLinkedin
                  size={24}
                  className="text-idnorm-primary group-hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex items-center rounded-full p-2 hover:bg-idnorm-primary/10 transition-colors group"
              >
                <FaYoutube
                  size={24}
                  className="text-idnorm-primary group-hover:scale-110 transition-transform"
                />
              </a>
            </div>
          </div>
          <div className="text-center pt-6 text-xs text-idnorm-lightText">
            <span className="block">© idnorm 2025. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

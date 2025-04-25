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
import ForDevelopers from "@/components/ForDevelopers";
import { FaLinkedin, FaYoutube } from "react-icons/fa";

const Index = () => {
  // State for the currently selected/uploaded image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const demoSectionRef = useRef<HTMLDivElement>(null);

  // Handles image upload from user
  const handleImageUploaded = useCallback((imageDataUrl: string) => {
    toast.success("Image successfully uploaded");
    setSelectedImage(imageDataUrl);
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Renders the main header and hero section */}
      <Header />
      <main className="flex-1">
        {/* Hero Section introduces the app */}
        <section className="bg-gradient-to-b from-idnorm-neutral to-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-idnorm-primary mb-4">
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
              className="font-medium"
            >
              Try Demo
            </Button>
          </div>
        </section>

        {/* Example Documents Section */}
        <ExampleDocuments onSelectExample={handleExampleImageSelected} />

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
                onImageUploaded={handleImageUploaded}
                selectedImage={selectedImage}
              />

              <div className="mt-8 text-sm text-idnorm-lightText max-w-md text-center">
                <p className="mb-4">
                  Your document should be clearly visible, with all text legible
                  and all corners of the document visible in the frame.
                </p>
              </div>
            </div>

            <ExtractionProcessor
              selectedImage={selectedImage}
              onReset={handleReset}
            />
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
              <span className="text-2xl font-bold text-idnorm-primary tracking-tight flex items-center gap-2">
                idnorm
              </span>
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

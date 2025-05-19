import { Button } from "@/components/ui/button";
import ContactForm from "./ContactForm";
import { useState } from "react";

const ForDevelopers = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section
      className="text-white rounded-lg pt-16 pb-16 px-[10%]"
      style={{
        background: "#333",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col justify-center h-full">
          <p className="text-base mb-6">Developer section</p>
          <h2 className="text-5xl md:text-6xl font-thin mb-8 leading-tight">
            Integration is one step away!
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl">
            Our platform is developer-focused, offering flexible APIs, clear
            documentation, and easy integration for building robust identity
            verification solutions. We prioritize intuitive, powerful tools so
            you can innovate without the hassle.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Button
              asChild
              variant="outline"
              className="bg-white text-idnorm-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold shadow text-sm"
            >
              <a
                href="https://www.idnorm.com/api-documentation"
                target="_blank"
                rel="noopener noreferrer"
              >
                View docs
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-idnorm-primary px-8 py-3 rounded-lg font-semibold shadow text-sm"
            >
              <a
                href="https://github.com/idnorm/document-data-extraction/blob/master/sdk/README.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Quick start
              </a>
            </Button>
          </div>
          <span className="text-lg text-white/80 mt-2">
            <a
              href="#support"
              className="underline hover:text-idnorm-accent transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("support");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Need professional support?
            </a>
          </span>
        </div>
        <div className="relative flex justify-center items-center">
          <div className="overflow-hidden rounded-tl-[120px] rounded-br-[120px] w-full max-w-xl aspect-[4/3] bg-white/5">
            <img
              src="/images/other/Typing on a computer.avif"
              alt="Typing on a computer - developer at work"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
      <ContactForm open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
};

export default ForDevelopers;

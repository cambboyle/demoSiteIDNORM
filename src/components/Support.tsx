import { Button } from "@/components/ui/button";
import { HelpCircle, Mail } from "lucide-react";
import { useState } from "react";
import ContactForm from "./ContactForm";

const Support = () => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <section className="py-16 bg-white" id="support">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-idnorm-primary mb-4 text-center">
          Support
        </h2>
        <p className="text-idnorm-lightText mb-12 max-w-2xl mx-auto text-center">
          Have questions or need help with our document verification solution?
          Our support team is ready to assist you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-idnorm-neutral p-6 rounded-lg flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-idnorm-primary/10 flex items-center justify-center mb-4">
              <HelpCircle className="text-idnorm-primary h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Documentation</h3>
            <p className="text-idnorm-lightText mb-4">
              Browse our comprehensive documentation to learn how to integrate
              and use our services.
            </p>
            <Button
              variant="outline"
              className="mt-auto border-idnorm-primary text-idnorm-primary hover:bg-idnorm-primary hover:text-white"
              asChild
            >
              <a
                href="https://www.idnorm.com/dev-hub-overview"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Documentation
              </a>
            </Button>
          </div>

          <div className="bg-idnorm-neutral p-6 rounded-lg flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-idnorm-primary/10 flex items-center justify-center mb-4">
              <Mail className="text-idnorm-primary h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-idnorm-lightText mb-4">
              Contact our support team via email for detailed assistance with
              technical issues.
            </p>
            <Button
              variant="outline"
              className="mt-auto border-idnorm-primary text-idnorm-primary hover:bg-idnorm-primary hover:text-white"
              onClick={() => setIsContactFormOpen(true)}
            >
              Email Support
            </Button>
          </div>
        </div>
      </div>
      <ContactForm
        open={isContactFormOpen}
        onOpenChange={setIsContactFormOpen}
      />
    </section>
  );
};

export default Support;

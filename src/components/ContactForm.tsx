import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactForm = ({ open, onOpenChange }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log("Form submitted:", formData);
    toast.success("Message sent successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Get in touch!</DialogTitle>
          <p className="text-idnorm-lightText mt-2">
            Our experts will guide you in creating an execution plan to solve
            customer acquisition, onboarding, fraud prevention, and global
            compliance challenges.
          </p>
          <p className="text-sm text-idnorm-primary mt-2">contact@idnorm.com</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="First name *"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                placeholder="Last name *"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email *"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Input
              placeholder="Company name"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
          </div>
          <div>
            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
          </div>
          <div>
            <Textarea
              placeholder="Message"
              className="min-h-[100px]"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full bg-idnorm-primary">
            Submit
          </Button>
          <p className="text-xs text-center text-idnorm-lightText mt-4">
            By submitting the form, you agree to our{" "}
            <a href="/terms" className="underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;

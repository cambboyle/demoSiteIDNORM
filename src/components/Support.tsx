import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Support = () => {
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
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      subject: "",
      message: "",
    });
  };

  return (
    <section className="py-16 bg-white" id="support">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-idnorm-primary mb-4 text-center">
          Support
        </h2>
        <p className="text-idnorm-lightText mb-8 max-w-2xl mx-auto text-center">
          Our experts will guide you in creating an execution plan to solve
          customer acquisition, onboarding, fraud prevention, and global
          compliance challenges.
        </p>
        <div className="bg-idnorm-neutral p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-2 text-center">
            Get in touch!
          </h3>
          <p className="text-idnorm-lightText mt-2 text-center">
            Our experts will guide you in creating an execution plan to solve
            customer acquisition, onboarding, fraud prevention, and global
            compliance challenges.
          </p>
          <p className="text-sm text-idnorm-primary mt-2 text-center">
            contact@idnorm.com
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="First name *"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <Input
                placeholder="Last name *"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <Input
              type="email"
              placeholder="Email *"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              placeholder="Company name"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
            <Textarea
              placeholder="Message"
              className="min-h-[100px]"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
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
        </div>
      </div>
    </section>
  );
};

export default Support;

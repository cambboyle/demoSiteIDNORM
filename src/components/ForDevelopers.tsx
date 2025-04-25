import { Button } from "@/components/ui/button";

const ForDevelopers = () => {
  return (
    <section className="py-16 bg-idnorm-primary text-white">
      <div className="container mx-auto px-4">
        <p className="text-sm font-medium mb-2">Developer section</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Integration is one step away!
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-300 mb-8 max-w-xl">
              Our platform is developer-focused, offering flexible APIs, clear
              documentation, and easy integration for building robust identity
              verification solutions. We prioritize intuitive, powerful tools so
              you can innovate without the hassle.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="bg-white text-idnorm-primary hover:bg-gray-100"
              >
                View docs
              </Button>
            </div>
            <p className="text-sm text-gray-300 mt-6">
              Need professional{" "}
              <a
                href="#support"
                className="underline underline-offset-2 text-white hover:text-idnorm-accent transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("support");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                support
              </a>
              ?
            </p>
          </div>
          <div className="hidden md:block relative">
            <div className="rounded-lg overflow-hidden">
              <img
                src="/placeholder.svg"
                alt="Developer coding"
                className="w-64 h-40 object-cover mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForDevelopers;

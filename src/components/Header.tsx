import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [open, setOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // Get navbar height (sticky header)
      const navbar = document.querySelector("header");
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      // No offset for support section (if at bottom)
      const offset = sectionId === "support" ? 0 : navbarHeight + 8;
      window.scrollTo({
        top: sectionTop - offset,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  const redirectToMainSite = () => {
    window.open("https://www.idnorm.com/", "_blank");
  };

  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center" aria-label="Home">
            <img
              src="/images/other/No-padding-Logo-horizontal.svg"
              alt="idnorm logo"
              className="h-8 w-auto"
              style={{ maxWidth: 160 }}
            />
          </a>
          <span className="text-xs font-bold bg-idnorm-primary text-white px-2 py-0.5 rounded">
            DEMO
          </span>
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("demo-section");
                }}
                className="text-idnorm-text hover:text-idnorm-primary transition-colors"
              >
                Demo
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("for-developers");
                }}
                className="text-idnorm-text hover:text-idnorm-primary transition-colors"
              >
                For Devs
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("support");
                }}
                className="text-idnorm-text hover:text-idnorm-primary transition-colors"
              >
                Support
              </a>
            </li>
          </ul>
        </nav>

        <div className="hidden md:flex">
          <Button onClick={redirectToMainSite}>Visit Main Site</Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden text-idnorm-text">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center gap-2">
                  <span>idnorm</span>
                  <span className="text-xs font-bold bg-idnorm-primary text-white px-2 py-0.5 rounded">
                    DEMO
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col mt-8">
              <a
                href="#"
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("demo-section");
                  setOpen(false);
                }}
              >
                Demo
              </a>
              <a
                href="#"
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("for-developers");
                  setOpen(false);
                }}
              >
                For Devs
              </a>
              <a
                href="#"
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("support");
                  setOpen(false);
                }}
              >
                Support
              </a>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    redirectToMainSite();
                    setOpen(false);
                  }}
                >
                  Visit Main Site
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;

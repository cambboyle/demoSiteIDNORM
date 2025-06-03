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
                href="https://www.idnorm.com/#comp-m0ij8l2k"
                target="_blank"
                rel="noopener noreferrer"
                className="text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Products
              </a>
            </li>
            <li>
              <a
                href="https://www.idnorm.com/#comp-lk9fbi9j"
                target="_blank"
                rel="noopener noreferrer"
                className="text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="#for-developers"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("for-developers");
                  if (el) {
                    const y =
                      el.getBoundingClientRect().top + window.pageYOffset - 80; // 80px offset for navbar
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
                className="text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Dev
              </a>
            </li>
            <li>
              <a
                href="https://www.idnorm.com/plans"
                target="_blank"
                rel="noopener noreferrer"
                className="text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Demo
              </a>
            </li>
          </ul>
        </nav>

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
                href="https://www.idnorm.com/#comp-m0ij8l2k"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Products
              </a>
              <a
                href="https://www.idnorm.com/#comp-lk9fbi9j"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Blog
              </a>
              <a
                href="#for-developers"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("for-developers");
                  if (el) {
                    const y =
                      el.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Dev
              </a>
              <a
                href="https://www.idnorm.com/plans"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Pricing
              </a>
              <a
                href="#"
                className="py-3 border-b border-gray-100 text-idnorm-text hover:text-idnorm-primary transition-colors font-medium"
              >
                Demo
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;

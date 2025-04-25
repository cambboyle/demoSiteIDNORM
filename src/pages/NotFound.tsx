import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-idnorm-neutral">
      <div className="text-center p-8 rounded-lg bg-white shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold mb-4 text-idnorm-primary">404</h1>
        <p className="text-xl text-idnorm-text mb-6">
          Oops! The page you're looking for cannot be found.
        </p>
        <Button
          asChild
          className="bg-idnorm-primary hover:bg-idnorm-primary/90"
        >
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

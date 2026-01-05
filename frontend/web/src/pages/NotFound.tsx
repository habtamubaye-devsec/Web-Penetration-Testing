
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-mesh -z-10 opacity-30"></div>

      <div className="text-center max-w-md px-6 py-16 animate-scale-in">
        {/* Icon with glow */}
        <div className="relative mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="relative w-32 h-32 mx-auto rounded-full bg-muted flex items-center justify-center shadow-xl">
            <AlertTriangle className="h-16 w-16 text-primary animate-bounce-subtle" />
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-7xl font-bold mb-2 text-gradient-primary">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="btn-scale shadow-md shadow-primary/20">
            <Link to="/" className="gap-2">
              <Home className="h-5 w-5" />
              Return to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

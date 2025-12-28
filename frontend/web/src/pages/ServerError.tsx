
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

const ServerError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6 py-16 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-5xl font-bold mb-2">500</h1>
        <p className="text-3xl font-semibold mb-2">Server Error</p>
        <p className="text-muted-foreground mb-8">
          Sorry, something went wrong on our servers. We're working to fix the issue.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerError;

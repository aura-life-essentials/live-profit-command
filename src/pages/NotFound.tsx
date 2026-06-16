import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <Helmet>
        <title>Page not found — AuraLift for the Spirit</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <p className="text-xs font-mono text-muted-foreground mb-3">404 · {location.pathname}</p>
      <h1 className="text-4xl font-bold mb-3 text-aura">Lost in the aura</h1>
      <p className="mb-6 text-muted-foreground max-w-md">
        The page you're looking for has drifted away. Let's get you back to the catalog.
      </p>
      <Link to="/">
        <Button>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;

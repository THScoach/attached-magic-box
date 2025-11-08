import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { HitsMonogram } from "@/components/HitsLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,192,192,0.05)_0%,transparent_70%)]" />
      <div className="relative z-10 text-center px-4">
        <div className="mx-auto mb-8 opacity-50">
          <HitsMonogram className="h-16 w-16 mx-auto" />
        </div>
        <h1 className="mb-4 text-8xl font-black text-primary">404</h1>
        <h2 className="mb-4 text-3xl font-bold text-white">Page Not Found</h2>
        <p className="mb-8 text-xl text-gray-400 max-w-md mx-auto">
          Looks like this swing went foul. Let's get you back in the box.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold uppercase">
            <Link to="/train-in-person">
              <ArrowLeft className="mr-2 h-5 w-5" />
              View Programs
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

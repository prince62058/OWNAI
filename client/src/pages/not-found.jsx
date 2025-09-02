import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/">
              <a className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </a>
            </Link>
          </Button>
          
          <Button asChild>
            <Link href="/">
              <a className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </a>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
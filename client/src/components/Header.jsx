import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Infinity } from "lucide-react";

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Discover", href: "/discover" },
    { label: "Spaces", href: "/spaces" },
    ...(isAuthenticated ? [{ label: "Library", href: "/library" }] : []),
  ];

  const isActive = (href) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" data-testid="logo-link">
              <a className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src="/ft-logo.png" alt="PrinceTech AI" className="w-8 h-8 rounded-lg object-contain" />
                </div>
                <span className="text-xl font-bold gradient-text">PrinceTech AI</span>
              </a>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} data-testid={`nav-${item.label.toLowerCase()}`}>
                  <a
                    className={`nav-link text-sm font-medium transition-colors ${
                      isActive(item.href) ? "active text-foreground" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="hidden sm:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    {user?.firstName || user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="logout-button"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="signin-button"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="getpro-button"
                  >
                    Get Pro
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-trigger">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a className="text-lg font-medium">{item.label}</a>
                    </Link>
                  ))}
                  <div className="border-t pt-4 space-y-4">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.location.href = "/api/logout"}
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => window.location.href = "/api/login"}
                        >
                          Sign In
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => window.location.href = "/api/login"}
                        >
                          Get Pro
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
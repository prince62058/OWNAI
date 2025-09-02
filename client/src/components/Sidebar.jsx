import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Compass, 
  Grid3X3, 
  Bookmark, 
  Plus, 
  Moon, 
  Sun, 
  Infinity,
  DollarSign,
  Plane,
  GraduationCap
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const mainNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Spaces", href: "/spaces", icon: Grid3X3 },
    ...(isAuthenticated ? [{ label: "Library", href: "/library", icon: Bookmark }] : []),
  ];

  const categories = [
    { label: "Finance", href: "/finance", icon: DollarSign },
    { label: "Travel", href: "/travel", icon: Plane },
    { label: "Academic", href: "/academic", icon: GraduationCap },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <Link href="/" data-testid="sidebar-logo">
          <a className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Infinity className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-bold gradient-text">perplexity</span>
          </a>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.href} href={item.href} data-testid={`sidebar-${item.label.toLowerCase()}`}>
              <a
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}

        {/* Create Thread Button */}
        <div className="pt-4">
          <Link href="/" data-testid="create-thread">
            <a className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Create a Thread</span>
            </a>
          </Link>
        </div>

        {/* Categories */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = isActive(category.href);
              
              return (
                <Link key={category.href} href={category.href} data-testid={`sidebar-${category.label.toLowerCase()}`}>
                  <a
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start"
          data-testid="sidebar-theme-toggle"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Light mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Dark mode
            </>
          )}
        </Button>

        {/* User Section */}
        {isAuthenticated ? (
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium truncate">
                {user?.firstName || user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="w-full"
              data-testid="sidebar-logout"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              className="w-full justify-start"
              data-testid="sidebar-signin"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              className="w-full"
              data-testid="sidebar-getpro"
            >
              Get Pro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
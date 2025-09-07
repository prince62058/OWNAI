import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  Compass, 
  Grid3X3, 
  Bookmark, 
  Plus, 
  DollarSign,
  Plane,
  ShoppingBag,
  GraduationCap,
  X
} from "lucide-react";

export default function MobileSidebar({ onClose }) {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();

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
    { label: "Shopping", href: "/shopping", icon: ShoppingBag },
    { label: "Academic", href: "/academic", icon: GraduationCap },
  ];

  const handleItemClick = () => {
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/ft-logo.png" alt="PrinceTech AI" className="w-8 h-8 rounded-lg object-contain" />
          </div>
          <span className="text-lg font-bold gradient-text">PrinceTech AI</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="p-4 space-y-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={handleItemClick}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
          
          <Link href="/">
            <div
              onClick={handleItemClick}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Create a Thread</span>
            </div>
          </Link>
        </div>

        {/* Categories */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-3">
            Categories
          </h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = isActive(category.href);
              
              return (
                <Link key={category.href} href={category.href}>
                  <div
                    onClick={handleItemClick}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      active 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="px-3 py-2 bg-accent/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium truncate">
                {user?.firstName || user?.email}
              </p>
            </div>
            <button
              onClick={() => {
                window.location.href = "/api/logout";
                onClose();
              }}
              className="w-full flex items-center justify-center px-3 py-2.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => {
                window.location.href = "/api/login";
                onClose();
              }}
              className="w-full flex items-center justify-center px-3 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                window.location.href = "/api/login";
                onClose();
              }}
              className="w-full flex items-center justify-center px-3 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Get Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
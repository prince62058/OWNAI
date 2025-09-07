import { Link, useLocation } from "wouter";
import { Home, MessageCircle, Compass, Grid3X3, Bookmark } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Spaces", href: "/spaces", icon: Grid3X3 },
  ];

  const isActive = (href) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.href} href={item.href} data-testid={`mobile-nav-${item.label.toLowerCase()}`}>
              <div className={`flex flex-col items-center py-2 px-3 transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
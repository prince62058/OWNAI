
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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

function SidebarComponent() {
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
    <>
      <Sidebar collapsible="icon" className="border-r">
        <div className="absolute top-4 -right-4 z-50">
          <SidebarTrigger />
        </div>
        <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
                <Link href="/" data-testid="sidebar-logo">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                    <img src="/ft-logo.png" alt="FrienchTech.Ai" className="size-8 rounded-lg" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">FrienchTech.Ai</span>
                  </div>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} data-testid={`sidebar-${item.label.toLowerCase()}`}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="create-thread">
                  <Link href="/">
                    <Plus />
                    <span>Create a Thread</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => {
                const Icon = category.icon;
                const active = isActive(category.href);
                
                return (
                  <SidebarMenuItem key={category.href}>
                    <SidebarMenuButton asChild isActive={active} data-testid={`sidebar-${category.label.toLowerCase()}`}>
                      <Link href={category.href}>
                        <Icon />
                        <span>{category.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} data-testid="sidebar-theme-toggle">
              {theme === "dark" ? (
                <>
                  <Sun />
                  <span>Light mode</span>
                </>
              ) : (
                <>
                  <Moon />
                  <span>Dark mode</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {isAuthenticated ? (
            <>
              <SidebarMenuItem>
                <div className="flex flex-col space-y-1 px-2 py-1.5">
                  <span className="text-xs text-muted-foreground">Signed in as</span>
                  <span className="text-sm font-medium truncate">
                    {user?.firstName || user?.email}
                  </span>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="sidebar-logout"
                >
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="sidebar-signin"
                >
                  <span>Sign In</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="sidebar-getpro"
                >
                  <span>Get Pro</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
      </Sidebar>
    </>
  );
}

export default function SidebarWrapper() {
  return (
    <SidebarProvider>
      <SidebarComponent />
    </SidebarProvider>
  );
}

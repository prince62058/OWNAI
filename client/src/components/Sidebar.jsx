
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
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
  Infinity,
  DollarSign,
  Plane,
  ShoppingBag,
  GraduationCap
} from "lucide-react";

function SidebarComponent() {
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

  return (
    <>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton size="lg" asChild className="group-data-[collapsible=icon]:!justify-center">
                <Link href="/" data-testid="sidebar-logo">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg flex-shrink-0 min-w-8">
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">PrinceTech AI</span>
                  </div>
                </Link>
              </SidebarMenuButton>
              <SidebarTrigger className="text-left flex-shrink-0" />
            </div>
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

export default SidebarComponent;

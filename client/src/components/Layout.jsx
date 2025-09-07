import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import MobileSidebar from "@/components/MobileSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

export default function Layout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header with Menu Button */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur">
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="mobile-sidebar-trigger">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation and categories</SheetDescription>
                <MobileSidebar onClose={() => setIsMobileSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center">
                <img src="/ft-logo.png" alt="PrinceTech AI" className="w-7 h-7 rounded-md object-contain" />
              </div>
              <span className="text-lg font-bold text-white">PrinceTech AI</span>
            </div>

            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
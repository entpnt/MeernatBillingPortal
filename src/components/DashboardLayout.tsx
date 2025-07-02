import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, LogOut, Menu, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import NetworkOperatorView from "./NetworkOperatorView";
import ServiceProviderView from "./ServiceProviderView";

interface User {
  id: string;
  name: string;
  role: "serviceProvider" | "networkOperator";
  logoUrl: string;
  email: string;
  userName: string;
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  onSettingsClick?: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  onLogout,
  onSettingsClick,
  children,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    onLogout();
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  // Removed navigation items as requested

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-30 bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10">
                <img
                  src="/meernatlogo.png"
                  alt="Meernat logo"
                  className="h-full w-auto object-contain"
                />
              </div>
              <span className="font-semibold text-lg font-roboto">
                Meernat Billing Dashboard
              </span>
            </Link>
          </div>

          {/* Navigation removed as requested */}

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0"
                >
                  <div className="relative">
                    <div
                      className={`h-9 w-9 rounded-full p-0.5 ${
                        user?.id === "sp1"
                          ? "bg-purple-500"
                          : user?.id === "sp2"
                            ? "bg-yellow-500"
                            : user?.id === "sp3"
                              ? "bg-lime-500"
                              : user?.id === "no1"
                                ? "bg-teal-500"
                                : user?.id === "no2"
                                  ? "bg-orange-500"
                                  : user?.id === "no3"
                                    ? "bg-purple-500"
                                    : "bg-primary"
                      }`}
                    >
                      <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                        <img
                          src="/meernatlogo.png"
                          alt={user?.name || "Logo"}
                          className="h-5 w-5 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p>{user?.userName || "User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role === "serviceProvider"
                        ? "Service Provider"
                        : "Network Operator"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.name || "Unknown"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === "serviceProvider" && (
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10">
                      <img
                        src="/meernatlogo.png"
                        alt="Meernat logo"
                        className="h-full w-auto object-contain"
                      />
                    </div>
                    <span className="font-semibold text-lg font-roboto">
                      Meernat Billing Dashboard
                    </span>
                  </div>
                  {/* Mobile navigation removed as requested */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="bg-background border-0 shadow-none">{children}</Card>
      </main>
      {/* Footer */}
      <footer className="border-t py-4 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {user?.name || "Company"}. All
          rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;

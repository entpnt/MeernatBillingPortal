import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "./DashboardLayout";
import NetworkOperatorView from "./NetworkOperatorView";
import ServiceProviderView from "./ServiceProviderView";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogIn, User as UserIcon } from "lucide-react";

type UserRole = "serviceProvider" | "networkOperator";

interface User {
  id: string;
  name: string;
  role: UserRole;
  logoUrl: string;
  email: string;
  userName: string;
}

// Test accounts for demonstration
const testAccounts: User[] = [
  {
    id: "sp1",
    name: "Noodle Fiber",
    userName: "Sarah Johnson",
    role: "serviceProvider",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=noodle",
    email: "sarah@noodlefiber.com",
  },
  {
    id: "sp2",
    name: "Podunk Fiber",
    userName: "Mike Chen",
    role: "serviceProvider",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=podunk",
    email: "mike@podunkfiber.com",
  },
  {
    id: "sp3",
    name: "Fiddle Faddle Fiber",
    userName: "Lisa Park",
    role: "serviceProvider",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=fiddle",
    email: "lisa@fiddlefaddlefiber.com",
  },
  {
    id: "no1",
    name: "Valhalla Fiber",
    userName: "Jennifer Davis",
    role: "networkOperator",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=valhalla",
    email: "jennifer@valhallafiber.com",
  },
  {
    id: "no2",
    name: "Lochness Fiber",
    userName: "Robert Wilson",
    role: "networkOperator",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=lochness",
    email: "robert@lochnessfiber.com",
  },
  {
    id: "no3",
    name: "Shangri La Fiber",
    userName: "David Kim",
    role: "networkOperator",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=shangri",
    email: "david@shangrilafiber.com",
  },
];

const Home = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("products");

  // Handle login with test account
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab("products"); // Reset to products tab when switching users
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("products");
  };

  // Handle settings navigation
  const handleSettingsNavigation = () => {
    if (currentUser?.role === "serviceProvider") {
      setActiveTab("settings");
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  // Show login screen if no user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12">
                <img
                  src="/meernatlogo.png"
                  alt="Meernat logo"
                  className="h-full w-auto object-contain"
                />
              </div>
              <span className="font-semibold text-2xl font-roboto">
                Meernat Billing Portal
              </span>
            </div>
            <CardTitle className="text-2xl">Select Test Account</CardTitle>
            <CardDescription>
              Choose a test account to explore the dashboard functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Service Provider Accounts */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Service Provider Accounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testAccounts
                    .filter((account) => account.role === "serviceProvider")
                    .map((account) => (
                      <Card
                        key={account.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                        onClick={() => handleLogin(account)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={`h-12 w-12 rounded-full p-0.5 ${
                                  account.id === "sp1"
                                    ? "bg-purple-500"
                                    : account.id === "sp2"
                                      ? "bg-yellow-500"
                                      : account.id === "sp3"
                                        ? "bg-lime-500"
                                        : "bg-primary"
                                }`}
                              >
                                <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                                  <img
                                    src="/meernatlogo.png"
                                    alt={account?.name || "Logo"}
                                    className="h-8 w-8 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {account?.name || "Unknown"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {account?.userName || "Unknown User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {account?.email || "No email"}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                Service Provider
                              </Badge>
                            </div>
                            <LogIn className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Network Operator Accounts */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Network Operator Accounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testAccounts
                    .filter((account) => account.role === "networkOperator")
                    .map((account) => (
                      <Card
                        key={account.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                        onClick={() => handleLogin(account)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={`h-12 w-12 rounded-full p-0.5 ${
                                  account.id === "no1"
                                    ? "bg-teal-500"
                                    : account.id === "no2"
                                      ? "bg-orange-500"
                                      : account.id === "no3"
                                        ? "bg-purple-500"
                                        : "bg-primary"
                                }`}
                              >
                                <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                                  <img
                                    src="/meernatlogo.png"
                                    alt={account?.name || "Logo"}
                                    className="h-8 w-8 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {account?.name || "Unknown"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {account?.userName || "Unknown User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {account?.email || "No email"}
                              </p>
                              <Badge variant="secondary" className="mt-1">
                                Network Operator
                              </Badge>
                            </div>
                            <LogIn className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={currentUser}
      onLogout={handleLogout}
      onSettingsClick={handleSettingsNavigation}
    >
      <div className="p-4 md:p-6 w-full bg-background">
        {/* Demo controls */}
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-orange-200">
                🚀 Demo Mode
              </h2>
              <p className="text-sm text-orange-100/80">
                Currently logged in as: {currentUser?.userName || "Unknown"} (
                {currentUser?.name || "Unknown"})
              </p>
              <p className="text-xs text-orange-100/60">
                Role:{" "}
                {currentUser?.role === "serviceProvider"
                  ? "Service Provider"
                  : "Network Operator"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-sm border-orange-500/30 text-orange-200 hover:bg-orange-500/20"
            >
              Switch Account
            </Button>
          </div>
        </div>

        {/* Main content area with role-based view */}
        <motion.div
          key={currentUser?.id || "default"} // Key changes trigger animation
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="w-full"
        >
          {currentUser?.role === "networkOperator" ? (
            <NetworkOperatorView
              operatorName={currentUser?.name || "Unknown Operator"}
              operatorLogo={currentUser?.logoUrl || ""}
            />
          ) : (
            <ServiceProviderView
              providerName={currentUser?.name || "Unknown Provider"}
              providerLogo={currentUser?.logoUrl || ""}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Home;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser, SignOutButton, useOrganizationList, useOrganization } from "@clerk/clerk-react";
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
import { User as UserIcon, LogOut } from "lucide-react";

type UserRole = "serviceProvider" | "networkOperator";

interface User {
  id: string;
  name: string;
  role: UserRole;
  logoUrl: string;
  email: string;
  userName: string;
}

const Home = () => {
  const { user, isSignedIn } = useUser();
  const { userMemberships, isLoaded: orgsLoaded } = useOrganizationList();
  const { organization } = useOrganization();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>("products");
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [isCheckingRoles, setIsCheckingRoles] = useState(true);

  // Check for roles from sessionStorage (set by login component)
  useEffect(() => {
    if (isSignedIn && user) {
      console.log("=== CLERK USER INFO ===");
      console.log("User ID:", user.id);
      console.log("User Email:", user.emailAddresses?.[0]?.emailAddress);
      console.log("User Name:", user.firstName, user.lastName);
      console.log("User Image:", user.imageUrl);

      // Check sessionStorage for roles set by login component
      const storedRoles = sessionStorage.getItem('userRoles');
      if (storedRoles) {
        try {
          const roles = JSON.parse(storedRoles) as string[];
          console.log("Found stored roles:", roles);

          const userRoles: UserRole[] = [];
          if (roles.includes('serviceProvider')) {
            userRoles.push('serviceProvider');
          }
          if (roles.includes('networkOperator')) {
            userRoles.push('networkOperator');
          }

          console.log("Processed user roles:", userRoles);
          setAvailableRoles(userRoles);

          // Auto-select role if only one is available
          if (userRoles.length === 1) {
            console.log("Auto-selecting role:", userRoles[0]);
            setSelectedRole(userRoles[0]);
          }

          // Clear the stored roles
          sessionStorage.removeItem('userRoles');
        } catch (error) {
          console.error("Error parsing stored roles:", error);
        }
      } else {
        // Fallback to checking organizations directly
        console.log("No stored roles found, checking organizations directly...");
        console.log("=== CLERK ORGANIZATIONS DEBUG ===");
        console.log("Organizations loaded:", orgsLoaded);
        console.log("User memberships data:", userMemberships);
        console.log("Current organization:", organization);
        console.log("User memberships count:", userMemberships.data?.length || 0);

        // Try using the user's getOrganizationMemberships method
        console.log("=== TRYING DIRECT ORG MEMBERSHIPS ===");
        user.getOrganizationMemberships()
          .then((memberships) => {
            console.log("Direct organization memberships:", memberships);
            console.log("Direct memberships count:", memberships.data?.length || 0);

            const roles: UserRole[] = [];

            if (memberships.data) {
              memberships.data.forEach((membership, index) => {
                console.log(`Direct Membership ${index + 1}:`, {
                  id: membership.organization.id,
                  name: membership.organization.name,
                  slug: membership.organization.slug,
                  role: membership.role,
                  permissions: membership.permissions
                });

                // Check organization slug to determine role
                const slug = membership.organization.slug?.toLowerCase();
                if (slug?.includes('network') || slug?.includes('operator')) {
                  if (!roles.includes('networkOperator')) {
                    roles.push('networkOperator');
                  }
                } else if (slug?.includes('service') || slug?.includes('provider')) {
                  if (!roles.includes('serviceProvider')) {
                    roles.push('serviceProvider');
                  }
                }
              });
            }

            console.log("Detected available roles:", roles);
            setAvailableRoles(roles);

            // Auto-select role if only one is available
            if (roles.length === 1) {
              console.log("Auto-selecting role:", roles[0]);
              setSelectedRole(roles[0]);
            }
          })
          .catch((error) => {
            console.error("Error getting direct memberships:", error);
            // Fallback to showing both roles if we can't determine
            setAvailableRoles(['serviceProvider', 'networkOperator']);
          });
      }

      console.log("=== END CLERK INFO ===");
      setIsCheckingRoles(false);
    }
  }, [isSignedIn, user, userMemberships.data, orgsLoaded, organization]);

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setActiveTab("products"); // Reset to products tab when switching roles
  };

  // Handle logout
  const handleLogout = () => {
    setSelectedRole(null);
    setActiveTab("products");
    setAvailableRoles([]);
    setIsCheckingRoles(true);
  };

  // Handle settings navigation
  const handleSettingsNavigation = () => {
    if (selectedRole === "serviceProvider") {
      setActiveTab("settings");
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  // Create user object from Clerk user data
  const createUserFromClerk = (role: UserRole): User => {
    return {
      id: user?.id || "unknown",
      name: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || "User",
      role: role,
      logoUrl: user?.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
      email: user?.emailAddresses?.[0]?.emailAddress || "No email",
      userName: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || "User",
    };
  };

  // Show loading while determining roles
  if (isSignedIn && (isCheckingRoles || !orgsLoaded)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isCheckingRoles ? "Checking your access..." : "Loading your organizations..."}
          </p>
        </div>
      </div>
    );
  }

  // Show role selection if user is signed in, has multiple roles, and no role is selected
  if (isSignedIn && availableRoles.length > 1 && !selectedRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
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
            <CardTitle className="text-2xl">Welcome, {user?.firstName || "User"}!</CardTitle>
            <CardDescription>
              You have access to multiple dashboards. Please select which one you'd like to access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Service Provider Role */}
              {availableRoles.includes('serviceProvider') && (
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => handleRoleSelect("serviceProvider")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full p-1 bg-purple-500">
                          <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                            <img
                              src="/meernatlogo.png"
                              alt="Service Provider"
                              className="h-10 w-10 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold">Service Provider</h4>
                        <p className="text-muted-foreground">
                          Manage your services, view billing, and handle customer accounts
                        </p>
                        <Badge variant="outline" className="mt-2">
                          Service Provider Dashboard
                        </Badge>
                      </div>
                      <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Network Operator Role */}
              {availableRoles.includes('networkOperator') && (
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => handleRoleSelect("networkOperator")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full p-1 bg-teal-500">
                          <div className="h-full w-full bg-black rounded-full flex items-center justify-center">
                            <img
                              src="/meernatlogo.png"
                              alt="Network Operator"
                              className="h-10 w-10 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold">Network Operator</h4>
                        <p className="text-muted-foreground">
                          Monitor network performance, manage infrastructure, and view analytics
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          Network Operator Dashboard
                        </Badge>
                      </div>
                      <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sign Out Button */}
              <div className="flex justify-center pt-4">
                <SignOutButton>
                  <Button variant="outline" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no roles are available
  if (isSignedIn && availableRoles.length === 0 && !isCheckingRoles) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
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
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have access to any dashboards. Please contact your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <SignOutButton>
                <Button variant="outline" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create current user object
  const currentUser = selectedRole ? createUserFromClerk(selectedRole) : null;

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
            <div className="flex gap-2">
              {availableRoles.length > 1 && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm border-orange-500/30 text-orange-200 hover:bg-orange-500/20"
                >
                  Switch Role
                </Button>
              )}
              <SignOutButton>
                <Button
                  variant="outline"
                  className="text-sm border-orange-500/30 text-orange-200 hover:bg-orange-500/20 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
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

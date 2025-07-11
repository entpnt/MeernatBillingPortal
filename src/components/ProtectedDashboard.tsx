import React from "react";
import { useUser } from "@clerk/clerk-react";
import Home from "./home";

const ProtectedDashboard = () => {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return null; // This will be handled by the router
    }

    return <Home />;
};

export default ProtectedDashboard; 
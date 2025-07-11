import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import LoginPage from "./components/LoginPage";
import ProtectedDashboard from "./components/ProtectedDashboard";
import routes from "tempo-routes";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading while Clerk is initializing
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

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route
            path="/"
            element={isSignedIn ? <ProtectedDashboard /> : <LoginPage />}
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;

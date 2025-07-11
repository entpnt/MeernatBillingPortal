import React, { useState, useEffect } from "react";
import { useSignIn, useSignUp, useClerk, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, LogIn, UserPlus } from "lucide-react";

type AuthMode = "signin" | "signup";

const LoginPage = () => {
    const [mode, setMode] = useState<AuthMode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authCompleted, setAuthCompleted] = useState(false);

    const { signIn, isLoaded: signInLoaded } = useSignIn();
    const { signUp, isLoaded: signUpLoaded } = useSignUp();
    const { openSignIn } = useClerk();
    const { user, isSignedIn, isLoaded: userLoaded } = useUser();

    // Debug authentication state
    useEffect(() => {
        console.log("=== AUTH STATE DEBUG ===");
        console.log("isSignedIn:", isSignedIn);
        console.log("user:", user);
        console.log("userLoaded:", userLoaded);
        console.log("isAuthenticating:", isAuthenticating);
        console.log("authCompleted:", authCompleted);
        console.log("=== END AUTH STATE DEBUG ===");
    }, [isSignedIn, user, userLoaded, isAuthenticating, authCompleted]);

    // Handle post-authentication flow
    useEffect(() => {
        console.log("=== POST-AUTH FLOW CHECK ===");
        console.log("Conditions:", {
            isSignedIn,
            user: !!user,
            userLoaded,
            isAuthenticating: !isAuthenticating,
            authCompleted
        });

        if (isSignedIn && user && userLoaded && !isAuthenticating && authCompleted) {
            console.log("Starting post-authentication flow...");
            setIsAuthenticating(true);

            // Check user's organization memberships
            user.getOrganizationMemberships()
                .then((memberships) => {
                    console.log("Checking organization memberships after sign in...");
                    console.log("Memberships:", memberships);

                    const roles: string[] = [];

                    if (memberships.data) {
                        memberships.data.forEach((membership) => {
                            console.log("Checking membership:", membership.organization.slug);

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

                    console.log("Detected roles:", roles);

                    // Store roles in sessionStorage for the dashboard to use
                    sessionStorage.setItem('userRoles', JSON.stringify(roles));

                    // Redirect to dashboard - the dashboard will handle role selection
                    console.log("Redirecting to dashboard...");
                    window.location.href = '/';
                })
                .catch((error) => {
                    console.error("Error checking memberships:", error);
                    // Fallback - redirect to dashboard anyway
                    window.location.href = '/';
                });
        }
    }, [isSignedIn, user, userLoaded, isAuthenticating, authCompleted]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (mode === "signin") {
                console.log("Attempting sign in...");
                const result = await signIn.create({
                    identifier: email,
                    password,
                });

                console.log("Sign in result:", result);

                if (result.status === "complete") {
                    console.log("Sign in successful");
                    setAuthCompleted(true);

                    // Use the result directly instead of waiting for state update
                    if (result.createdSessionId) {
                        console.log("Session created, proceeding with organization check...");
                        handlePostAuthFlow();
                    } else {
                        console.log("No session created, waiting for state update...");
                        // Fallback to waiting for state update
                        setTimeout(() => {
                            console.log("Delayed auth completion check...");
                            if (isSignedIn && user) {
                                console.log("User is signed in, proceeding with organization check...");
                                handlePostAuthFlow();
                            } else {
                                console.log("State still not updated, forcing redirect...");
                                window.location.href = '/';
                            }
                        }, 1000);
                    }
                } else {
                    setError("Sign in failed. Please try again.");
                }
            } else {
                console.log("Attempting sign up...");
                const result = await signUp.create({
                    emailAddress: email,
                    password,
                    firstName,
                    lastName,
                });

                console.log("Sign up result:", result);

                if (result.status === "complete") {
                    console.log("Sign up successful");
                    setAuthCompleted(true);

                    // Use the result directly instead of waiting for state update
                    if (result.createdSessionId) {
                        console.log("Session created, proceeding with organization check...");
                        handlePostAuthFlow();
                    } else {
                        console.log("No session created, waiting for state update...");
                        // Fallback to waiting for state update
                        setTimeout(() => {
                            console.log("Delayed auth completion check...");
                            if (isSignedIn && user) {
                                console.log("User is signed in, proceeding with organization check...");
                                handlePostAuthFlow();
                            } else {
                                console.log("State still not updated, forcing redirect...");
                                window.location.href = '/';
                            }
                        }, 1000);
                    }
                } else {
                    setError("Sign up failed. Please try again.");
                }
            }
        } catch (err: any) {
            console.error("Authentication error:", err);
            setError(err.errors?.[0]?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostAuthFlow = async () => {
        console.log("Starting manual post-auth flow...");
        setIsAuthenticating(true);

        try {
            const memberships = await user!.getOrganizationMemberships();
            console.log("Organization memberships:", memberships);

            const roles: string[] = [];

            if (memberships.data) {
                memberships.data.forEach((membership) => {
                    console.log("Checking membership:", membership.organization.slug);

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

            console.log("Detected roles:", roles);

            // Store roles in sessionStorage for the dashboard to use
            sessionStorage.setItem('userRoles', JSON.stringify(roles));

            // Redirect to dashboard - the dashboard will handle role selection
            console.log("Redirecting to dashboard...");
            window.location.href = '/';
        } catch (error) {
            console.error("Error checking memberships:", error);
            // Fallback - redirect to dashboard anyway
            window.location.href = '/';
        }
    };

    const handleSocialSignIn = (strategy: string) => {
        if (strategy === "oauth_google") {
            signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/",
                redirectUrlComplete: "/",
            });
        } else if (strategy === "oauth_github") {
            signIn.authenticateWithRedirect({
                strategy: "oauth_github",
                redirectUrl: "/",
                redirectUrlComplete: "/",
            });
        }
    };

    const toggleMode = () => {
        setMode(mode === "signin" ? "signup" : "signin");
        setError("");
    };

    // Show loading while Clerk is initializing or user is being authenticated
    if (!signInLoaded || !signUpLoaded || !userLoaded || isAuthenticating) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                        {isAuthenticating ? "Setting up your dashboard..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    // If user is already signed in, redirect to dashboard
    if (isSignedIn) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

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
                    <CardTitle className="text-2xl">
                        {mode === "signin" ? "Welcome Back" : "Create Account"}
                    </CardTitle>
                    <CardDescription>
                        {mode === "signin"
                            ? "Sign in to access your billing dashboard"
                            : "Create your account to get started"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "signup" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="pl-10"
                                            placeholder="John"
                                            required={mode === "signup"}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="pl-10"
                                            placeholder="Doe"
                                            required={mode === "signup"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : mode === "signin" ? (
                                <LogIn className="h-4 w-4 mr-2" />
                            ) : (
                                <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            {isLoading
                                ? "Processing..."
                                : mode === "signin"
                                    ? "Sign In"
                                    : "Create Account"
                            }
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleSocialSignIn("oauth_google")}
                                className="w-full"
                            >
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => handleSocialSignIn("oauth_github")}
                                className="w-full"
                            >
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                                    />
                                </svg>
                                GitHub
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                {mode === "signin" ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage; 
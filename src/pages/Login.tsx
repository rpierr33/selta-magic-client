import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateSecurePassword } from "@/utils/passwordUtils";
import Logo from "@/components/shared/Logo";

export default function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, signup, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Display error from either local state or auth context
  const displayError = localError || error;

  useEffect(() => {
    if (user) {
      const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';
      navigate(redirectPath);
    }
  }, [user, navigate, location.search]);

  useEffect(() => {
    // Clear errors when switching tabs
    setLocalError(null);
    clearError();
  }, [activeTab, clearError]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (localError || error) {
      setLocalError(null);
      clearError();
    }
  }, [loginEmail, loginPassword, signupEmail, signupPassword, firstName, lastName]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      await login(loginEmail, loginPassword);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setLocalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      setLocalError("Passwords don't match. Please ensure both passwords match.");
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      await signup(signupEmail, signupPassword, firstName, lastName);
      toast({
        title: "Account created successfully!",
        description: "You are now logged in.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setLocalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const newPassword = generateSecurePassword();
    setSignupPassword(newPassword);
    setSignupConfirmPassword(newPassword);
    toast({
      title: "Password generated",
      description: "A secure password has been generated for you.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex">
        {/* Left branded panel - hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-selta-deep-purple via-selta-deep-purple to-purple-900 relative overflow-hidden items-center justify-center">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-selta-gold/10 via-transparent to-selta-gold/5" />
          {/* Decorative circles */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-selta-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-selta-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center px-12 max-w-lg">
            <div className="flex justify-center mb-8">
              <Sparkles className="h-16 w-16 text-selta-gold" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-display font-bold text-white mb-6 leading-tight">
              Selta Magic
            </h1>
            <p className="text-xl text-selta-gold font-medium mb-4">
              Elevate Your Natural Beauty
            </p>
            <p className="text-gray-300 text-base leading-relaxed">
              Discover premium hair care products crafted with care to nurture your natural hair. Join thousands of happy customers on their hair growth journey.
            </p>
            <div className="mt-10 flex justify-center gap-8 text-gray-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">5K+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9</div>
                <div className="text-sm">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-8 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Logo at top of form */}
            <div className="flex justify-center mb-6">
              <Logo variant="cart" className="h-16 w-auto" />
            </div>

            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-selta-deep-purple/5">
                <TabsTrigger
                  value="login"
                  className="text-sm font-medium data-[state=active]:bg-selta-deep-purple data-[state=active]:text-white transition-all duration-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="text-sm font-medium data-[state=active]:bg-selta-deep-purple data-[state=active]:text-white transition-all duration-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {displayError && (
                <Alert variant="destructive" className="mb-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <AlertDescription className="flex-1">{displayError}</AlertDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-2"
                      onClick={() => {
                        setLocalError(null);
                        clearError();
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </Alert>
              )}

              <TabsContent value="login" className="mt-0">
                <Card className="shadow-lg border-0 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-center text-selta-deep-purple">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          required
                          disabled={loading}
                          autoComplete="email"
                          className="h-11 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <Button variant="link" className="text-xs p-0 h-auto text-selta-deep-purple">
                            Forgot password?
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="current-password"
                            className="pr-10 h-11 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-2">
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-selta-deep-purple hover:bg-selta-deep-purple/90 text-white font-medium text-base transition-colors duration-200"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                      <div className="text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-selta-deep-purple font-medium"
                          onClick={() => setActiveTab("signup")}
                        >
                          Sign up here
                        </Button>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <Card className="shadow-lg border-0 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-center text-selta-deep-purple">Create an Account</CardTitle>
                    <CardDescription className="text-center">
                      Enter your details to create a new account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            placeholder="John"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="given-name"
                            className="h-11 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            placeholder="Doe"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="family-name"
                            className="h-11 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={e => setSignupEmail(e.target.value)}
                          required
                          disabled={loading}
                          autoComplete="email"
                          className="h-11 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signup-password">Password</Label>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="text-xs p-0 h-auto text-selta-deep-purple"
                            onClick={generatePassword}
                          >
                            Generate secure password
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={e => setSignupPassword(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            className="pr-10 h-11 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                          >
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={signupConfirmPassword}
                            onChange={e => setSignupConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            className="pr-10 h-11 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-2">
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-selta-gold text-selta-deep-purple hover:bg-selta-gold/90 font-medium text-base transition-colors duration-200"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                      <div className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-selta-deep-purple font-medium"
                          onClick={() => setActiveTab("login")}
                        >
                          Sign in here
                        </Button>
                      </div>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import hitsLogo from "@/assets/hits-logo-minimal.png";

export default function CoachAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        navigate("/coach-dashboard");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/coach-dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/coach-auth`,
        });

        if (error) {
          setLoading(false);
          toast.error(error.message || "An error occurred");
          return;
        }
        toast.success("Password reset email sent! Check your inbox.");
        setIsForgotPassword(false);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        if (!organizationName.trim()) {
          toast.error("Organization name is required");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/coach-dashboard`,
            data: {
              organization_name: organizationName,
              user_type: 'coach'
            }
          },
        });

        if (error) {
          setLoading(false);
          toast.error(error.message || "An error occurred");
          return;
        }
        toast.success("Account created! You can now sign in.");
        setIsSignUp(false);
        setLoading(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setLoading(false);
          toast.error(error.message || "An error occurred");
          return;
        }
        toast.success("Signed in successfully!");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" className="mb-4 text-white hover:text-yellow-500 hover:bg-white/10">
          <Link to="/auth">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login Options
          </Link>
        </Button>
        <Card className="w-full border-white/10 bg-zinc-900 text-white">
          <CardHeader className="text-center">
            <img 
              src={hitsLogo} 
              alt="H.I.T.S. Logo" 
              className="h-20 mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-black uppercase">
              {isForgotPassword ? "Reset Password" : isSignUp ? "Coach Registration" : "Coach Sign In"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isForgotPassword
                ? "Enter your email to receive a password reset link"
                : isSignUp 
                ? "Create your coaching organization account" 
                : "Sign in to your coaching dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && !isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Your Academy/Team Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="coach@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                />
              </div>
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
                  />
                </div>
              )}
              <Button type="submit" className="w-full bg-yellow-500 text-black font-bold uppercase hover:bg-yellow-400" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isForgotPassword ? "Send Reset Link" : isSignUp ? "Create Coach Account" : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              {!isForgotPassword && (
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                  className="text-yellow-500 hover:text-yellow-400"
                >
                  {isSignUp 
                    ? "Already have a coach account? Sign in" 
                    : "Need to register your organization? Sign up"}
                </Button>
              )}
              <Button
                variant="link"
                onClick={() => {
                  setIsForgotPassword(!isForgotPassword);
                  if (isForgotPassword) {
                    setIsSignUp(false);
                  }
                }}
                disabled={loading}
                className="text-gray-400 hover:text-yellow-400 block w-full"
              >
                {isForgotPassword ? "Back to sign in" : "Forgot password?"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

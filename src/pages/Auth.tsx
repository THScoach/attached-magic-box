import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, User } from "lucide-react";
import hitsLogo from "@/assets/hits-logo-minimal.png";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
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
      <div className="w-full max-w-md space-y-4">
        <Button asChild variant="ghost" className="mb-4 text-white hover:text-yellow-500 hover:bg-white/10">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        {/* Role Selection Links */}
        <Card className="w-full border-white/10 bg-zinc-900 text-white p-6">
          <h3 className="text-lg font-bold text-center mb-4">I am a...</h3>
          <div className="grid grid-cols-3 gap-3">
            <Button asChild variant="outline" className="flex-col h-auto py-4 border-zinc-700 hover:border-yellow-500 hover:bg-zinc-800">
              <Link to="/auth?role=player">
                <User className="h-6 w-6 mb-2" />
                <span className="text-sm">Player</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-col h-auto py-4 border-zinc-700 hover:border-yellow-500 hover:bg-zinc-800">
              <Link to="/coach-auth">
                <User className="h-6 w-6 mb-2" />
                <span className="text-sm">Coach</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-col h-auto py-4 border-zinc-700 hover:border-yellow-500 hover:bg-zinc-800">
              <Link to="/admin">
                <User className="h-6 w-6 mb-2" />
                <span className="text-sm">Admin</span>
              </Link>
            </Button>
          </div>
        </Card>
        <Card className="w-full border-white/10 bg-zinc-900 text-white">
        <CardHeader className="text-center">
          <img 
            src={hitsLogo} 
            alt="H.I.T.S. Logo" 
            className="h-20 mx-auto mb-4"
          />
          <CardTitle className="text-2xl font-black uppercase">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription className="text-gray-400">
            {isSignUp 
              ? "Sign up to start your hitting journey" 
              : "Sign in to continue your training"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
              />
            </div>
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
            <Button type="submit" className="w-full bg-yellow-500 text-black font-bold uppercase hover:bg-yellow-400" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
              className="text-yellow-500 hover:text-yellow-400"
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

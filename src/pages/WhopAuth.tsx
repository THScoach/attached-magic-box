import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWhopAuth } from "@/contexts/WhopContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { HitsLogo } from "@/components/HitsLogo";

export default function WhopAuth() {
  const { user, isLoading, membership } = useWhopAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Check if user is already authenticated with Supabase
    checkSupabaseAuth();
  }, []);

  const checkSupabaseAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Already authenticated, go to home
      navigate('/home');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setAuthLoading(true);
    try {
      if (mode === 'signup') {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              whop_user_id: user?.id,
              whop_username: user?.username,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Link Whop data to profile
          await supabase
            .from('profiles')
            .update({
              whop_user_id: user?.id,
              whop_username: user?.username,
            })
            .eq('id', data.user.id);

          toast.success("Account created! Welcome to HITS.");
          navigate('/onboarding');
        }
      } else {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Signed in successfully!");
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <HitsLogo className="h-16" />
            </div>
            <CardTitle>Loading Whop Data</CardTitle>
            <CardDescription>
              Verifying your membership...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <HitsLogo className="h-16" />
          </div>
          <CardTitle>Welcome to HITS</CardTitle>
          <CardDescription>
            {user ? (
              <>Hi {user.username}! {membership?.valid ? 'Your Whop subscription is active.' : 'Complete your setup to get started.'}</>
            ) : (
              'Complete your account setup'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membership?.valid && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active Whop Subscription
              </p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>{mode === 'signup' ? 'Create Account' : 'Sign In'}</>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-sm"
              >
                {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>Your Whop subscription will be linked to this account</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

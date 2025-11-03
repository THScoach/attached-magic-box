import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useUserMembership } from '@/hooks/useUserMembership';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { membership, refetch } = useUserMembership();
  const [checking, setChecking] = useState(true);
  
  // Get tier from URL params
  const params = new URLSearchParams(location.search);
  const expectedTier = params.get('tier') as 'challenge' | 'diy' | 'elite' | null;

  useEffect(() => {
    // Poll for membership update (webhook might take a moment)
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    const checkMembership = async () => {
      await refetch();
      attempts++;

      if (membership?.tier === expectedTier) {
        setChecking(false);
      } else if (attempts >= maxAttempts) {
        // Stop checking after 20 seconds
        setChecking(false);
      } else {
        setTimeout(checkMembership, pollInterval);
      }
    };

    // Start checking after initial delay
    const initialDelay = setTimeout(() => {
      checkMembership();
    }, 1000);

    return () => clearTimeout(initialDelay);
  }, [expectedTier, membership, refetch]);

  const getTierInfo = (tier: string | null) => {
    switch (tier) {
      case 'challenge':
        return {
          title: '7-Day Challenge',
          description: 'You have 7 days of unlimited access. Make the most of it!',
          action: 'Your challenge starts now',
        };
      case 'diy':
        return {
          title: 'DIY Platform',
          description: 'You now have unlimited swing analyses and access to Coach Rick AI.',
          action: "Let's improve your swing",
        };
      case 'elite':
        return {
          title: 'Elite Transformation',
          description: "Welcome to Elite! You'll receive an email within 24 hours to schedule your first 1-on-1 coaching call.",
          action: 'Welcome to the Elite program',
        };
      default:
        return {
          title: 'Welcome',
          description: 'Your membership is being activated.',
          action: 'Processing...',
        };
    }
  };

  const tierInfo = getTierInfo(expectedTier);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">
              Activating your membership...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to The Hitting Skool! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{tierInfo.title}</h3>
            <p className="text-sm text-muted-foreground">
              {tierInfo.description}
            </p>
          </div>

          {expectedTier === 'challenge' && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm">
                Your challenge expires in <strong>7 days</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload as many swings as you want during this time
              </p>
            </div>
          )}

          {expectedTier === 'diy' && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm">
                You now have <strong>unlimited</strong> access to all DIY features
              </p>
            </div>
          )}

          {expectedTier === 'elite' && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm">
                Check your email for next steps to schedule your first coaching call
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/analyze')}
            >
              Analyze Your First Swing
            </Button>
          </div>

          {membership?.tier !== expectedTier && (
            <p className="text-xs text-center text-muted-foreground">
              If your tier hasn't updated yet, please wait a moment and refresh the page.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

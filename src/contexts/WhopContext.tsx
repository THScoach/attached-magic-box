import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface WhopUser {
  id: string;
  email: string;
  username: string;
  membership?: {
    id: string;
    product_id: string;
    plan_id: string;
    valid: boolean;
    valid_until?: string;
  };
}

interface WhopContextValue {
  user: WhopUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  membership: any;
  upgradeToTier: (tier: string) => void;
}

const WhopContext = createContext<WhopContextValue | undefined>(undefined);

export function WhopProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WhopUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Whop iframe SDK
    const initWhop = async () => {
      try {
        // Check if running in Whop iframe
        const isInWhopIframe = window.self !== window.top;
        
        if (isInWhopIframe) {
          // Listen for messages from Whop parent frame
          window.addEventListener('message', (event) => {
            if (event.data.type === 'WHOP_USER_DATA') {
              setUser(event.data.user);
              setIsLoading(false);
            }
          });

          // Request user data from parent
          window.parent.postMessage({ type: 'GET_WHOP_USER' }, '*');

          // Timeout fallback
          setTimeout(() => {
            if (!user) {
              console.warn('Whop user data not received, using mock data for testing');
              // For testing outside Whop
              setUser({
                id: 'test-user',
                email: 'test@example.com',
                username: 'testuser',
                membership: {
                  id: 'test-membership',
                  product_id: 'diy-annual',
                  plan_id: 'diy-annual',
                  valid: true,
                }
              });
              setIsLoading(false);
            }
          }, 2000);
        } else {
          // Not in Whop iframe - use test data
          console.log('Not in Whop iframe, using test data');
          setUser({
            id: 'test-user',
            email: 'test@example.com',
            username: 'testuser',
            membership: {
              id: 'test-membership',
              product_id: 'diy-annual',
              plan_id: 'diy-annual',
              valid: true,
            }
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Whop:', error);
        setIsLoading(false);
      }
    };

    initWhop();
  }, []);

  const upgradeToTier = (tier: string) => {
    // Send message to Whop parent to trigger upgrade flow
    const tierUrls: Record<string, string> = {
      challenge: import.meta.env.VITE_WHOP_CHALLENGE_URL,
      diy: import.meta.env.VITE_WHOP_DIY_URL,
      elite: import.meta.env.VITE_WHOP_ELITE_URL,
    };

    if (window.self !== window.top) {
      window.parent.postMessage({
        type: 'WHOP_UPGRADE',
        tier,
        url: tierUrls[tier]
      }, '*');
    } else {
      // Open in new tab if not in iframe
      window.open(tierUrls[tier], '_blank');
    }
  };

  const value: WhopContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    membership: user?.membership,
    upgradeToTier,
  };

  return <WhopContext.Provider value={value}>{children}</WhopContext.Provider>;
}

export function useWhopAuth() {
  const context = useContext(WhopContext);
  if (context === undefined) {
    throw new Error('useWhopAuth must be used within WhopProvider');
  }
  return context;
}

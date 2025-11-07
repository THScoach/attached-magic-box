import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export function WhopIntegrationPanel() {
  const [copied, setCopied] = useState<string | null>(null);
  const [recentAthletes, setRecentAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/whop-webhook`;

  useEffect(() => {
    loadRecentWhopAthletes();
  }, []);

  const loadRecentWhopAthletes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, whop_user_id, whop_username, created_at')
        .not('whop_user_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentAthletes(data || []);
    } catch (error) {
      console.error('Error loading Whop athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
            Whop Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure your Whop app to sync athlete data automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete this setup in your Whop dashboard to enable automatic athlete syncing when they subscribe.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input 
                  value={webhookUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                >
                  {copied === "Webhook URL" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter this URL in your Whop dashboard under Settings → Webhooks
              </p>
            </div>

            <div className="space-y-2">
              <Label>Webhook Secret</Label>
              <div className="flex gap-2">
                <Input 
                  value="WHOP_WEBHOOK_SECRET" 
                  readOnly 
                  type="password"
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard("WHOP_WEBHOOK_SECRET", "Secret Name")}
                >
                  {copied === "Secret Name" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is configured in your environment variables
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Required Webhook Events</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  membership_went_valid
                </Badge>
                <span className="text-xs text-muted-foreground">
                  When a membership is activated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  membership_went_invalid
                </Badge>
                <span className="text-xs text-muted-foreground">
                  When a membership expires or is cancelled
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Select the events without the "app_" prefix in Whop V5
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="text-xl">🔧</span>
              Setup Steps
            </h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Log in to your Whop dashboard</li>
              <li>Navigate to Settings → Webhooks</li>
              <li>Click "Add Webhook" or edit existing webhook</li>
              <li>Paste the Webhook URL above</li>
              <li>Enter your webhook secret</li>
              <li>Select API version V5 (latest)</li>
              <li>Select the two events listed above</li>
              <li>Save and test the webhook</li>
            </ol>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="text-xl">📋</span>
              Product ID Mapping
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Update these in <code className="px-1 py-0.5 rounded bg-muted text-xs">supabase/functions/whop-webhook/index.ts</code>
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">297-b6</span>
                <span className="text-primary font-semibold">→ Challenge Tier</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">diy-annual</span>
                <span className="text-primary font-semibold">→ DIY Tier</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">elite-90-day-transformation</span>
                <span className="text-primary font-semibold">→ Elite Tier</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-500" />
              </div>
              Webhook Status
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRecentWhopAthletes}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Recent athletes synced from Whop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentAthletes.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No Whop athletes synced yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Athletes will appear here once they subscribe via Whop and the webhook syncs their data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAthletes.map((athlete) => (
                <div
                  key={athlete.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {athlete.whop_username || athlete.email}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Whop
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {athlete.whop_user_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(athlete.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recentAthletes.length > 0 && (
            <Alert className="bg-green-500/5 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-sm">
                ✓ Webhook is working! {recentAthletes.length} athlete{recentAthletes.length !== 1 ? 's' : ''} synced from Whop
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Athlete Subscribes via Whop</p>
                <p className="text-xs text-muted-foreground">
                  Athlete purchases a membership through your Whop storefront
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Webhook Syncs Data</p>
                <p className="text-xs text-muted-foreground">
                  Profile and membership automatically created in your database
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Coach Links Athlete</p>
                <p className="text-xs text-muted-foreground">
                  Use "Add Athlete" → "By Whop ID" to add them to your roster
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                4
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Track Progress</p>
                <p className="text-xs text-muted-foreground">
                  View all swing analyses and metrics in your coach dashboard
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WhopIntegrationPanel() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/whop-webhook`;

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
                  membership.went_valid
                </Badge>
                <span className="text-xs text-muted-foreground">
                  When a membership is activated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  membership.went_invalid
                </Badge>
                <span className="text-xs text-muted-foreground">
                  When a membership expires or is cancelled
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  membership.updated
                </Badge>
                <span className="text-xs text-muted-foreground">
                  When membership details change
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <span className="text-xl">🔧</span>
              Setup Steps
            </h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Log in to your Whop dashboard</li>
              <li>Navigate to Settings → Webhooks</li>
              <li>Click "Add Webhook"</li>
              <li>Paste the Webhook URL above</li>
              <li>Enter your webhook secret</li>
              <li>Select the three events listed above</li>
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

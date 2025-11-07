import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Users, Settings, Link as LinkIcon, BarChart } from "lucide-react";

export function WhopSetupGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Setup Guide</CardTitle>
        <CardDescription>
          Step-by-step instructions for integrating Whop with your coaching dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This integration allows athletes to subscribe through Whop while you maintain full coaching access through this dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Create Whop Products</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up your membership tiers in Whop dashboard (Challenge, DIY, Elite)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Configure Webhook</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect Whop to this dashboard using the webhook URL from the Whop Setup tab
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Athletes Subscribe</h4>
                    <p className="text-sm text-muted-foreground">
                      Athletes purchase memberships through your Whop storefront
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Link Athletes</h4>
                    <p className="text-sm text-muted-foreground">
                      Add athletes to your roster using their Whop User ID
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Track Progress</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor all swing data, analytics, and progress in your dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Whop Dashboard Configuration</h4>
                </div>
                
                <ol className="space-y-3 text-sm ml-7">
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    <div>
                      <p className="font-medium">Navigate to Settings</p>
                      <p className="text-muted-foreground">In your Whop dashboard, go to Settings → Webhooks</p>
                    </div>
                  </li>
                  
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    <div>
                      <p className="font-medium">Create New Webhook</p>
                      <p className="text-muted-foreground">Click "Add Webhook" or "Create Webhook"</p>
                    </div>
                  </li>
                  
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    <div>
                      <p className="font-medium">Enter Webhook URL</p>
                      <p className="text-muted-foreground">Copy the webhook URL from the Whop Setup tab</p>
                    </div>
                  </li>
                  
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">4.</span>
                    <div>
                      <p className="font-medium">Add Secret</p>
                      <p className="text-muted-foreground">Use your WHOP_WEBHOOK_SECRET value</p>
                    </div>
                  </li>
                  
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">5.</span>
                    <div>
                      <p className="font-medium">Select Events</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">membership.went_valid</Badge>
                        <Badge variant="secondary" className="text-xs">membership.went_invalid</Badge>
                        <Badge variant="secondary" className="text-xs">membership.updated</Badge>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">6.</span>
                    <div>
                      <p className="font-medium">Save & Test</p>
                      <p className="text-muted-foreground">Save the webhook and send a test event</p>
                    </div>
                  </li>
                </ol>
              </div>

              <Alert className="bg-blue-500/5 border-blue-500/20">
                <AlertDescription className="text-sm">
                  💡 <strong>Tip:</strong> After saving, Whop will send a test webhook. Check the "Webhook Status" section to verify it's working.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="athletes" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Adding Athletes to Your Roster</h4>
                </div>
                
                <div className="space-y-4 ml-7">
                  <div>
                    <h5 className="font-medium mb-2">Method 1: By Whop User ID (Recommended)</h5>
                    <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                      <li>Athlete subscribes via your Whop storefront</li>
                      <li>Webhook automatically creates their profile</li>
                      <li>Athlete shares their Whop User ID with you</li>
                      <li>Click "Add Athlete" → "By Whop ID" tab</li>
                      <li>Enter their Whop User ID and click "Link Athlete"</li>
                    </ol>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Method 2: By Email</h5>
                    <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                      <li>Athlete must first create an account in the HITS app</li>
                      <li>Click "Add Athlete" → "By Email" tab</li>
                      <li>Enter their email address</li>
                      <li>Click "Add Athlete" to link them to your roster</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">How Athletes Find Their Whop User ID</h4>
                </div>
                
                <p className="text-sm text-muted-foreground ml-7">
                  Instruct your athletes to:
                </p>
                <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground ml-7">
                  <li>Log in to their Whop account</li>
                  <li>Click their profile icon (top right)</li>
                  <li>Go to "Account Settings"</li>
                  <li>Find "User ID" (starts with "user_")</li>
                  <li>Copy and share it with you</li>
                </ol>
              </div>

              <Alert className="bg-green-500/5 border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm">
                  <strong>Pro Tip:</strong> Create a welcome message template asking new subscribers for their Whop User ID right after they join.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-semibold">What happens when an athlete subscribes?</h4>
                <p className="text-sm text-muted-foreground">
                  The webhook automatically creates a profile with their Whop user data and membership tier. All their swing data will be stored in your database, but you need to manually link them to your roster to view it.
                </p>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-semibold">Can athletes use the HITS app directly?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Athletes access the full HITS app through their Whop membership. They can analyze swings, track progress, and access all features based on their subscription tier.
                </p>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-semibold">What if the webhook isn't working?</h4>
                <p className="text-sm text-muted-foreground">
                  Check the "Webhook Status" section in the Whop Setup tab. If no athletes appear, verify your webhook URL, secret, and selected events in the Whop dashboard. You can also check Whop's webhook logs for errors.
                </p>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-semibold">Do I need a separate subscription for coaching?</h4>
                <p className="text-sm text-muted-foreground">
                  No. Your coach account is separate from Whop. Athletes pay through Whop, and you manage them through this free coaching dashboard.
                </p>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-semibold">Can I see all athlete data?</h4>
                <p className="text-sm text-muted-foreground">
                  Once linked to your roster, you can view all swing analyses, metrics, progress reports, and assign training programs. Athletes maintain full control of their own accounts.
                </p>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-semibold">What if an athlete cancels?</h4>
                <p className="text-sm text-muted-foreground">
                  The webhook will automatically update their status. Their historical data remains accessible, but they lose access to new features based on their tier downgrade.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

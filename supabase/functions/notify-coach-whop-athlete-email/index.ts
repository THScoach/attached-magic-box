import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendEmailRequest {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { profile_id, whop_user_id, whop_username, email } = await req.json();

    console.log('[Email Coach] New Whop athlete:', { profile_id, whop_user_id });

    if (!resendApiKey) {
      console.log('[Email Coach] RESEND_API_KEY not configured, skipping email');
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all coaches with their email addresses
    const { data: coaches, error: coachError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles!inner(email)
      `)
      .eq('role', 'coach');

    if (coachError || !coaches || coaches.length === 0) {
      console.log('[Email Coach] No coaches found to notify');
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coachEmails = coaches
      .map(c => c.profiles?.email)
      .filter(email => email) as string[];

    if (coachEmails.length === 0) {
      console.log('[Email Coach] No coach emails found');
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email via Resend
    const athleteName = whop_username || email || 'New Athlete';
    
    const emailData: ResendEmailRequest = {
      from: 'HITS Coaching <notifications@updates.thehittingskool.com>',
      to: coachEmails,
      subject: `🎯 New Athlete Subscribed via Whop - ${athleteName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: bold;">🎯 NEW ATHLETE ALERT</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Great news! A new athlete has subscribed to HITS through your Whop storefront.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700;">
                <h3 style="margin-top: 0; color: #000;">Athlete Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; width: 40%;">Name/Email:</td>
                    <td style="padding: 8px 0;">${athleteName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600;">Whop User ID:</td>
                    <td style="padding: 8px 0; font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px;">${whop_user_id}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>⚡ Next Steps:</strong>
                </p>
                <ol style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                  <li>Log in to your coach dashboard</li>
                  <li>Navigate to the Athletes section</li>
                  <li>Click "Add Athlete"</li>
                  <li>Select the "By Whop ID" tab</li>
                  <li>Enter the Whop User ID: <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${whop_user_id}</code></li>
                  <li>Click "Link Athlete"</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/coach-dashboard" 
                   style="display: inline-block; background: #FFD700; color: #000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Open Coach Dashboard
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                  Need help? Check out the Whop Setup guide in your coach dashboard or reply to this email.
                </p>
                <p style="font-size: 12px; color: #999; margin-top: 15px;">
                  This is an automated notification from The Hitting Skool. You're receiving this because you're a registered coach in the HITS platform.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email Coach] Resend API error:', error);
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();
    console.log('[Email Coach] Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, notified: coachEmails.length, emailId: result.id }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Email Coach] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

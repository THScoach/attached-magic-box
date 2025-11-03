import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple email validation - blocks common disposable email domains
const disposableEmailDomains = [
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'trashmail.com', 'temp-mail.org', 'yopmail.com'
];

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  const domain = email.split('@')[1].toLowerCase();
  return !disposableEmailDomains.some(d => domain.includes(d));
};

// Rate limiting using Supabase (tracks by email and IP)
const checkRateLimit = async (supabase: any, email: string, ipAddress: string) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Check submissions in last hour
  const { data, error } = await supabase
    .from('leads')
    .select('id')
    .or(`email.eq.${email},metadata->>ip.eq.${ipAddress}`)
    .gte('created_at', oneHourAgo);
  
  if (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
  
  return (data?.length || 0) < 3; // Max 3 per hour
};

interface LeadEmailRequest {
  name: string;
  email: string;
  honeypot?: string;
  ipAddress?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, honeypot, ipAddress }: LeadEmailRequest = await req.json();

    // Bot protection: honeypot field check
    if (honeypot) {
      console.log('Bot detected: honeypot filled');
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or disposable email address' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get Supabase client for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limit
    const withinLimit = await checkRateLimit(supabase, email, ipAddress || 'unknown');
    if (!withinLimit) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get auth header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Store lead in database
    const { error: leadError } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name,
        email,
        source: 'sample_report',
        metadata: { ip: ipAddress }
      });

    if (leadError) {
      console.error('Lead storage error:', leadError);
    }

    // Send email with sample report link
    const reportUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://yourapp.com'}/demo-report`;
    
    const emailResponse = await resend.emails.send({
      from: "HITS <hello@hits.com>",
      to: [email],
      subject: "Your Sample Swing Analysis Report",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F4C430 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { margin: 0; color: #1a1a1a; font-size: 28px; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; }
            .cta-button { display: inline-block; background: #F4C430; color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Sample Report is Ready!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              
              <p>Thank you for your interest in the H.I.T.S. (Holistic Integrated Timing System) swing analysis platform!</p>
              
              <p>Your sample swing analysis report is ready to view. This report demonstrates how we track progress over time using our Three Pillars approach:</p>
              
              <ul>
                <li><strong>ANCHOR</strong> - Front leg stability and ground force</li>
                <li><strong>ENGINE</strong> - Tempo, timing, and rotational power</li>
                <li><strong>WHIP</strong> - Bat speed and kinetic release</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${reportUrl}" class="cta-button">View Your Sample Report</a>
              </p>
              
              <p>This is just a sample of what you'll get with a full H.I.T.S. membership. When you sign up, you'll receive:</p>
              
              <ul>
                <li>✓ Unlimited swing analyses</li>
                <li>✓ Personalized training programs</li>
                <li>✓ Progress tracking over time</li>
                <li>✓ Drill recommendations</li>
                <li>✓ Access to Coach Rick's expertise</li>
              </ul>
              
              <p>Ready to take your swing to the next level?</p>
              
              <p style="text-align: center;">
                <a href="${reportUrl.replace('/demo-report', '/auth')}" style="color: #F4C430; font-weight: bold; text-decoration: none;">Get Started Free →</a>
              </p>
              
              <p>Best regards,<br>
              <strong>The H.I.T.S. Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 The Hitting Skool. All rights reserved.</p>
              <p>You received this email because you requested a sample report at thehittingskool.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailSent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-lead-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

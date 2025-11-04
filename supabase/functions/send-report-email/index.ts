import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  userId: string;
  playerId?: string;
  reportUrl: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  metrics: {
    totalSwings: number;
    avgScore: number;
    improvement: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { userId, playerId, reportUrl, reportType, periodStart, periodEnd, metrics } = await req.json() as EmailRequest;

    console.log('Sending report email for user:', userId);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Get player name if specified
    let playerName = `${profile.first_name} ${profile.last_name}`;
    if (playerId) {
      const { data: player } = await supabase
        .from('players')
        .select('first_name, last_name')
        .eq('id', playerId)
        .single();
      
      if (player) {
        playerName = `${player.first_name} ${player.last_name}`;
      }
    }

    const reportTypeLabel = reportType === 'weekly' ? 'Weekly' : 
                           reportType === 'monthly' ? 'Monthly' : 
                           reportType === 'custom' ? 'Custom' : 'Progress';

    const improvementText = metrics.improvement > 0 
      ? `📈 +${metrics.improvement.toFixed(1)} points improvement`
      : metrics.improvement < 0 
      ? `📉 ${metrics.improvement.toFixed(1)} points decline`
      : '➡️ No change';

    // Generate email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportTypeLabel} Progress Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .metric-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .metric-label { color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .metric-value { font-size: 32px; font-weight: bold; color: #1f2937; margin: 10px 0; }
          .metric-subtitle { color: #9ca3af; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
          .button:hover { background: #5568d3; }
          .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚾ ${reportTypeLabel} Progress Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">For ${playerName}</p>
        </div>
        
        <div class="content">
          <p>Hi ${profile.first_name},</p>
          
          <p>Your ${reportTypeLabel.toLowerCase()} progress report from <strong>${new Date(periodStart).toLocaleDateString()}</strong> to <strong>${new Date(periodEnd).toLocaleDateString()}</strong> is ready!</p>
          
          <div class="metric-card">
            <div class="metric-label">Total Swings</div>
            <div class="metric-value">${metrics.totalSwings}</div>
            <div class="metric-subtitle">Analyzed during this period</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Average H.I.T.S. Score</div>
            <div class="metric-value">${metrics.avgScore.toFixed(1)}</div>
            <div class="metric-subtitle">${improvementText}</div>
          </div>
          
          <div style="text-align: center;">
            <a href="${reportUrl}" class="button">View Full Report 📊</a>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Keep up the great work!</strong> Your dedication to improving your swing mechanics is paying off. 
            Review your detailed report to see specific areas of improvement and recommended drills.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} H.I.T.S. Training System</p>
          <p>You're receiving this email because you have automated reports enabled.</p>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HITS Reports <reports@updates.lovable.app>',
        to: profile.email,
        subject: `${reportTypeLabel} Progress Report - ${playerName}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
        message: 'Report email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error sending report email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send report email',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

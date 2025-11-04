import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { playerId, userId, periodStart, periodEnd, reportType = 'manual' } = await req.json();

    console.log('Generating automated report:', { playerId, userId, periodStart, periodEnd });

    // Fetch swing analyses for the period
    const { data: analyses, error: analysesError } = await supabaseClient
      .from('swing_analyses')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd)
      .order('created_at', { ascending: true });

    if (analysesError) throw analysesError;

    if (!analyses || analyses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No swing data found for this period' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch metrics for the period
    const { data: batMetrics } = await supabaseClient
      .from('bat_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);

    const { data: bodyMetrics } = await supabaseClient
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);

    const { data: ballMetrics } = await supabaseClient
      .from('ball_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);

    const { data: brainMetrics } = await supabaseClient
      .from('brain_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);

    // Calculate summary statistics
    const totalSwings = analyses.length;
    const avgOverallScore = analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / totalSwings;
    const avgAnchorScore = analyses.reduce((sum, a) => sum + (a.anchor_score || 0), 0) / totalSwings;
    const avgEngineScore = analyses.reduce((sum, a) => sum + (a.engine_score || 0), 0) / totalSwings;
    const avgWhipScore = analyses.reduce((sum, a) => sum + (a.whip_score || 0), 0) / totalSwings;

    // Calculate trends
    const firstHalf = analyses.slice(0, Math.floor(totalSwings / 2));
    const secondHalf = analyses.slice(Math.floor(totalSwings / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, a) => sum + (a.overall_score || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, a) => sum + (a.overall_score || 0), 0) / secondHalf.length;
    const improvement = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1);

    // Calculate bat metrics averages
    const avgBatSpeed = batMetrics && batMetrics.length > 0
      ? batMetrics.reduce((sum, m) => sum + (Number(m.bat_speed) || 0), 0) / batMetrics.length
      : 0;
    const avgAttackAngle = batMetrics && batMetrics.length > 0
      ? batMetrics.reduce((sum, m) => sum + (Number(m.attack_angle) || 0), 0) / batMetrics.length
      : 0;

    // Calculate ball metrics averages
    const avgExitVelo = ballMetrics && ballMetrics.length > 0
      ? ballMetrics.reduce((sum, m) => sum + (Number(m.exit_velocity) || 0), 0) / ballMetrics.length
      : 0;
    const avgHardHitPct = ballMetrics && ballMetrics.length > 0
      ? ballMetrics.reduce((sum, m) => sum + (Number(m.hard_hit_percentage) || 0), 0) / ballMetrics.length
      : 0;

    // Fetch player info
    const { data: player } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', playerId || userId)
      .single();

    const playerName = player ? `${player.first_name} ${player.last_name}` : 'Athlete';

    // Generate HTML report
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Progress Report - ${playerName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1000px; margin: 0 auto; padding: 40px 20px; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .header p { margin: 0; opacity: 0.9; font-size: 16px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .metric-card h3 { margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 500; }
    .metric-card .value { font-size: 36px; font-weight: bold; color: #1e293b; }
    .metric-card .trend { font-size: 14px; margin-top: 8px; }
    .trend.positive { color: #10b981; }
    .trend.negative { color: #ef4444; }
    .section { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section h2 { margin: 0 0 20px 0; font-size: 24px; color: #1e293b; }
    .pillar-scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .pillar { text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px; }
    .pillar-name { font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .pillar-score { font-size: 32px; font-weight: bold; color: #1e293b; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Progress Report</h1>
    <p>${playerName} • ${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()}</p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <h3>Total Swings</h3>
      <div class="value">${totalSwings}</div>
    </div>
    <div class="metric-card">
      <h3>Avg Score</h3>
      <div class="value">${avgOverallScore.toFixed(0)}</div>
      <div class="trend ${Number(improvement) >= 0 ? 'positive' : 'negative'}">
        ${Number(improvement) >= 0 ? '+' : ''}${improvement}% vs first half
      </div>
    </div>
    <div class="metric-card">
      <h3>Bat Speed</h3>
      <div class="value">${avgBatSpeed.toFixed(1)}<span style="font-size: 18px; color: #64748b;"> mph</span></div>
    </div>
    <div class="metric-card">
      <h3>Exit Velocity</h3>
      <div class="value">${avgExitVelo.toFixed(1)}<span style="font-size: 18px; color: #64748b;"> mph</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Pillar Scores</h2>
    <div class="pillar-scores">
      <div class="pillar">
        <div class="pillar-name">ANCHOR</div>
        <div class="pillar-score">${avgAnchorScore.toFixed(0)}</div>
      </div>
      <div class="pillar">
        <div class="pillar-name">ENGINE</div>
        <div class="pillar-score">${avgEngineScore.toFixed(0)}</div>
      </div>
      <div class="pillar">
        <div class="pillar-name">WHIP</div>
        <div class="pillar-score">${avgWhipScore.toFixed(0)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Key Metrics Summary</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #64748b;">Attack Angle</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600;">${avgAttackAngle.toFixed(1)}°</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #64748b;">Hard Hit %</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600;">${avgHardHitPct.toFixed(0)}%</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #64748b;">Total Practice Sessions</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600;">${totalSwings}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Generated by HITS • ${new Date().toLocaleDateString()}</p>
    <p>Keep training hard! 💪⚾</p>
  </div>
</body>
</html>
    `;

    // Upload report to storage
    const fileName = `report_${userId}_${Date.now()}.html`;
    const { error: uploadError } = await supabaseClient.storage
      .from('swing-videos')
      .upload(`reports/${fileName}`, htmlContent, {
        contentType: 'text/html',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('swing-videos')
      .getPublicUrl(`reports/${fileName}`);

    // Save report record
    const metricsData = {
      totalSwings,
      avgOverallScore: avgOverallScore.toFixed(1),
      avgAnchorScore: avgAnchorScore.toFixed(1),
      avgEngineScore: avgEngineScore.toFixed(1),
      avgWhipScore: avgWhipScore.toFixed(1),
      improvement: improvement,
      avgBatSpeed: avgBatSpeed.toFixed(1),
      avgExitVelo: avgExitVelo.toFixed(1),
      avgHardHitPct: avgHardHitPct.toFixed(0)
    };

    const { data: reportRecord, error: recordError } = await supabaseClient
      .from('generated_reports')
      .insert({
        user_id: userId,
        player_id: playerId,
        report_url: publicUrl,
        report_type: reportType,
        period_start: periodStart,
        period_end: periodEnd,
        metrics: metricsData
      })
      .select()
      .single();

    if (recordError) throw recordError;

    console.log('Report generated successfully:', reportRecord.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportUrl: publicUrl, 
        reportId: reportRecord.id,
        metrics: metricsData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
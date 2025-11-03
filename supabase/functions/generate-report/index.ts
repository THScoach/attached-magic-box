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
    const { analysisIds, playerId } = await req.json();
    
    console.log('Generating report for:', { analysisIds, playerId });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch analyses data
    const { data: analyses, error: fetchError } = await supabase
      .from('swing_analyses')
      .select(`
        id,
        created_at,
        overall_score,
        anchor_score,
        engine_score,
        whip_score,
        video_url,
        metrics
      `)
      .in('id', analysisIds)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching analyses:', fetchError);
      throw fetchError;
    }

    if (!analyses || analyses.length === 0) {
      throw new Error('No analyses found');
    }

    // Fetch player info
    let playerName = 'Athlete';
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

    // Calculate summary statistics
    const avgScore = analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length;
    const firstScore = analyses[0].overall_score;
    const lastScore = analyses[analyses.length - 1].overall_score;
    const improvement = lastScore - firstScore;
    const trend = improvement > 0 ? '↗ Improving' : improvement < 0 ? '↘ Declining' : '→ Stable';

    // Calculate pillar trends
    const anchorTrend = analyses[analyses.length - 1].anchor_score - analyses[0].anchor_score;
    const engineTrend = analyses[analyses.length - 1].engine_score - analyses[0].engine_score;
    const whipTrend = analyses[analyses.length - 1].whip_score - analyses[0].whip_score;

    // Format dates
    const startDate = new Date(analyses[0].created_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endDate = new Date(analyses[analyses.length - 1].created_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { 
      size: letter; 
      margin: 0.5in; 
    }
    @media print {
      .no-print { display: none; }
      body { margin: 0; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #F4C430;
      color: #1a1a1a;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .print-button:hover {
      background: #FFD700;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #F4C430;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      color: #1a1a1a;
    }
    .header .subtitle {
      color: #666;
      font-size: 16px;
      margin-top: 8px;
    }
    .summary-box {
      background: linear-gradient(135deg, #F4C430 0%, #FFD700 100%);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    .summary-box h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .summary-box .stats {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
    .summary-box .stat {
      text-align: center;
    }
    .summary-box .stat-value {
      font-size: 36px;
      font-weight: bold;
      margin: 5px 0;
    }
    .summary-box .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      opacity: 0.8;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section h3 {
      font-size: 20px;
      border-bottom: 2px solid #F4C430;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .progress-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .progress-table th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #ddd;
    }
    .progress-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .pillar-card {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #F4C430;
    }
    .pillar-card h4 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .trend-positive { color: #10b981; font-weight: bold; }
    .trend-negative { color: #ef4444; font-weight: bold; }
    .trend-neutral { color: #6b7280; }
    .footer {
      text-align: center;
      padding-top: 30px;
      margin-top: 40px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Download PDF</button>
  <div class="header">
    <h1>SWING ANALYSIS REPORT</h1>
    <div class="subtitle">${playerName}</div>
    <div class="subtitle">${startDate} - ${endDate}</div>
  </div>

  <div class="summary-box">
    <h2>${analyses.length} Swings Analyzed</h2>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Average HITS Score</div>
        <div class="stat-value">${avgScore.toFixed(1)}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Trend</div>
        <div class="stat-value ${improvement > 0 ? 'trend-positive' : improvement < 0 ? 'trend-negative' : 'trend-neutral'}">
          ${trend}
        </div>
      </div>
      <div class="stat">
        <div class="stat-label">Total Improvement</div>
        <div class="stat-value ${improvement > 0 ? 'trend-positive' : improvement < 0 ? 'trend-negative' : 'trend-neutral'}">
          ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>Progress Overview</h3>
    <table class="progress-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>HITS Score</th>
          <th>ANCHOR</th>
          <th>ENGINE</th>
          <th>WHIP</th>
        </tr>
      </thead>
      <tbody>
        ${analyses.map(a => `
          <tr>
            <td>${new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
            <td><strong>${a.overall_score.toFixed(1)}</strong></td>
            <td>${a.anchor_score.toFixed(1)}</td>
            <td>${a.engine_score.toFixed(1)}</td>
            <td>${a.whip_score.toFixed(1)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h3>Three Pillars Analysis</h3>
    
    <div class="pillar-card">
      <h4>ANCHOR (Front Leg Stability)</h4>
      <p>
        <strong>Range:</strong> ${analyses[0].anchor_score.toFixed(1)} → ${analyses[analyses.length - 1].anchor_score.toFixed(1)}
        <span class="${anchorTrend > 0 ? 'trend-positive' : anchorTrend < 0 ? 'trend-negative' : 'trend-neutral'}">
          (${anchorTrend > 0 ? '+' : ''}${anchorTrend.toFixed(1)})
        </span>
      </p>
      <p><strong>Average:</strong> ${(analyses.reduce((sum, a) => sum + a.anchor_score, 0) / analyses.length).toFixed(1)}</p>
    </div>

    <div class="pillar-card">
      <h4>ENGINE (Tempo & Timing)</h4>
      <p>
        <strong>Range:</strong> ${analyses[0].engine_score.toFixed(1)} → ${analyses[analyses.length - 1].engine_score.toFixed(1)}
        <span class="${engineTrend > 0 ? 'trend-positive' : engineTrend < 0 ? 'trend-negative' : 'trend-neutral'}">
          (${engineTrend > 0 ? '+' : ''}${engineTrend.toFixed(1)})
        </span>
      </p>
      <p><strong>Average:</strong> ${(analyses.reduce((sum, a) => sum + a.engine_score, 0) / analyses.length).toFixed(1)}</p>
    </div>

    <div class="pillar-card">
      <h4>WHIP (Bat Speed & Acceleration)</h4>
      <p>
        <strong>Range:</strong> ${analyses[0].whip_score.toFixed(1)} → ${analyses[analyses.length - 1].whip_score.toFixed(1)}
        <span class="${whipTrend > 0 ? 'trend-positive' : whipTrend < 0 ? 'trend-negative' : 'trend-neutral'}">
          (${whipTrend > 0 ? '+' : ''}${whipTrend.toFixed(1)})
        </span>
      </p>
      <p><strong>Average:</strong> ${(analyses.reduce((sum, a) => sum + a.whip_score, 0) / analyses.length).toFixed(1)}</p>
    </div>
  </div>

  <div class="section">
    <h3>Key Insights</h3>
    ${improvement > 2 ? `
      <div class="pillar-card">
        <h4>✓ Positive Progress</h4>
        <p>Your overall score has improved by ${improvement.toFixed(1)} points over this period. This demonstrates consistent development in your swing mechanics.</p>
      </div>
    ` : improvement < -2 ? `
      <div class="pillar-card">
        <h4>⚠ Areas Needing Attention</h4>
        <p>Your overall score has decreased by ${Math.abs(improvement).toFixed(1)} points. Consider reviewing fundamental mechanics and consulting with a coach.</p>
      </div>
    ` : `
      <div class="pillar-card">
        <h4>→ Maintaining Consistency</h4>
        <p>Your scores are remaining stable. Focus on refinement and building consistency in your swing patterns.</p>
      </div>
    `}

    ${anchorTrend >= engineTrend && anchorTrend >= whipTrend ? `
      <div class="pillar-card">
        <h4>Strongest Area: ANCHOR</h4>
        <p>Your front leg stability has shown the most improvement (+${anchorTrend.toFixed(1)}). This solid foundation will support further development in other areas.</p>
      </div>
    ` : engineTrend >= anchorTrend && engineTrend >= whipTrend ? `
      <div class="pillar-card">
        <h4>Strongest Area: ENGINE</h4>
        <p>Your tempo and timing have improved significantly (+${engineTrend.toFixed(1)}). This efficiency in your kinetic chain is crucial for power generation.</p>
      </div>
    ` : `
      <div class="pillar-card">
        <h4>Strongest Area: WHIP</h4>
        <p>Your bat speed and acceleration have shown excellent progress (+${whipTrend.toFixed(1)}). This translates directly to increased power and exit velocity.</p>
      </div>
    `}
  </div>

  <div class="section">
    <h3>Next Steps</h3>
    <div class="pillar-card">
      <h4>Continue Training</h4>
      <p>Keep working on your swing mechanics with focused drill work. Consistency is key to long-term improvement.</p>
    </div>
    <div class="pillar-card">
      <h4>Schedule Your Next Analysis</h4>
      <p>Regular video analysis helps track progress and identify areas for improvement. Aim for weekly or bi-weekly assessments.</p>
    </div>
  </div>

  <div class="footer">
    <p>Generated by H.I.T.S. Swing Analysis System</p>
    <p>© ${new Date().getFullYear()} - For Training Purposes Only</p>
  </div>
</body>
</html>
    `;

    // Upload HTML to storage
    const fileName = `report-${Date.now()}.html`;
    const filePath = `reports/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('swing-videos')
      .upload(filePath, html, {
        contentType: 'text/html',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('swing-videos')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportUrl: publicUrl,
        analysisCount: analyses.length,
        avgScore: avgScore.toFixed(1),
        improvement: improvement.toFixed(1)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

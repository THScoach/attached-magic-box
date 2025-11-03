import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function DemoReport() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndStoreLead = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign up or log in to view the sample report");
        navigate('/auth?returnTo=/demo-report');
        return;
      }

      // Store lead capture data and send email
      const leadData = sessionStorage.getItem('leadCapture');
      if (leadData) {
        try {
          const { name, email, honeypot } = JSON.parse(leadData);
          
          // Call edge function to send email
          const { error } = await supabase.functions.invoke('send-lead-email', {
            body: {
              name,
              email,
              honeypot,
              ipAddress: 'browser' // Browser doesn't have access to real IP
            }
          });
          
          if (error) {
            console.error('Email send error:', error);
            toast.error("Couldn't send email, but you can still view the report");
          } else {
            toast.success("Check your email for the sample report link!");
          }
          
          sessionStorage.removeItem('leadCapture');
        } catch (error) {
          console.error('Error processing lead:', error);
        }
      }

      setIsLoading(false);
    };

    checkAuthAndStoreLead();
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <p>Loading sample report...</p>
      </div>
    );
  }
  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{`
        @page { 
          size: letter; 
          margin: 0.5in; 
        }
        @media print {
          .no-print { display: none; }
          body { margin: 0; }
        }
        body {
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
        .demo-banner {
          background: #3b82f6;
          color: white;
          padding: 12px;
          text-align: center;
          font-weight: bold;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        .swing-frames-section {
          margin-bottom: 30px;
        }
        .frames-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .frame-box {
          text-align: center;
        }
        .frame-placeholder {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          color: #F4C430;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 24px;
          font-weight: bold;
          border: 2px solid #F4C430;
          margin-bottom: 8px;
        }
        .frame-label {
          font-size: 14px;
          color: #666;
        }
        .comparison-box {
          background: #f9f9f9;
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #F4C430;
        }
        .your-score-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #ddd;
        }
        .your-score-row .label {
          min-width: 120px;
          font-size: 16px;
        }
        .progress-bar-container {
          flex: 1;
          height: 30px;
          background: #e5e7eb;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          transition: width 0.3s ease;
        }
        .percentage {
          min-width: 50px;
          text-align: right;
          font-weight: bold;
          font-size: 18px;
        }
        .elite-scale {
          margin: 20px 0;
        }
        .scale-row {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 6px;
          background: white;
        }
        .scale-row.current {
          background: #fef3c7;
          border: 2px solid #F4C430;
          font-weight: bold;
        }
        .scale-row .stars {
          min-width: 120px;
          font-size: 18px;
        }
        .scale-row .range {
          flex: 1;
        }
        .scale-row .badge {
          background: #F4C430;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        .percentile-callout {
          text-align: center;
          font-size: 18px;
          margin-top: 20px;
          padding: 15px;
          background: white;
          border-radius: 8px;
        }
        .training-plan-card {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #F4C430;
        }
        .training-plan-card h4 {
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        .drill-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .drill-list li {
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .drill-list li:last-child {
          border-bottom: none;
        }
        .expected-gains {
          background: linear-gradient(135deg, #F4C430 0%, #FFD700 100%);
          padding: 25px;
          border-radius: 12px;
          margin-top: 30px;
        }
        .expected-gains h4 {
          margin: 0 0 20px 0;
          text-align: center;
          font-size: 20px;
        }
        .gains-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .gain-item {
          text-align: center;
          background: white;
          padding: 15px;
          border-radius: 8px;
        }
        .gain-value {
          font-size: 32px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        .gain-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
        }
        .testimonial-card {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          border-left: 4px solid #F4C430;
        }
        .testimonial-card .quote {
          font-size: 16px;
          font-style: italic;
          margin-bottom: 10px;
          color: #1a1a1a;
        }
        .testimonial-card .author {
          font-size: 14px;
          color: #666;
          text-align: right;
        }
        .cta-card {
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 20px;
        }
        .cta-card h4 {
          margin: 0 0 15px 0;
          font-size: 24px;
          color: #F4C430;
        }
        .cta-card p {
          margin: 0 0 20px 0;
          font-size: 16px;
        }
        .cta-button-container {
          margin-top: 20px;
        }
        .cta-button {
          background: #F4C430;
          color: #1a1a1a;
          border: none;
          padding: 15px 40px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          background: #FFD700;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(244, 196, 48, 0.4);
        }
        .urgency-banner {
          background: #fef3c7;
          border: 2px solid #F4C430;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-size: 16px;
        }
        @media (max-width: 768px) {
          .frames-grid {
            grid-template-columns: 1fr;
          }
          .gains-grid {
            grid-template-columns: 1fr;
          }
          .your-score-row {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      <button className="print-button no-print" onClick={() => window.print()}>
        Download PDF
      </button>

      <div className="demo-banner no-print">
        📊 SAMPLE REPORT - This is an example of what your personalized swing analysis will look like
      </div>

      <div className="header">
        <h1>SWING ANALYSIS REPORT</h1>
        <div className="subtitle">Sample Analysis • Jan 15 - Feb 28, 2025</div>
      </div>

      {/* Key Swing Frames Section */}
      <div className="swing-frames-section">
        <div className="frames-grid">
          <div className="frame-box">
            <div className="frame-placeholder">LOAD</div>
            <div className="frame-label">Frame 119 • Weight Shift</div>
          </div>
          <div className="frame-box">
            <div className="frame-placeholder">FIRE</div>
            <div className="frame-label">Frame 120 • Hip Rotation</div>
          </div>
          <div className="frame-box">
            <div className="frame-placeholder">CONTACT</div>
            <div className="frame-label">Frame 193 • Impact Zone</div>
          </div>
        </div>
      </div>

      <div className="summary-box">
        <h2>12 Swings Analyzed</h2>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Average HITS Score</div>
            <div className="stat-value">78.4</div>
          </div>
          <div className="stat">
            <div className="stat-label">Trend</div>
            <div className="stat-value trend-positive">
              ↗ Improving
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Total Improvement</div>
            <div className="stat-value trend-positive">
              +12.8
            </div>
          </div>
        </div>
      </div>

      {/* Elite Comparison Section */}
      <div className="section">
        <h3>How You Compare</h3>
        <div className="comparison-box">
          <div className="your-score-row">
            <span className="label">Your Score: <strong>78.4</strong></span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '78.4%' }}></div>
            </div>
            <span className="percentage">78%</span>
          </div>
          
          <div className="elite-scale">
            <div className="scale-row elite">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="range">Elite MLB (90+)</span>
            </div>
            <div className="scale-row advanced">
              <span className="stars">⭐⭐⭐⭐</span>
              <span className="range">Advanced (80-89)</span>
            </div>
            <div className="scale-row good current">
              <span className="stars">⭐⭐⭐</span>
              <span className="range">Good (70-79)</span>
              <span className="badge">← YOU ARE HERE</span>
            </div>
            <div className="scale-row developing">
              <span className="stars">⭐⭐</span>
              <span className="range">Developing (60-69)</span>
            </div>
            <div className="scale-row beginner">
              <span className="stars">⭐</span>
              <span className="range">Beginner (&lt;60)</span>
            </div>
          </div>
          
          <div className="percentile-callout">
            🎯 You're in the <strong>top 40%</strong> of hitters!
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Progress Overview</h3>
        <table className="progress-table">
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
            <tr>
              <td>Jan 15, 3:20 PM</td>
              <td><strong>65.6</strong></td>
              <td>62.1</td>
              <td>68.5</td>
              <td>66.2</td>
            </tr>
            <tr>
              <td>Jan 22, 2:45 PM</td>
              <td><strong>70.2</strong></td>
              <td>68.8</td>
              <td>71.2</td>
              <td>70.6</td>
            </tr>
            <tr>
              <td>Jan 29, 4:15 PM</td>
              <td><strong>73.8</strong></td>
              <td>72.4</td>
              <td>74.9</td>
              <td>74.1</td>
            </tr>
            <tr>
              <td>Feb 5, 3:00 PM</td>
              <td><strong>76.5</strong></td>
              <td>75.2</td>
              <td>77.3</td>
              <td>77.0</td>
            </tr>
            <tr>
              <td>Feb 12, 2:30 PM</td>
              <td><strong>78.4</strong></td>
              <td>77.8</td>
              <td>79.1</td>
              <td>78.3</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>Three Pillars Analysis</h3>
        
        <div className="pillar-card">
          <h4>ANCHOR (Front Leg Stability)</h4>
          <p>
            <strong>Range:</strong> 62.1 → 77.8
            <span className="trend-positive">
              (+15.7)
            </span>
          </p>
          <p><strong>Average:</strong> 71.3</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Your front leg stability has shown excellent improvement. The consistent weight transfer and firm front side are creating a solid foundation for rotation.
          </p>
        </div>

        <div className="pillar-card">
          <h4>ENGINE (Tempo & Timing)</h4>
          <p>
            <strong>Range:</strong> 68.5 → 79.1
            <span className="trend-positive">
              (+10.6)
            </span>
          </p>
          <p><strong>Average:</strong> 74.2</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Your tempo has become more consistent, with the load-to-fire timing showing clear improvement. The 3:1 ratio is becoming more natural.
          </p>
        </div>

        <div className="pillar-card">
          <h4>WHIP (Bat Speed & Acceleration)</h4>
          <p>
            <strong>Range:</strong> 66.2 → 78.3
            <span className="trend-positive">
              (+12.1)
            </span>
          </p>
          <p><strong>Average:</strong> 73.2</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Bat speed is increasing as the mechanical improvements take hold. The acceleration pattern through contact is becoming more explosive.
          </p>
        </div>
      </div>

      <div className="section">
        <h3>Key Insights</h3>
        <div className="pillar-card">
          <h4>✓ Positive Progress</h4>
          <p>Your overall score has improved by 12.8 points over this period. This demonstrates consistent development in your swing mechanics.</p>
        </div>

        <div className="pillar-card">
          <h4>Strongest Area: ANCHOR</h4>
          <p>Your front leg stability has shown the most improvement (+15.7). This solid foundation will support further development in other areas.</p>
        </div>

        <div className="pillar-card">
          <h4>💡 Key Recommendation</h4>
          <p>Continue focusing on the anchor-engine connection. As your front leg stability improves, work on maintaining that timing through the hitting zone for maximum power transfer.</p>
        </div>
      </div>

      {/* Personalized Training Plan */}
      <div className="section">
        <h3>Your Personalized Training Plan</h3>
        
        <div className="training-plan-card">
          <h4>🎯 Week 1-2: ANCHOR (Front Leg)</h4>
          <ul className="drill-list">
            <li><strong>A2: Wall Push Drill</strong> - 10 reps • Focus on front leg stability</li>
            <li><strong>A3: Step and Stick</strong> - 15 reps • Practice weight transfer</li>
            <li><strong>A4: Resistance Band</strong> - 3 sets • Build leg strength</li>
          </ul>
        </div>

        <div className="training-plan-card">
          <h4>⚡ Week 3-4: ENGINE (Timing)</h4>
          <ul className="drill-list">
            <li><strong>E2: Shift-Turn Rhythm</strong> - 20 reps • Master 3:1 tempo ratio</li>
            <li><strong>E4: Three-Step Rhythm</strong> - 15 reps • Load-stride-fire sequence</li>
            <li><strong>E6: Separation Holds</strong> - 10 reps • Hip-shoulder connection</li>
          </ul>
        </div>

        <div className="training-plan-card">
          <h4>💥 Week 5-6: WHIP (Acceleration)</h4>
          <ul className="drill-list">
            <li><strong>W3: Overload/Underload</strong> - 10 reps each • Increase bat speed</li>
            <li><strong>W5: One-Arm Swings</strong> - 15 reps per arm • Improve extension</li>
            <li><strong>W7: Tee Exits</strong> - 20 reps • Focus on contact quality</li>
          </ul>
        </div>

        <div className="expected-gains">
          <h4>Expected Gains (6 Weeks)</h4>
          <div className="gains-grid">
            <div className="gain-item">
              <div className="gain-value">+5-8 mph</div>
              <div className="gain-label">Exit Velocity</div>
            </div>
            <div className="gain-item">
              <div className="gain-value">+15-20 ft</div>
              <div className="gain-label">Distance</div>
            </div>
            <div className="gain-item">
              <div className="gain-value">+10-15 pts</div>
              <div className="gain-label">HITS Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="section">
        <h3>Real Results from Athletes Like You</h3>
        
        <div className="testimonial-card">
          <div className="quote">"Went from 68 to 84 in 8 weeks. Exit velo jumped from 82 to 89 mph."</div>
          <div className="author">— Marcus T., 16U Travel Ball</div>
        </div>

        <div className="testimonial-card">
          <div className="quote">"The 3:1 tempo was a game-changer. Seeing the data made it click."</div>
          <div className="author">— Jake S., High School Varsity</div>
        </div>

        <div className="testimonial-card">
          <div className="quote">"Coach Rick's feedback helped me understand what I was doing wrong. Now I'm hitting bombs."</div>
          <div className="author">— Devon L., College Prospect</div>
        </div>
      </div>

      <div className="section">
        <h3>Next Steps</h3>
        
        <div className="cta-card">
          <h4>🚀 Ready to Get Your Full Analysis?</h4>
          <p>Upload your swing video and get instant feedback on all three pillars.</p>
          <div className="cta-button-container">
            <button className="cta-button" onClick={() => navigate('/analyze')}>
              Analyze My Swing Now
            </button>
          </div>
        </div>

        <div className="urgency-banner">
          ⚡ <strong>Limited Time:</strong> First 100 athletes get personalized drill videos from Coach Rick
        </div>
      </div>

      <div className="footer">
        <p>Generated by H.I.T.S. Swing Analysis System</p>
        <p>© 2025 - For Training Purposes Only</p>
      </div>
    </div>
  );
}

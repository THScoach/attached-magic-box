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

      // Store lead capture data if available
      const leadData = sessionStorage.getItem('leadCapture');
      if (leadData) {
        try {
          const { name, email } = JSON.parse(leadData);
          
          await supabase.from('leads').insert({
            user_id: session.user.id,
            name,
            email,
            source: 'sample_report'
          });
          
          sessionStorage.removeItem('leadCapture');
        } catch (error) {
          console.error('Error storing lead:', error);
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
      `}</style>

      <button className="print-button no-print" onClick={() => window.print()}>
        Download PDF
      </button>

      <div className="demo-banner no-print">
        📊 SAMPLE REPORT - This is an example of what your personalized swing analysis will look like
      </div>

      <div className="header">
        <h1>SWING ANALYSIS REPORT</h1>
        <div className="subtitle">Sample Analysis</div>
        <div className="subtitle">Jan 15 - Feb 28, 2025</div>
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

      <div className="section">
        <h3>Next Steps</h3>
        <div className="pillar-card">
          <h4>Continue Training</h4>
          <p>Keep working on your swing mechanics with focused drill work. Consistency is key to long-term improvement.</p>
        </div>
        <div className="pillar-card">
          <h4>Schedule Your Next Analysis</h4>
          <p>Regular video analysis helps track progress and identify areas for improvement. Aim for weekly or bi-weekly assessments.</p>
        </div>
      </div>

      <div className="footer">
        <p>Generated by H.I.T.S. Swing Analysis System</p>
        <p>© 2025 - For Training Purposes Only</p>
      </div>
    </div>
  );
}

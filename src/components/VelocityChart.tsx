import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SwingAnalysis } from '@/types/swing';
import { Card } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface VelocityChartProps {
  analysis: SwingAnalysis;
}

// Generate velocity curve from actual swing data
function generateRealVelocityData(analysis: SwingAnalysis) {
  const data: any[] = [];
  
  // Use actual timing values (converted to positive milliseconds before contact)
  const loadStart = Math.abs(analysis.loadStartTiming || 900);
  const fireStart = Math.abs(analysis.fireStartTiming || 340);
  const contact = 0;
  
  // Peak timings from analysis (converted to ms before contact)
  const pelvisPeak = Math.abs(analysis.pelvisTiming || 180);
  const torsoPeak = Math.abs(analysis.torsoTiming || 120);
  const handsPeak = Math.abs(analysis.handsTiming || 60);
  
  // Peak velocities from analysis
  const pelvisMax = analysis.pelvisMaxVelocity || 650;
  const torsoMax = analysis.torsoMaxVelocity || 1000;
  const handsMax = analysis.armMaxVelocity || 1800;
  
  // Generate curve from load to after contact
  for (let time = -loadStart; time <= 100; time += 10) {
    const absTime = Math.abs(time);
    
    // Gaussian curves centered at each peak timing
    const pelvisVel = Math.max(0, pelvisMax * Math.exp(-Math.pow((absTime - pelvisPeak) / 100, 2)));
    const torsoVel = Math.max(0, torsoMax * Math.exp(-Math.pow((absTime - torsoPeak) / 80, 2)));
    const handsVel = Math.max(0, handsMax * Math.exp(-Math.pow((absTime - handsPeak) / 60, 2)));
    
    data.push({
      time,
      pelvis: Math.round(pelvisVel),
      torso: Math.round(torsoVel),
      hands: Math.round(handsVel)
    });
  }
  
  return data;
}

export function VelocityChart({ analysis }: VelocityChartProps) {
  const data = generateRealVelocityData(analysis);
  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Tempo & Sequence Analysis</h3>
          <InfoTooltip content="Shows how velocity builds through the swing. Each body part should peak at different times (hips → torso → hands) like a whip. This separation creates the kinetic chain that generates power." />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Angular velocity throughout the swing (0 = Impact)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time (ms before contact)', position: 'insideBottom', offset: -5 }}
            className="text-xs"
          />
          <YAxis 
            label={{ value: 'Angular Velocity (°/s)', angle: -90, position: 'insideLeft' }}
            className="text-xs"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <ReferenceLine x={0} stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" label="Contact" />
          <Line 
            type="monotone" 
            dataKey="pelvis" 
            stroke="hsl(var(--anchor))" 
            strokeWidth={2}
            name="Pelvis"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="torso" 
            stroke="hsl(var(--engine))" 
            strokeWidth={2}
            name="Torso"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="hands" 
            stroke="hsl(var(--whip))" 
            strokeWidth={2}
            name="Hands"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { VelocityData } from '@/types/swing';
import { Card } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface VelocityChartProps {
  data: VelocityData[];
}

export function VelocityChart({ data }: VelocityChartProps) {
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
            label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
            className="text-xs"
          />
          <YAxis 
            label={{ value: 'Angular Velocity (deg/s)', angle: -90, position: 'insideLeft' }}
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

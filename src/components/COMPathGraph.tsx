import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwingAnalysis } from "@/types/swing";

interface COMPathGraphProps {
  analysis: SwingAnalysis;
  currentTime: number;
  duration: number;
}

export function COMPathGraph({ analysis, currentTime, duration }: COMPathGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 50;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(padding, padding, graphWidth, graphHeight);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + (graphWidth / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Calculate COM path
    const progress = currentTime / duration;
    const startX = padding + graphWidth * 0.1;
    const endX = padding + graphWidth * 0.9;
    const centerY = padding + graphHeight * 0.5;
    const amplitude = graphHeight * 0.3;

    // Draw full path (semi-transparent)
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = startX + (endX - startX) * t;
      const y = centerY - Math.sin(t * Math.PI * 0.5) * amplitude;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw active path
    ctx.strokeStyle = '#6C5CE7';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(108, 92, 231, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    
    const steps = Math.floor(progress * 100);
    for (let i = 0; i <= steps; i++) {
      const t = i / 100;
      const x = startX + (endX - startX) * t;
      const y = centerY - Math.sin(t * Math.PI * 0.5) * amplitude;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw start marker
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(startX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Start', startX - 15, centerY + 20);

    // Draw current position
    const currentX = startX + (endX - startX) * progress;
    const currentY = centerY - Math.sin(progress * Math.PI * 0.5) * amplitude;
    
    ctx.fillStyle = '#FFD93D';
    ctx.shadowColor = 'rgba(255, 217, 61, 0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw axis labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText('Forward Progress', width / 2 - 45, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Vertical Movement', 0, 0);
    ctx.restore();

  }, [analysis, currentTime, duration]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Center of Mass Path</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className="w-full h-[300px]"
          style={{ width: '100%', height: '300px' }}
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#6C5CE7]" />
            <span>COM Path</span>
          </div>
          {analysis.comDistance && (
            <div className="text-sm">
              <span className="font-semibold">Total Forward Movement:</span> {analysis.comDistance} inches
            </div>
          )}
          {analysis.comMaxVelocity && (
            <div className="text-sm">
              <span className="font-semibold">Peak Velocity:</span> {analysis.comMaxVelocity} ft/s
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

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

    // Calculate COM path synced with video timing
    const progress = Math.min(currentTime / duration, 1);
    
    // Use actual COM distance from analysis (in inches) to scale the path
    const comDistance = analysis.comDistance || 45; // Default to 45 inches if not available
    const scaleFactor = comDistance / 50; // Scale relative to typical 50 inch movement
    
    // Calculate path based on typical swing mechanics
    // Early loading: slight backward, then explosive forward
    const startX = padding + graphWidth * 0.15;
    const peakX = padding + graphWidth * 0.85; // More forward movement
    const centerY = padding + graphHeight * 0.5;
    
    // Create realistic COM path based on swing phases
    const getCOMPosition = (t: number) => {
      let x, y;
      
      if (t < 0.2) {
        // Loading phase: slight backward and down
        x = startX - (t / 0.2) * (graphWidth * 0.05);
        y = centerY + (t / 0.2) * (graphHeight * 0.15);
      } else if (t < 0.5) {
        // Weight shift: moving forward and slightly up
        const loadProgress = (t - 0.2) / 0.3;
        x = startX - (graphWidth * 0.05) + loadProgress * (peakX - startX + graphWidth * 0.05) * 0.4;
        y = centerY + (graphHeight * 0.15) - loadProgress * (graphHeight * 0.2);
      } else {
        // Drive phase: explosive forward movement
        const driveProgress = (t - 0.5) / 0.5;
        x = startX - (graphWidth * 0.05) + 0.4 * (peakX - startX + graphWidth * 0.05) + 
            driveProgress * 0.6 * (peakX - startX + graphWidth * 0.05) * scaleFactor;
        y = centerY - (graphHeight * 0.05) + Math.sin(driveProgress * Math.PI) * (graphHeight * 0.1);
      }
      
      return { x, y };
    };

    // Draw full path (semi-transparent)
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const pos = getCOMPosition(t);
      
      if (i === 0) {
        ctx.moveTo(pos.x, pos.y);
      } else {
        ctx.lineTo(pos.x, pos.y);
      }
    }
    ctx.stroke();

    // Draw active path up to current time
    ctx.strokeStyle = '#6C5CE7';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(108, 92, 231, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    
    const steps = Math.floor(progress * 100);
    for (let i = 0; i <= steps; i++) {
      const t = i / 100;
      const pos = getCOMPosition(t);
      
      if (i === 0) {
        ctx.moveTo(pos.x, pos.y);
      } else {
        ctx.lineTo(pos.x, pos.y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw start marker
    const startPos = getCOMPosition(0);
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Start (Stance)', startPos.x - 25, startPos.y + 20);

    // Draw current position marker
    const currentPos = getCOMPosition(progress);
    ctx.fillStyle = '#FFD93D';
    ctx.shadowColor = 'rgba(255, 217, 61, 0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(currentPos.x, currentPos.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw phase labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = 'bold 10px sans-serif';
    
    // Loading phase
    const loadPos = getCOMPosition(0.2);
    ctx.fillText('Load', loadPos.x - 12, loadPos.y + 25);
    
    // Weight shift phase  
    const shiftPos = getCOMPosition(0.5);
    ctx.fillText('Shift', shiftPos.x - 12, shiftPos.y - 15);
    
    // Drive phase
    const drivePos = getCOMPosition(0.85);
    ctx.fillText('Drive', drivePos.x - 15, drivePos.y - 15);

    // Draw axis labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText('Forward Progress (inches)', width / 2 - 60, height - 10);
    ctx.save();
    ctx.translate(15, height / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Vertical Position', 0, 0);
    ctx.restore();

    // Draw current distance traveled
    const currentDistance = Math.round(comDistance * progress);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${currentDistance}" forward`, currentPos.x + 15, currentPos.y);

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

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwingAnalysis } from "@/types/swing";

interface TimingGraphProps {
  analysis: SwingAnalysis;
  currentTime: number;
  duration: number;
}

export function TimingGraph({ analysis, currentTime, duration }: TimingGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const width = rect.width;
      const height = rect.height;
      const padding = 40;
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
      for (let i = 0; i <= 4; i++) {
        const y = padding + (graphHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Draw timing events
      const timingEvents = [
        { label: 'Pelvis Peak', time: analysis.pelvisTiming, velocity: analysis.pelvisMaxVelocity, color: '#FF6B6B' },
        { label: 'Torso Peak', time: analysis.torsoTiming, velocity: analysis.torsoMaxVelocity, color: '#4ECDC4' },
        { label: 'Hands Peak', time: analysis.handsTiming, velocity: analysis.armMaxVelocity, color: '#FFD93D' }
      ];

      const maxVelocity = Math.max(
        analysis.pelvisMaxVelocity || 0,
        analysis.torsoMaxVelocity || 0,
        analysis.armMaxVelocity || 0,
        1000
      );

      timingEvents.forEach((event) => {
        if (!event.time || !event.velocity) return;

        const x = padding + (event.time / duration) * graphWidth;
        const y = padding + graphHeight - (event.velocity / maxVelocity) * graphHeight;

        // Draw vertical line
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw point
        ctx.fillStyle = event.color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(event.label, x + 10, y - 10);
        ctx.fillText(`${event.velocity} °/s`, x + 10, y + 5);
      });

      // Draw current time indicator
      const currentX = padding + (currentTime / duration) * graphWidth;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentX, padding);
      ctx.lineTo(currentX, height - padding);
      ctx.stroke();

      // Draw current time marker at top
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(currentX, padding - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw axis labels
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.font = '11px sans-serif';
      ctx.fillText('Time (ms)', width / 2 - 30, height - 5);
      ctx.save();
      ctx.translate(15, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Velocity (°/s)', 0, 0);
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analysis, currentTime, duration]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Timing Sequence</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className="w-full h-[300px]"
          style={{ width: '100%', height: '300px' }}
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
            <span>Pelvis: {analysis.pelvisTiming}ms → {analysis.pelvisMaxVelocity}°/s</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
            <span>Torso: {analysis.torsoTiming}ms → {analysis.torsoMaxVelocity}°/s</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
            <span>Hands: {analysis.handsTiming}ms → {analysis.armMaxVelocity}°/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

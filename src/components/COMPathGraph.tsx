import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Badge } from "@/components/ui/badge";
import { SwingAnalysis } from "@/types/swing";
import { TrendingUp, Zap } from "lucide-react";

interface COMPathGraphProps {
  analysis: SwingAnalysis;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
}

export function COMPathGraph({ analysis, currentTime, duration, onSeek }: COMPathGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const velocityCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [showEliteBenchmark, setShowEliteBenchmark] = useState(true);
  
  // Elite benchmarks from research (Welch 1995, Fortenbaugh 2011)
  const ELITE_BENCHMARKS = {
    comDistance: 14, // inches (10-16 range, using 14 as typical elite)
    comMaxVelocity: 3.5, // ft/s (converted from 1.0-1.2 m/s)
    frontFootGRF: 123, // % body weight
    comPeakVelocityTiming: 0.12 // seconds before contact
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate common values used by both draw functions
    const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
    const comDistance = analysis.comDistance || 45;
    const scaleFactor = comDistance / 50;
    
    // Calculate actual timing points based on swing analysis data
    const contactTime = duration;
    const loadStartTime = analysis.loadStartTiming ? contactTime - (analysis.loadStartTiming / 1000) : contactTime * 0.2;
    const fireStartTime = analysis.fireStartTiming ? contactTime - (analysis.fireStartTiming / 1000) : contactTime * 0.5;
    const comPeakTime = analysis.comPeakTiming ? contactTime - (analysis.comPeakTiming / 1000) : contactTime * 0.85;
    
    // Convert times to progress values (0-1)
    const loadProgress = duration > 0 ? loadStartTime / duration : 0.2;
    const fireProgress = duration > 0 ? fireStartTime / duration : 0.5;
    const peakProgress = duration > 0 ? comPeakTime / duration : 0.85;

    const draw = () => {
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

      // Calculate path based on typical swing mechanics
      const startX = padding + graphWidth * 0.15;
      const peakX = padding + graphWidth * 0.85;
      const centerY = padding + graphHeight * 0.5;
      
      // Create realistic COM path based on actual swing phase timing
      const getCOMPosition = (t: number) => {
        let x, y;
        
        if (t < loadProgress) {
          // Loading phase: slight backward and down
          const phaseProgress = loadProgress > 0 ? t / loadProgress : 0;
          x = startX - phaseProgress * (graphWidth * 0.05);
          y = centerY + phaseProgress * (graphHeight * 0.15);
        } else if (t < fireProgress) {
          // Weight shift: moving forward and slightly up
          const phaseProgress = (fireProgress - loadProgress) > 0 ? (t - loadProgress) / (fireProgress - loadProgress) : 0;
          x = startX - (graphWidth * 0.05) + phaseProgress * (peakX - startX + graphWidth * 0.05) * 0.4;
          y = centerY + (graphHeight * 0.15) - phaseProgress * (graphHeight * 0.2);
        } else {
          // Drive phase: explosive forward movement
          const phaseProgress = (1 - fireProgress) > 0 ? (t - fireProgress) / (1 - fireProgress) : 0;
          x = startX - (graphWidth * 0.05) + 0.4 * (peakX - startX + graphWidth * 0.05) + 
              phaseProgress * 0.6 * (peakX - startX + graphWidth * 0.05) * scaleFactor;
          y = centerY - (graphHeight * 0.05) + Math.sin(phaseProgress * Math.PI) * (graphHeight * 0.1);
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
      
      // White background for start label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(startPos.x - 30, startPos.y + 8, 80, 16);
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

      // Draw phase labels at actual timing points
      ctx.font = 'bold 10px sans-serif';
      
      // Loading phase
      const loadPos = getCOMPosition(loadProgress);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(loadPos.x - 16, loadPos.y + 13, 32, 16);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Load', loadPos.x - 12, loadPos.y + 25);
      
      // Weight shift phase  
      const shiftPos = getCOMPosition(fireProgress);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(shiftPos.x - 16, shiftPos.y - 27, 32, 16);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Shift', shiftPos.x - 12, shiftPos.y - 15);
      
      // Drive phase
      const drivePos = getCOMPosition(peakProgress);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(drivePos.x - 19, drivePos.y - 27, 38, 16);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Drive', drivePos.x - 15, drivePos.y - 15);

      // Draw axis labels
      ctx.font = '11px sans-serif';
      
      // Bottom axis label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(width / 2 - 65, height - 22, 150, 16);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Forward Progress (inches)', width / 2 - 60, height - 10);
      
      // Left axis label (rotated)
      ctx.save();
      ctx.translate(15, height / 2 + 30);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(-45, -6, 90, 16);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('Vertical Position', 0, 0);
      ctx.restore();

      // Draw elite benchmark path if enabled
      if (showEliteBenchmark) {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        const eliteScaleFactor = ELITE_BENCHMARKS.comDistance / 50;
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          let x, y;
          
          if (t < loadProgress) {
            const phaseProgress = loadProgress > 0 ? t / loadProgress : 0;
            x = startX - phaseProgress * (graphWidth * 0.05);
            y = centerY + phaseProgress * (graphHeight * 0.15);
          } else if (t < fireProgress) {
            const phaseProgress = (fireProgress - loadProgress) > 0 ? (t - loadProgress) / (fireProgress - loadProgress) : 0;
            x = startX - (graphWidth * 0.05) + phaseProgress * (peakX - startX + graphWidth * 0.05) * 0.4;
            y = centerY + (graphHeight * 0.15) - phaseProgress * (graphHeight * 0.2);
          } else {
            const phaseProgress = (1 - fireProgress) > 0 ? (t - fireProgress) / (1 - fireProgress) : 0;
            x = startX - (graphWidth * 0.05) + 0.4 * (peakX - startX + graphWidth * 0.05) + 
                phaseProgress * 0.6 * (peakX - startX + graphWidth * 0.05) * eliteScaleFactor;
            y = centerY - (graphHeight * 0.05) + Math.sin(phaseProgress * Math.PI) * (graphHeight * 0.1);
          }
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Elite benchmark label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(width - padding - 85, padding + 10, 75, 16);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Elite Benchmark', width - padding - 80, padding + 22);
      }
      
      // Draw current distance traveled
      const currentDistance = Math.round(comDistance * progress);
      const distanceText = `${currentDistance}" forward`;
      ctx.font = 'bold 12px sans-serif';
      const distanceTextWidth = ctx.measureText(distanceText).width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(currentPos.x + 12, currentPos.y - 10, distanceTextWidth + 6, 16);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillText(distanceText, currentPos.x + 15, currentPos.y);
    };

    // Draw velocity graph
    const drawVelocityGraph = () => {
      const velocityCanvas = velocityCanvasRef.current;
      if (!velocityCanvas) return;
      
      const ctx = velocityCanvas.getContext('2d');
      if (!ctx) return;
      
      const rect = velocityCanvas.getBoundingClientRect();
      velocityCanvas.width = rect.width * window.devicePixelRatio;
      velocityCanvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const width = rect.width;
      const height = rect.height;
      const padding = 40;
      const graphWidth = width - padding * 2;
      const graphHeight = height - padding * 2;
      
      ctx.clearRect(0, 0, width, height);
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(padding, padding, graphWidth, graphHeight);
      
      // Grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const x = padding + (graphWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
      
      // Axes
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.stroke();
      
      // Calculate velocity curve
      const maxVelocity = analysis.comMaxVelocity || ELITE_BENCHMARKS.comMaxVelocity;
      const velocityScale = graphHeight / (maxVelocity * 1.2);
      
      // Draw velocity curve
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        let velocity = 0;
        
        if (t < loadProgress) {
          velocity = 0.1 * maxVelocity * (t / loadProgress);
        } else if (t < fireProgress) {
          const phaseProgress = (t - loadProgress) / (fireProgress - loadProgress);
          velocity = 0.1 * maxVelocity + phaseProgress * 0.3 * maxVelocity;
        } else {
          const phaseProgress = (t - fireProgress) / (1 - fireProgress);
          velocity = 0.4 * maxVelocity + phaseProgress * 0.6 * maxVelocity * Math.sin(phaseProgress * Math.PI * 0.8);
        }
        
        const x = padding + t * graphWidth;
        const y = height - padding - velocity * velocityScale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Current position marker
      const currentVelocityX = padding + progress * graphWidth;
      ctx.strokeStyle = '#FFD93D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentVelocityX, padding);
      ctx.lineTo(currentVelocityX, height - padding);
      ctx.stroke();
      
      // Labels
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText('Time', width / 2 - 15, height - 10);
      
      ctx.save();
      ctx.translate(15, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Velocity (ft/s)', -40, 0);
      ctx.restore();
    };

    draw();
    drawVelocityGraph();
  }, [analysis, currentTime, duration, showEliteBenchmark]);
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 50;
    const graphWidth = rect.width - padding * 2;
    
    if (x < padding || x > rect.width - padding) return;
    
    const relativeX = (x - padding) / graphWidth;
    const targetTime = relativeX * duration;
    onSeek(targetTime);
  };

  // Calculate performance vs elite
  const comDistancePercent = analysis.comDistance 
    ? Math.round((analysis.comDistance / ELITE_BENCHMARKS.comDistance) * 100)
    : 0;
  const velocityPercent = analysis.comMaxVelocity
    ? Math.round((analysis.comMaxVelocity / ELITE_BENCHMARKS.comMaxVelocity) * 100)
    : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Center of Mass Analysis</CardTitle>
            <InfoTooltip content="Your center of mass (body weight) moves backward during load, then explodes forward during swing. Elite: 10-16 inches forward, reaching speeds of 1.0-1.2 m/s. More aggressive forward movement = more power." />
          </div>
          <button
            onClick={() => setShowEliteBenchmark(!showEliteBenchmark)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showEliteBenchmark ? 'Hide' : 'Show'} Elite
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Badges */}
        {(analysis.comDistance || analysis.comMaxVelocity) && (
          <div className="flex flex-wrap gap-2">
            {analysis.comDistance && (
              <Badge variant={comDistancePercent >= 90 ? "default" : comDistancePercent >= 70 ? "secondary" : "outline"} className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {comDistancePercent >= 90 ? '✓' : comDistancePercent >= 70 ? '~' : '×'} {comDistancePercent}% Elite Distance
              </Badge>
            )}
            {analysis.comMaxVelocity && (
              <Badge variant={velocityPercent >= 90 ? "default" : velocityPercent >= 70 ? "secondary" : "outline"} className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {velocityPercent >= 90 ? '✓' : velocityPercent >= 70 ? '~' : '×'} {velocityPercent}% Elite Velocity
              </Badge>
            )}
          </div>
        )}
        
        {/* Main COM Path */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">COM Movement Path</div>
          <canvas
            ref={canvasRef}
            className="w-full h-[220px] cursor-pointer hover:opacity-90 transition-opacity rounded-lg border"
            style={{ width: '100%', height: '220px' }}
            onClick={handleCanvasClick}
            title="Click to jump to this moment"
          />
        </div>
        
        {/* Velocity Graph */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">COM Velocity Curve</div>
          <canvas
            ref={velocityCanvasRef}
            className="w-full h-[100px] rounded-lg border"
            style={{ width: '100%', height: '100px' }}
          />
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Forward Movement</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{(analysis.comDistance || 0).toFixed(2)}"</span>
            </div>
            <div className="text-xs text-muted-foreground">/ {ELITE_BENCHMARKS.comDistance}" elite</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Peak Velocity</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{analysis.comMaxVelocity?.toFixed(1) || 0}</span>
            </div>
            <div className="text-xs text-muted-foreground">/ {ELITE_BENCHMARKS.comMaxVelocity} ft/s</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import type { FrameJointData } from '@/lib/poseAnalysis';
import { drawSkeletonOnCanvas } from '@/lib/videoAnalysis';

interface PoseSkeletonOverlayProps {
  jointData: FrameJointData[];
  currentFrame: number;
  videoWidth: number;
  videoHeight: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function PoseSkeletonOverlay({
  jointData,
  currentFrame,
  videoWidth,
  videoHeight,
  isVisible,
  onToggleVisibility
}: PoseSkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !canvasRef.current || jointData.length === 0) {
      // Clear canvas if not visible
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    const frameData = jointData[currentFrame];
    
    if (!frameData || !frameData.joints) {
      return;
    }

    // Convert FrameJointData joints to KeypointData array for drawing
    const keypoints = Object.entries(frameData.joints).map(([name, joint]) => ({
      name,
      x: joint.x,
      y: joint.y,
      z: joint.z || 0,
      confidence: joint.confidence,
      score: joint.confidence // score is the same as confidence
    }));

    // Draw skeleton on canvas
    drawSkeletonOnCanvas(canvas, keypoints, videoWidth, videoHeight);
  }, [jointData, currentFrame, videoWidth, videoHeight, isVisible]);

  if (jointData.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <div className="absolute top-2 right-2 z-20">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleVisibility}
          className="bg-background/80 backdrop-blur-sm shadow-lg"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Skeleton
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Skeleton
            </>
          )}
        </Button>
      </div>

      {/* Canvas Overlay */}
      {isVisible && (
        <div 
          ref={containerRef}
          className="absolute inset-0 pointer-events-none z-10"
        >
          <canvas
            ref={canvasRef}
            width={videoWidth}
            height={videoHeight}
            className="w-full h-full"
          />
        </div>
      )}
    </>
  );
}

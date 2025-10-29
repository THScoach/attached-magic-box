import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PillarCard } from "@/components/PillarCard";
import { VelocityChart } from "@/components/VelocityChart";
import { DrillCard } from "@/components/DrillCard";
import { BottomNav } from "@/components/BottomNav";
import { CoachRickChat } from "@/components/CoachRickChat";
import { RebootStyleMetrics } from "@/components/RebootStyleMetrics";
import { ChevronDown, ChevronUp, Target, Play, Pause, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SwingAnalysis } from "@/types/swing";
import { generateVelocityData, mockDrills } from "@/lib/mockAnalysis";
import { toast } from "sonner";
import { drawSkeletonOnCanvas, PoseData } from "@/lib/videoAnalysis";

export default function AnalysisResult() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [showDrills, setShowDrills] = useState(false);
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const velocityData = generateVelocityData();

  useEffect(() => {
    const stored = sessionStorage.getItem('latestAnalysis');
    if (stored) {
      const analysisData = JSON.parse(stored);
      console.log('Analysis data:', analysisData);
      console.log('Video URL:', analysisData.videoUrl);
      setAnalysis(analysisData);
    } else {
      navigate('/analyze');
    }
  }, [navigate]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video error:', e);
    console.error('Video element:', videoRef.current);
    console.error('Video src:', videoRef.current?.src);
    toast.error('Unable to load video. Please try analyzing again.');
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleSkeleton = () => {
    setShowSkeleton(!showSkeleton);
    if (!showSkeleton && analysis?.poseData) {
      toast.success("Skeleton overlay enabled");
    } else if (showSkeleton) {
      toast.info("Skeleton overlay disabled");
    } else {
      toast.info("No pose data available for this analysis");
    }
  };

  // Update skeleton drawing during video playback
  useEffect(() => {
    if (!showSkeleton || !analysis?.poseData || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseData = analysis.poseData as PoseData[];

    const updateSkeleton = () => {
      if (!video || !canvas) return;

      const currentTime = video.currentTime * 1000; // Convert to milliseconds
      
      // Find the closest pose data to current video time
      const closestPose = poseData.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) 
          ? curr 
          : prev;
      });

      if (closestPose) {
        drawSkeletonOnCanvas(
          canvas,
          closestPose.keypoints,
          video.videoWidth,
          video.videoHeight
        );
      }
    };

    const intervalId = setInterval(updateSkeleton, 33); // ~30fps

    return () => clearInterval(intervalId);
  }, [showSkeleton, analysis, isPlaying]);

  if (!analysis) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading analysis...</p>
    </div>;
  }

  const recommendedDrills = mockDrills.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Swing Analysis</h1>
        <p className="text-muted-foreground">
          {new Date(analysis.analyzedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Video Player */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-black relative group">
            {analysis.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={analysis.videoUrl}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={handleVideoError}
                  onLoadedMetadata={() => console.log('Video loaded successfully')}
                  loop
                  playsInline
                />

                {/* Skeleton Overlay Canvas */}
                {showSkeleton && analysis.poseData && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ mixBlendMode: 'screen' }}
                  />
                )}
                
                {/* Play/Pause Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-20 w-20 text-white/80 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Play className="h-20 w-20 text-white/80 group-hover:scale-110 transition-transform" />
                  )}
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant={showSkeleton ? "default" : "secondary"}
                    className="text-xs"
                    onClick={toggleSkeleton}
                    disabled={!analysis.poseData}
                  >
                    Skeleton
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs"
                    onClick={() => toast.info("Timing overlay coming soon!")}
                  >
                    Timing
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs"
                    onClick={() => toast.info("COM Path overlay coming soon!")}
                  >
                    COM Path
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <p>No video available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Overall H.I.T.S. Score */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Overall H.I.T.S. Score</p>
            <div className="text-6xl font-bold text-primary mb-2">{analysis.hitsScore}</div>
            <p className="text-lg font-medium">Tempo Ratio: {analysis.tempoRatio}:1</p>
          </div>
        </Card>

        {/* Three Pillars */}
        <section>
          <h2 className="text-lg font-bold mb-3">The Three Pillars</h2>
          <div className="space-y-3">
            <PillarCard 
              pillar="ANCHOR" 
              score={analysis.anchorScore}
              subtitle="Stability & Ground Force"
            />
            <PillarCard 
              pillar="ENGINE" 
              score={analysis.engineScore}
              subtitle="Tempo & Sequence"
            />
            <PillarCard 
              pillar="WHIP" 
              score={analysis.whipScore}
              subtitle="Release & Acceleration"
            />
          </div>
        </section>

        {/* Reboot-Style Metrics */}
        <RebootStyleMetrics analysis={analysis} />

        {/* Velocity Chart */}
        <VelocityChart data={velocityData} />

        {/* AI Coach Feedback */}
        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Your #1 Opportunity</h3>
            </div>
          </div>
          
          <p className="mb-3 text-foreground">
            {analysis.primaryOpportunity}
          </p>
          
          <p className="text-sm text-muted-foreground mb-4">
            💪 {analysis.impactStatement}
          </p>
          
          <Button className="w-full" onClick={() => setShowDrills(true)}>
            Show Me The Fix
          </Button>
        </Card>

        {/* Recommended Drills */}
        <section>
          <button
            onClick={() => setShowDrills(!showDrills)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-lg font-bold">Recommended Drills</h2>
            {showDrills ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {showDrills && (
            <div className="grid gap-4">
              {recommendedDrills.map(drill => (
                <DrillCard 
                  key={drill.id} 
                  drill={drill}
                  onViewDrill={(id) => {
                    toast.info("Drill details coming soon!");
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="grid gap-3">
          <Button 
            size="lg"
            className="w-full"
            onClick={() => setShowCoachChat(true)}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Chat with Coach Rick
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/analyze')}
          >
            Analyze Another Swing
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/progress')}
          >
            View Progress
          </Button>
        </div>
      </div>

      {/* Coach Rick Chat Modal */}
      {showCoachChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <CoachRickChat 
              analysis={analysis}
              onClose={() => setShowCoachChat(false)}
            />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

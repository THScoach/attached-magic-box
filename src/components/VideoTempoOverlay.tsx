import { useEffect, useState, useRef } from "react";

interface VideoTempoOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  loadTime: number;
  launchTime: number;
  phaseDetection?: {
    loadStart: number;
    launchStart: number;
    contact: number;
  } | null;
}

export function VideoTempoOverlay({
  videoRef,
  loadTime,
  launchTime,
  phaseDetection,
}: VideoTempoOverlayProps) {
  const [currentPhase, setCurrentPhase] = useState<"stance" | "load" | "fire" | "contact">("stance");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!videoRef.current || !phaseDetection) return;

    const video = videoRef.current;
    
    const updatePhase = () => {
      const currentTime = video.currentTime;
      const fps = 30;
      const currentFrame = Math.floor(currentTime * fps);

      if (currentFrame < phaseDetection.loadStart) {
        setCurrentPhase("stance");
        setProgress(0);
      } else if (currentFrame < phaseDetection.launchStart) {
        setCurrentPhase("load");
        const loadProgress = (currentFrame - phaseDetection.loadStart) / (phaseDetection.launchStart - phaseDetection.loadStart);
        setProgress(loadProgress * 75); // 0-75%
      } else if (currentFrame < phaseDetection.contact) {
        setCurrentPhase("fire");
        const fireProgress = (currentFrame - phaseDetection.launchStart) / (phaseDetection.contact - phaseDetection.launchStart);
        setProgress(75 + (fireProgress * 25)); // 75-100%
      } else {
        setCurrentPhase("contact");
        setProgress(100);
      }
    };

    video.addEventListener("timeupdate", updatePhase);
    return () => video.removeEventListener("timeupdate", updatePhase);
  }, [videoRef, phaseDetection]);

  if (!phaseDetection) return null;

  const tempoRatio = loadTime / launchTime;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 z-10">
      {/* Tempo Bar */}
      <div className="relative h-8 bg-muted/20 rounded-full overflow-hidden mb-2">
        {/* Load section background */}
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500/30"
          style={{ width: "75%" }}
        />
        {/* Fire section background */}
        <div 
          className="absolute top-0 h-full bg-primary/30"
          style={{ left: "75%", width: "25%" }}
        />
        
        {/* Progress indicator */}
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-100 ${
            currentPhase === "load" ? "bg-blue-500" : 
            currentPhase === "fire" ? "bg-primary" :
            currentPhase === "contact" ? "bg-success" :
            "bg-muted"
          }`}
          style={{ width: `${progress}%` }}
        />

        {/* Phase labels */}
        <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold text-white">
          <span>LOAD</span>
          <span className="absolute left-[75%] -translate-x-1/2">FIRE</span>
        </div>

        {/* Phase divider */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-white/50"
          style={{ left: "75%" }}
        />
      </div>

      {/* Status and Tempo */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            currentPhase === "stance" ? "bg-muted" :
            currentPhase === "load" ? "bg-blue-500 animate-pulse" :
            currentPhase === "fire" ? "bg-primary animate-pulse" :
            "bg-success"
          }`} />
          <span className="text-white font-semibold capitalize">
            {currentPhase === "contact" ? "CONTACT!" : currentPhase.toUpperCase()}
          </span>
        </div>

        <div className="text-white">
          <span className="text-muted-foreground">Load:Fire = </span>
          <span className="font-bold">{tempoRatio.toFixed(1)}:1</span>
        </div>
      </div>

      {/* Time stamps */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{loadTime.toFixed(0)}ms load</span>
        <span>{launchTime.toFixed(0)}ms fire</span>
      </div>
    </div>
  );
}

import { SwingAnalysis } from "@/types/swing";

interface VideoKeyMomentOverlayProps {
  analysis: SwingAnalysis;
  currentTime: number;
  duration: number;
  videoWidth: number;
  videoHeight: number;
  onSeekToMoment: (time: number) => void;
  onPauseAtMoment?: (time: number) => void;
}

export function VideoKeyMomentOverlay({ 
  analysis, 
  currentTime, 
  duration, 
  videoWidth, 
  videoHeight,
  onSeekToMoment,
  onPauseAtMoment
}: VideoKeyMomentOverlayProps) {
  // Log timing values for debugging
  console.log('🎯 Key Moment Timing Values:', {
    loadStartTiming: analysis.loadStartTiming,
    fireStartTiming: analysis.fireStartTiming,
    pelvisTiming: analysis.pelvisTiming,
    torsoTiming: analysis.torsoTiming,
    handsTiming: analysis.handsTiming,
    videoDuration: duration,
    note: 'All timing values should be in milliseconds BEFORE contact'
  });
  
  // Convert ms timing to seconds for comparison with video currentTime
  // Timing values are POSITIVE ms before contact, so we subtract from duration
  const loadStartTime = duration - Math.abs(analysis.loadStartTiming || 900) / 1000;
  const fireStartTime = duration - Math.abs(analysis.fireStartTiming || 340) / 1000;
  const pelvisPeakTime = duration - Math.abs(analysis.pelvisTiming || 180) / 1000;
  const torsoPeakTime = duration - Math.abs(analysis.torsoTiming || 120) / 1000;
  const handsPeakTime = duration - Math.abs(analysis.handsTiming || 60) / 1000;
  const contactTime = duration; // Contact is at end of video
  
  // Log calculated video timestamps
  console.log('📍 Calculated Video Timestamps:', {
    loadStartTime: `${loadStartTime.toFixed(3)}s (${Math.round((loadStartTime/duration)*100)}% through video)`,
    fireStartTime: `${fireStartTime.toFixed(3)}s (${Math.round((fireStartTime/duration)*100)}% through video)`,
    pelvisPeakTime: `${pelvisPeakTime.toFixed(3)}s`,
    torsoPeakTime: `${torsoPeakTime.toFixed(3)}s`,
    handsPeakTime: `${handsPeakTime.toFixed(3)}s`,
    contactTime: `${contactTime.toFixed(3)}s (end of video)`
  });

  // Define key moments with colors and labels
  const keyMoments = [
    { 
      time: loadStartTime, 
      label: "Load Start", 
      color: "rgba(255, 107, 107, 0.8)",
      icon: "L"
    },
    { 
      time: fireStartTime, 
      label: "Fire Phase", 
      color: "rgba(255, 165, 0, 0.8)",
      icon: "F"
    },
    { 
      time: pelvisPeakTime, 
      label: "Pelvis Peak", 
      color: "rgba(108, 92, 231, 0.8)",
      velocity: analysis.pelvisMaxVelocity,
      icon: "P"
    },
    { 
      time: torsoPeakTime, 
      label: "Torso Peak", 
      color: "rgba(34, 197, 94, 0.8)",
      velocity: analysis.torsoMaxVelocity,
      icon: "T"
    },
    { 
      time: handsPeakTime, 
      label: "Hands Peak", 
      color: "rgba(168, 85, 247, 0.8)",
      velocity: analysis.armMaxVelocity,
      icon: "H"
    },
    { 
      time: contactTime, 
      label: "Contact", 
      color: "rgba(34, 211, 238, 0.9)",
      icon: "⚾"
    }
  ];

  // Determine which moment is currently active (within 100ms)
  const tolerance = 0.1; // 100ms tolerance
  const activeMoment = keyMoments.find(
    moment => Math.abs(currentTime - moment.time) < tolerance
  );

  // Show upcoming moment indicator
  const upcomingMoment = keyMoments.find(
    moment => moment.time > currentTime && moment.time - currentTime < 0.5
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Active Moment Flash */}
      {activeMoment && (
        <div 
          className="absolute inset-0 flex items-center justify-center animate-pulse"
          style={{
            backgroundColor: activeMoment.color,
            opacity: 0.15
          }}
        >
          <div 
            className="text-white font-bold text-6xl drop-shadow-2xl"
            style={{
              textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)'
            }}
          >
            {activeMoment.icon}
          </div>
        </div>
      )}

      {/* Active Moment Label */}
      {activeMoment && (
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold text-white text-lg shadow-2xl backdrop-blur-sm"
          style={{
            backgroundColor: activeMoment.color,
            boxShadow: `0 0 30px ${activeMoment.color}`
          }}
        >
          {activeMoment.label}
          {activeMoment.velocity && (
            <span className="ml-2 text-sm opacity-90">
              {Math.round(activeMoment.velocity)}°/s
            </span>
          )}
        </div>
      )}

      {/* Upcoming Moment Indicator */}
      {upcomingMoment && !activeMoment && (
        <div 
          className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold text-white text-sm backdrop-blur-sm animate-pulse"
          style={{
            backgroundColor: upcomingMoment.color,
            opacity: 0.8
          }}
        >
          ↓ {upcomingMoment.label} in {((upcomingMoment.time - currentTime) * 1000).toFixed(0)}ms
        </div>
      )}

      {/* Key Moment Navigation Buttons */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {keyMoments.map((moment, index) => {
            const isActive = activeMoment?.time === moment.time;
            const isPast = currentTime > moment.time;
            
            return (
              <button
                key={index}
                onClick={() => onSeekToMoment(moment.time)}
                className="group relative px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 pointer-events-auto"
                style={{
                  backgroundColor: isActive ? moment.color : isPast ? `${moment.color}80` : `${moment.color}40`,
                  boxShadow: isActive ? `0 0 20px ${moment.color}` : 'none',
                  border: `1px solid ${moment.color}`
                }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-base">{moment.icon}</span>
                  <span>{moment.label}</span>
                  {moment.velocity && (
                    <span className="text-[10px] opacity-80">
                      {Math.round(moment.velocity)}°/s
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

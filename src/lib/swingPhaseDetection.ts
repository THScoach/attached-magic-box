import { Results } from "@mediapipe/pose";

export interface SwingPhase {
  name: 'stance' | 'load' | 'stride' | 'fire' | 'contact' | 'follow_through';
  startFrame: number;
  endFrame: number;
  duration: number;
  keyEvents: string[];
  comPosition?: { x: number; y: number };
  confidence: number;
}

export interface PhaseDetectionResult {
  phases: SwingPhase[];
  totalDuration: number;
  loadToFireRatio: number;
  phaseTransitions: {
    phase: string;
    frame: number;
    timestamp: number;
  }[];
  quality: {
    score: number;
    issues: string[];
    detectionConfidence: number;
  };
}

interface FrameAnalysis {
  frame: number;
  timestamp: number;
  hipRotation: number;
  shoulderRotation: number;
  frontKneeAngle: number;
  backKneeAngle: number;
  comX: number;
  comY: number;
  handPosition: { x: number; y: number };
  frontFootContact: boolean;
  hipVelocity: number;
}

export function detectSwingPhases(
  poseResults: Results[],
  fps: number = 30
): PhaseDetectionResult {
  if (!poseResults || poseResults.length < 10) {
    return createEmptyResult();
  }

  // Analyze each frame
  const frameAnalyses = poseResults.map((result, idx) => 
    analyzeFrame(result, idx, fps)
  );

  // Detect phase transitions
  const phases = identifyPhases(frameAnalyses, fps);
  
  // Calculate metrics
  const loadPhase = phases.find(p => p.name === 'load');
  const firePhase = phases.find(p => p.name === 'fire');
  const loadToFireRatio = loadPhase && firePhase 
    ? loadPhase.duration / firePhase.duration 
    : 0;

  const phaseTransitions = phases.map(p => ({
    phase: p.name,
    frame: p.startFrame,
    timestamp: p.startFrame / fps
  }));

  const quality = assessDetectionQuality(phases, frameAnalyses);

  return {
    phases,
    totalDuration: phases.reduce((sum, p) => sum + p.duration, 0),
    loadToFireRatio,
    phaseTransitions,
    quality
  };
}

function analyzeFrame(result: Results, frame: number, fps: number): FrameAnalysis {
  const landmarks = result.poseLandmarks;
  if (!landmarks || landmarks.length < 33) {
    return createEmptyFrameAnalysis(frame, fps);
  }

  // Key landmarks (MediaPipe Pose indices)
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  // Calculate hip rotation (simplified)
  const hipRotation = Math.atan2(
    rightHip.y - leftHip.y,
    rightHip.x - leftHip.x
  ) * (180 / Math.PI);

  // Calculate shoulder rotation
  const shoulderRotation = Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  ) * (180 / Math.PI);

  // Calculate knee angles (simplified)
  const frontKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const backKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // Estimate COM (center of mass) - simplified as midpoint of hips
  const comX = (leftHip.x + rightHip.x) / 2;
  const comY = (leftHip.y + rightHip.y) / 2;

  // Hand position (average of wrists)
  const handPosition = {
    x: (leftWrist.x + rightWrist.x) / 2,
    y: (leftWrist.y + rightWrist.y) / 2
  };

  // Front foot contact detection (simplified - check ankle height)
  const frontFootContact = leftAnkle.y > 0.8;

  return {
    frame,
    timestamp: frame / fps,
    hipRotation,
    shoulderRotation,
    frontKneeAngle,
    backKneeAngle,
    comX,
    comY,
    handPosition,
    frontFootContact,
    hipVelocity: 0 // Will be calculated in next step
  };
}

function calculateAngle(a: any, b: any, c: any): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                  Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function identifyPhases(analyses: FrameAnalysis[], fps: number): SwingPhase[] {
  if (analyses.length < 10) return [];

  // Calculate hip velocities
  for (let i = 1; i < analyses.length; i++) {
    const prev = analyses[i - 1];
    const curr = analyses[i];
    curr.hipVelocity = Math.abs(curr.hipRotation - prev.hipRotation) * fps;
  }

  const phases: SwingPhase[] = [];
  let currentPhaseStart = 0;

  // Phase 1: Stance (relatively stable, low movement)
  let stanceEnd = findStanceEnd(analyses);
  if (stanceEnd > 0) {
    phases.push({
      name: 'stance',
      startFrame: 0,
      endFrame: stanceEnd,
      duration: stanceEnd / fps,
      keyEvents: ['Initial setup', 'Weight distribution'],
      comPosition: { x: analyses[0].comX, y: analyses[0].comY },
      confidence: 0.85
    });
    currentPhaseStart = stanceEnd;
  }

  // Phase 2: Load (COM moves backward, knee flex increases)
  const loadEnd = findLoadEnd(analyses, currentPhaseStart);
  if (loadEnd > currentPhaseStart) {
    phases.push({
      name: 'load',
      startFrame: currentPhaseStart,
      endFrame: loadEnd,
      duration: (loadEnd - currentPhaseStart) / fps,
      keyEvents: ['Weight shift backward', 'Coiling', 'Energy storage'],
      comPosition: { x: analyses[loadEnd].comX, y: analyses[loadEnd].comY },
      confidence: 0.8
    });
    currentPhaseStart = loadEnd;
  }

  // Phase 3: Stride (front foot moves forward)
  const strideEnd = findStrideEnd(analyses, currentPhaseStart);
  if (strideEnd > currentPhaseStart) {
    phases.push({
      name: 'stride',
      startFrame: currentPhaseStart,
      endFrame: strideEnd,
      duration: (strideEnd - currentPhaseStart) / fps,
      keyEvents: ['Front foot stride', 'COM begins forward movement'],
      comPosition: { x: analyses[strideEnd].comX, y: analyses[strideEnd].comY },
      confidence: 0.75
    });
    currentPhaseStart = strideEnd;
  }

  // Phase 4: Fire (rapid hip rotation begins)
  const fireEnd = findFireEnd(analyses, currentPhaseStart);
  if (fireEnd > currentPhaseStart) {
    phases.push({
      name: 'fire',
      startFrame: currentPhaseStart,
      endFrame: fireEnd,
      duration: (fireEnd - currentPhaseStart) / fps,
      keyEvents: ['Hip rotation initiation', 'Weight transfer forward'],
      comPosition: { x: analyses[fireEnd].comX, y: analyses[fireEnd].comY },
      confidence: 0.9
    });
    currentPhaseStart = fireEnd;
  }

  // Phase 5: Contact (peak velocity, hand extension)
  const contactEnd = findContactEnd(analyses, currentPhaseStart);
  if (contactEnd > currentPhaseStart) {
    phases.push({
      name: 'contact',
      startFrame: currentPhaseStart,
      endFrame: contactEnd,
      duration: (contactEnd - currentPhaseStart) / fps,
      keyEvents: ['Bat-ball contact', 'Peak velocity', 'Full extension'],
      comPosition: { x: analyses[contactEnd].comX, y: analyses[contactEnd].comY },
      confidence: 0.85
    });
    currentPhaseStart = contactEnd;
  }

  // Phase 6: Follow through (deceleration)
  if (currentPhaseStart < analyses.length - 1) {
    phases.push({
      name: 'follow_through',
      startFrame: currentPhaseStart,
      endFrame: analyses.length - 1,
      duration: (analyses.length - 1 - currentPhaseStart) / fps,
      keyEvents: ['Deceleration', 'Balance recovery'],
      comPosition: { 
        x: analyses[analyses.length - 1].comX, 
        y: analyses[analyses.length - 1].comY 
      },
      confidence: 0.8
    });
  }

  return phases;
}

function findStanceEnd(analyses: FrameAnalysis[]): number {
  // Find where COM starts moving backward (load phase)
  const baselineCOM = analyses[0].comX;
  for (let i = 3; i < analyses.length; i++) {
    if (Math.abs(analyses[i].comX - baselineCOM) > 0.02) {
      return i;
    }
  }
  return Math.min(5, analyses.length);
}

function findLoadEnd(analyses: FrameAnalysis[], start: number): number {
  // Find peak backward COM position
  let minCOM = analyses[start].comX;
  let minIdx = start;
  
  for (let i = start + 1; i < Math.min(start + 20, analyses.length); i++) {
    if (analyses[i].comX < minCOM) {
      minCOM = analyses[i].comX;
      minIdx = i;
    }
  }
  return minIdx;
}

function findStrideEnd(analyses: FrameAnalysis[], start: number): number {
  // Find when front foot makes contact
  for (let i = start; i < Math.min(start + 15, analyses.length); i++) {
    if (analyses[i].frontFootContact) {
      return i;
    }
  }
  return Math.min(start + 8, analyses.length);
}

function findFireEnd(analyses: FrameAnalysis[], start: number): number {
  // Find peak hip velocity
  let maxVelocity = 0;
  let maxIdx = start;
  
  for (let i = start; i < Math.min(start + 10, analyses.length); i++) {
    if (analyses[i].hipVelocity > maxVelocity) {
      maxVelocity = analyses[i].hipVelocity;
      maxIdx = i;
    }
  }
  return maxIdx;
}

function findContactEnd(analyses: FrameAnalysis[], start: number): number {
  // Find peak hand extension
  let maxExtension = 0;
  let maxIdx = start;
  
  for (let i = start; i < Math.min(start + 8, analyses.length); i++) {
    const extension = analyses[i].handPosition.x;
    if (extension > maxExtension) {
      maxExtension = extension;
      maxIdx = i;
    }
  }
  return maxIdx;
}

function assessDetectionQuality(
  phases: SwingPhase[], 
  analyses: FrameAnalysis[]
): { score: number; issues: string[]; detectionConfidence: number } {
  const issues: string[] = [];
  let score = 100;

  // Check if all phases detected
  const expectedPhases = ['stance', 'load', 'stride', 'fire', 'contact', 'follow_through'];
  const detectedPhases = phases.map(p => p.name);
  const missingPhases = expectedPhases.filter(p => !detectedPhases.includes(p as any));
  
  if (missingPhases.length > 0) {
    issues.push(`Missing phases: ${missingPhases.join(', ')}`);
    score -= missingPhases.length * 15;
  }

  // Check phase durations (reasonable ranges)
  const loadPhase = phases.find(p => p.name === 'load');
  const firePhase = phases.find(p => p.name === 'fire');
  
  if (loadPhase && (loadPhase.duration < 0.05 || loadPhase.duration > 0.5)) {
    issues.push('Load phase duration unusual');
    score -= 10;
  }
  
  if (firePhase && (firePhase.duration < 0.03 || firePhase.duration > 0.3)) {
    issues.push('Fire phase duration unusual');
    score -= 10;
  }

  // Check load-to-fire ratio (should be around 3:1)
  if (loadPhase && firePhase) {
    const ratio = loadPhase.duration / firePhase.duration;
    if (ratio < 1.5 || ratio > 5) {
      issues.push(`Load-to-fire ratio (${ratio.toFixed(1)}:1) outside ideal range`);
      score -= 10;
    }
  }

  // Calculate average confidence
  const avgConfidence = phases.reduce((sum, p) => sum + p.confidence, 0) / phases.length;

  return {
    score: Math.max(0, score),
    issues,
    detectionConfidence: avgConfidence
  };
}

function createEmptyFrameAnalysis(frame: number, fps: number): FrameAnalysis {
  return {
    frame,
    timestamp: frame / fps,
    hipRotation: 0,
    shoulderRotation: 0,
    frontKneeAngle: 0,
    backKneeAngle: 0,
    comX: 0,
    comY: 0,
    handPosition: { x: 0, y: 0 },
    frontFootContact: false,
    hipVelocity: 0
  };
}

function createEmptyResult(): PhaseDetectionResult {
  return {
    phases: [],
    totalDuration: 0,
    loadToFireRatio: 0,
    phaseTransitions: [],
    quality: {
      score: 0,
      issues: ['Insufficient pose data for phase detection'],
      detectionConfidence: 0
    }
  };
}

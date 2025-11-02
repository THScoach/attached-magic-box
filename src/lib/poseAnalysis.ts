import { KeypointData } from './videoAnalysis';

// MediaPipe Pose landmark indices
export const POSE_LANDMARKS = {
  // Face
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  
  // Upper body
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  
  // Hands
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  
  // Lower body
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

export interface JointPosition {
  x: number;
  y: number;
  z?: number;
  confidence: number;
}

export interface JointAngle {
  name: string;
  angle: number;
  optimal_min?: number;
  optimal_max?: number;
  status: 'optimal' | 'warning' | 'danger';
}

export interface JointVelocity {
  name: string;
  velocity: number; // m/s or deg/s
  direction: { x: number; y: number };
}

export interface FrameJointData {
  frame_number: number;
  timestamp: number; // milliseconds from start
  phase: 'stance' | 'load' | 'stride' | 'fire' | 'contact' | 'follow_through';
  joints: Record<string, JointPosition>;
  angles: JointAngle[];
  velocities: JointVelocity[];
}

/**
 * Calculate angle between three points (in degrees)
 * @param p1 First point (e.g., hip)
 * @param p2 Middle point (e.g., knee) - vertex of angle
 * @param p3 Third point (e.g., ankle)
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  // Calculate vectors
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  // Calculate dot product and magnitudes
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  // Calculate angle in radians then convert to degrees
  const angleRad = Math.acos(dot / (mag1 * mag2));
  const angleDeg = (angleRad * 180) / Math.PI;
  
  return angleDeg;
}

/**
 * Calculate velocity between two positions
 * @param p1 Previous position
 * @param p2 Current position
 * @param timeInterval Time between frames (milliseconds)
 * @returns Velocity in m/s
 */
export function calculateVelocity(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  timeInterval: number,
  pixelsPerMeter: number = 100 // Rough estimate, can be calibrated
): { velocity: number; direction: { x: number; y: number } } {
  const dx = (p2.x - p1.x) / pixelsPerMeter;
  const dy = (p2.y - p1.y) / pixelsPerMeter;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const timeSec = timeInterval / 1000;
  
  return {
    velocity: distance / timeSec,
    direction: {
      x: dx / distance || 0,
      y: dy / distance || 0
    }
  };
}

/**
 * Determine if hitter is right-handed or left-handed based on setup position
 */
export function detectHandedness(keypoints: KeypointData[]): 'right' | 'left' {
  const leftHip = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = keypoints.find(kp => kp.name === 'right_hip');
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  
  if (!leftHip || !rightHip || !leftShoulder || !rightShoulder) {
    return 'right'; // Default assumption
  }
  
  // Calculate body orientation
  const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
  const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  
  // Right-handed hitters typically have their left side closer to the camera in front view
  // This is a simplified heuristic and may need adjustment based on camera angle
  const leftSideForward = leftShoulder.x < rightShoulder.x;
  
  return leftSideForward ? 'right' : 'left';
}

/**
 * Calculate all joint angles for a frame
 */
export function calculateJointAngles(
  keypoints: KeypointData[],
  handedness: 'right' | 'left'
): JointAngle[] {
  const angles: JointAngle[] = [];
  
  // Helper to find keypoint by name
  const getKp = (name: string) => keypoints.find(kp => kp.name === name);
  
  // Determine lead (front) and rear (back) based on handedness
  const leadSide = handedness === 'right' ? 'left' : 'right';
  const rearSide = handedness === 'right' ? 'right' : 'left';
  
  // LEAD LEG ANGLES
  const leadHip = getKp(`${leadSide}_hip`);
  const leadKnee = getKp(`${leadSide}_knee`);
  const leadAnkle = getKp(`${leadSide}_ankle`);
  const leadHeel = getKp(`${leadSide}_heel`);
  const leadFootIndex = getKp(`${leadSide}_foot_index`);
  
  if (leadHip && leadKnee && leadAnkle && leadHip.score > 0.5 && leadKnee.score > 0.5 && leadAnkle.score > 0.5) {
    const kneeAngle = calculateAngle(leadHip, leadKnee, leadAnkle);
    angles.push({
      name: 'lead_knee_angle',
      angle: kneeAngle,
      optimal_min: 145,
      optimal_max: 160,
      status: kneeAngle >= 145 && kneeAngle <= 160 ? 'optimal' : 
              kneeAngle < 135 || kneeAngle > 170 ? 'danger' : 'warning'
    });
  }
  
  if (leadKnee && leadAnkle && leadFootIndex && leadKnee.score > 0.5 && leadAnkle.score > 0.5 && leadFootIndex.score > 0.5) {
    const ankleAngle = calculateAngle(leadKnee, leadAnkle, leadFootIndex);
    angles.push({
      name: 'lead_ankle_angle',
      angle: ankleAngle,
      optimal_min: 10,
      optimal_max: 15,
      status: ankleAngle >= 10 && ankleAngle <= 15 ? 'optimal' : 
              ankleAngle < 5 || ankleAngle > 20 ? 'danger' : 'warning'
    });
  }
  
  // REAR LEG ANGLES
  const rearHip = getKp(`${rearSide}_hip`);
  const rearKnee = getKp(`${rearSide}_knee`);
  const rearAnkle = getKp(`${rearSide}_ankle`);
  const rearFootIndex = getKp(`${rearSide}_foot_index`);
  
  if (rearHip && rearKnee && rearAnkle && rearHip.score > 0.5 && rearKnee.score > 0.5 && rearAnkle.score > 0.5) {
    const kneeAngle = calculateAngle(rearHip, rearKnee, rearAnkle);
    angles.push({
      name: 'rear_knee_angle',
      angle: kneeAngle,
      optimal_min: 140,
      optimal_max: 165,
      status: kneeAngle >= 140 && kneeAngle <= 165 ? 'optimal' : 
              kneeAngle < 130 || kneeAngle > 175 ? 'danger' : 'warning'
    });
  }
  
  if (rearKnee && rearAnkle && rearFootIndex && rearKnee.score > 0.5 && rearAnkle.score > 0.5 && rearFootIndex.score > 0.5) {
    const ankleAngle = calculateAngle(rearKnee, rearAnkle, rearFootIndex);
    angles.push({
      name: 'rear_ankle_angle',
      angle: ankleAngle,
      optimal_min: 85,
      optimal_max: 95,
      status: ankleAngle >= 85 && ankleAngle <= 95 ? 'optimal' : 
              ankleAngle < 75 || ankleAngle > 105 ? 'danger' : 'warning'
    });
  }
  
  // ARM ANGLES
  const leadShoulder = getKp(`${leadSide}_shoulder`);
  const leadElbow = getKp(`${leadSide}_elbow`);
  const leadWrist = getKp(`${leadSide}_wrist`);
  
  if (leadShoulder && leadElbow && leadWrist && leadShoulder.score > 0.5 && leadElbow.score > 0.5 && leadWrist.score > 0.5) {
    const elbowAngle = calculateAngle(leadShoulder, leadElbow, leadWrist);
    angles.push({
      name: 'lead_elbow_angle',
      angle: elbowAngle,
      optimal_min: 150,
      optimal_max: 170,
      status: elbowAngle >= 150 && elbowAngle <= 170 ? 'optimal' : 
              elbowAngle < 140 || elbowAngle > 180 ? 'danger' : 'warning'
    });
  }
  
  const rearShoulder = getKp(`${rearSide}_shoulder`);
  const rearElbow = getKp(`${rearSide}_elbow`);
  const rearWrist = getKp(`${rearSide}_wrist`);
  
  if (rearShoulder && rearElbow && rearWrist && rearShoulder.score > 0.5 && rearElbow.score > 0.5 && rearWrist.score > 0.5) {
    const elbowAngle = calculateAngle(rearShoulder, rearElbow, rearWrist);
    angles.push({
      name: 'rear_elbow_angle',
      angle: elbowAngle,
      optimal_min: 90,
      optimal_max: 110,
      status: elbowAngle >= 90 && elbowAngle <= 110 ? 'optimal' : 
              elbowAngle < 80 || elbowAngle > 120 ? 'danger' : 'warning'
    });
  }
  
  // SPINE ANGLES
  const leftHip = getKp('left_hip');
  const rightHip = getKp('right_hip');
  const leftShoulder = getKp('left_shoulder');
  const rightShoulder = getKp('right_shoulder');
  const nose = getKp('nose');
  
  if (leftHip && rightHip && leftShoulder && rightShoulder) {
    const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    
    // Spine lateral tilt (frontal plane)
    const spineAngle = Math.atan2(shoulderCenter.y - hipCenter.y, shoulderCenter.x - hipCenter.x);
    const lateralTilt = Math.abs((spineAngle * 180 / Math.PI) - 90);
    
    angles.push({
      name: 'spine_lateral_tilt',
      angle: lateralTilt,
      optimal_min: 0,
      optimal_max: 15,
      status: lateralTilt <= 15 ? 'optimal' : 
              lateralTilt > 25 ? 'danger' : 'warning'
    });
  }
  
  return angles;
}

/**
 * Calculate joint velocities between two frames
 */
export function calculateJointVelocities(
  currentKeypoints: KeypointData[],
  previousKeypoints: KeypointData[],
  timeInterval: number,
  pixelsPerMeter: number = 100
): JointVelocity[] {
  const velocities: JointVelocity[] = [];
  
  // Key joints to track velocity
  const trackedJoints = [
    'left_knee', 'right_knee',
    'left_ankle', 'right_ankle',
    'left_wrist', 'right_wrist',
    'left_elbow', 'right_elbow',
    'left_hip', 'right_hip'
  ];
  
  for (const jointName of trackedJoints) {
    const current = currentKeypoints.find(kp => kp.name === jointName);
    const previous = previousKeypoints.find(kp => kp.name === jointName);
    
    if (current && previous && current.score > 0.5 && previous.score > 0.5) {
      const { velocity, direction } = calculateVelocity(
        previous,
        current,
        timeInterval,
        pixelsPerMeter
      );
      
      velocities.push({
        name: `${jointName}_velocity`,
        velocity,
        direction
      });
    }
  }
  
  return velocities;
}

/**
 * Convert keypoints array to joints object
 */
export function keypointsToJoints(keypoints: KeypointData[]): Record<string, JointPosition> {
  const joints: Record<string, JointPosition> = {};
  
  for (const kp of keypoints) {
    joints[kp.name] = {
      x: kp.x,
      y: kp.y,
      z: 0, // 2D analysis for now
      confidence: kp.score
    };
  }
  
  return joints;
}

/**
 * Determine swing phase based on joint positions and timing
 */
export function determineSwingPhase(
  frameIndex: number,
  totalFrames: number,
  keypoints: KeypointData[],
  handedness: 'right' | 'left'
): FrameJointData['phase'] {
  const progress = frameIndex / totalFrames;
  
  // Simple phase detection based on frame progression
  // This will be enhanced with actual joint movement analysis
  if (progress < 0.15) return 'stance';
  if (progress < 0.35) return 'load';
  if (progress < 0.55) return 'stride';
  if (progress < 0.75) return 'fire';
  if (progress < 0.85) return 'contact';
  return 'follow_through';
}

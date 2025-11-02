import { PoseData, KeypointData } from './videoAnalysis';
import {
  FrameJointData,
  calculateJointAngles,
  calculateJointVelocities,
  keypointsToJoints,
  determineSwingPhase,
  detectHandedness
} from './poseAnalysis';

/**
 * Process raw pose data into comprehensive frame-by-frame joint analysis
 */
export function processPoseData(
  poseData: PoseData[],
  videoDuration: number
): FrameJointData[] {
  if (!poseData || poseData.length === 0) {
    return [];
  }
  
  const frameJointData: FrameJointData[] = [];
  
  // Detect handedness from first frame
  const handedness = detectHandedness(poseData[0].keypoints);
  console.log(`Detected handedness: ${handedness}`);
  
  for (let i = 0; i < poseData.length; i++) {
    const currentFrame = poseData[i];
    const previousFrame = i > 0 ? poseData[i - 1] : null;
    
    // Calculate time interval between frames
    const timeInterval = previousFrame 
      ? currentFrame.timestamp - previousFrame.timestamp 
      : 33; // Default to 30fps if first frame
    
    // Calculate joint angles
    const angles = calculateJointAngles(currentFrame.keypoints, handedness);
    
    // Calculate joint velocities (if we have a previous frame)
    const velocities = previousFrame
      ? calculateJointVelocities(
          currentFrame.keypoints,
          previousFrame.keypoints,
          timeInterval,
          100 // Pixels per meter (rough estimate, can be calibrated)
        )
      : [];
    
    // Determine swing phase
    const phase = determineSwingPhase(
      i,
      poseData.length,
      currentFrame.keypoints,
      handedness
    );
    
    // Convert keypoints to joints object
    const joints = keypointsToJoints(currentFrame.keypoints);
    
    frameJointData.push({
      frame_number: i,
      timestamp: currentFrame.timestamp,
      phase,
      joints,
      angles,
      velocities
    });
  }
  
  console.log(`Processed ${frameJointData.length} frames with joint data`);
  return frameJointData;
}

/**
 * Extract summary statistics from frame joint data
 */
export interface JointDataSummary {
  total_frames: number;
  handedness: 'right' | 'left';
  phase_breakdown: Record<string, number>;
  critical_angles: {
    lead_knee_at_contact: number | null;
    rear_knee_at_load: number | null;
    lead_elbow_at_contact: number | null;
    spine_max_tilt: number | null;
  };
  max_velocities: {
    lead_wrist: number | null;
    rear_wrist: number | null;
    lead_knee: number | null;
  };
  biotensegrity_flags: string[];
}

export function summarizeJointData(frameData: FrameJointData[]): JointDataSummary {
  if (frameData.length === 0) {
    return {
      total_frames: 0,
      handedness: 'right',
      phase_breakdown: {},
      critical_angles: {
        lead_knee_at_contact: null,
        rear_knee_at_load: null,
        lead_elbow_at_contact: null,
        spine_max_tilt: null
      },
      max_velocities: {
        lead_wrist: null,
        rear_wrist: null,
        lead_knee: null
      },
      biotensegrity_flags: []
    };
  }
  
  // Phase breakdown
  const phase_breakdown: Record<string, number> = {};
  for (const frame of frameData) {
    phase_breakdown[frame.phase] = (phase_breakdown[frame.phase] || 0) + 1;
  }
  
  // Critical angles at specific phases
  const contactFrame = frameData.find(f => f.phase === 'contact') || frameData[Math.floor(frameData.length * 0.8)];
  const loadFrame = frameData.find(f => f.phase === 'load') || frameData[Math.floor(frameData.length * 0.3)];
  
  const lead_knee_at_contact = contactFrame.angles.find(a => a.name === 'lead_knee_angle')?.angle || null;
  const rear_knee_at_load = loadFrame.angles.find(a => a.name === 'rear_knee_angle')?.angle || null;
  const lead_elbow_at_contact = contactFrame.angles.find(a => a.name === 'lead_elbow_angle')?.angle || null;
  
  // Max spine tilt across all frames
  let spine_max_tilt = 0;
  for (const frame of frameData) {
    const spineTilt = frame.angles.find(a => a.name === 'spine_lateral_tilt')?.angle || 0;
    spine_max_tilt = Math.max(spine_max_tilt, spineTilt);
  }
  
  // Max velocities
  let max_lead_wrist = 0;
  let max_rear_wrist = 0;
  let max_lead_knee = 0;
  
  for (const frame of frameData) {
    const leadWristVel = frame.velocities.find(v => v.name.includes('left_wrist_velocity') || v.name.includes('right_wrist_velocity'))?.velocity || 0;
    const rearWristVel = frame.velocities.find(v => v.name.includes('wrist_velocity') && !v.name.includes('lead'))?.velocity || 0;
    const leadKneeVel = frame.velocities.find(v => v.name.includes('knee_velocity'))?.velocity || 0;
    
    max_lead_wrist = Math.max(max_lead_wrist, leadWristVel);
    max_rear_wrist = Math.max(max_rear_wrist, rearWristVel);
    max_lead_knee = Math.max(max_lead_knee, leadKneeVel);
  }
  
  // Biotensegrity flags
  const biotensegrity_flags: string[] = [];
  
  // Check for danger zones in angles
  for (const frame of frameData) {
    for (const angle of frame.angles) {
      if (angle.status === 'danger') {
        const flag = `${angle.name}: ${angle.angle.toFixed(1)}° (${frame.phase} phase) - biotensegrity violation`;
        if (!biotensegrity_flags.includes(flag)) {
          biotensegrity_flags.push(flag);
        }
      }
    }
  }
  
  // Detect handedness from first frame
  const handedness = 'right'; // Would need to determine from actual data
  
  return {
    total_frames: frameData.length,
    handedness,
    phase_breakdown,
    critical_angles: {
      lead_knee_at_contact,
      rear_knee_at_load,
      lead_elbow_at_contact,
      spine_max_tilt
    },
    max_velocities: {
      lead_wrist: max_lead_wrist,
      rear_wrist: max_rear_wrist,
      lead_knee: max_lead_knee
    },
    biotensegrity_flags
  };
}

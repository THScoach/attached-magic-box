/**
 * Impact-Synchronized Pose Analysis
 * Analyzes pose data with known impact frame for accurate timing
 */

import { Pose, PoseDetector } from '@tensorflow-models/pose-detection';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { extractFramesFromVideo, ExtractedFrame } from './videoFrameExtraction';

export interface ImpactSyncAnalysisResult {
  impactFrame: number;
  totalFrames: number;
  frameRate: number;
  
  // Timing metrics
  loadDuration: number; // ms from negative move to max pelvis
  fireDuration: number; // ms from max pelvis to impact
  tempoRatio: number; // load / fire
  
  // Key frame indices
  negativeMoveFrame: number;
  maxPelvisFrame: number;
  
  // Rotational velocities (deg/s)
  pelvisMaxVelocity: number;
  torsoMaxVelocity: number;
  armMaxVelocity: number;
  
  // Pose data for all frames
  poses: Pose[];
}

/**
 * Analyze video with known impact frame
 */
export async function analyzeImpactSyncVideo(
  videoBlob: Blob,
  impactFrameIndex: number,
  frameRate: number = 30 // Sampling frame rate
): Promise<ImpactSyncAnalysisResult> {
  // Extract frames from video
  const frames = await extractFramesFromVideo(videoBlob, frameRate);
  
  // Run pose estimation on all frames
  const poses = await runPoseEstimationOnFrames(frames);
  
  // Find key events working backwards from impact
  const maxPelvisFrame = findMaxPelvisVelocityFrame(poses, 0, impactFrameIndex);
  const negativeMoveFrame = findNegativeMoveFrame(poses, 0, maxPelvisFrame);
  
  // Calculate timing
  const loadDuration = (maxPelvisFrame - negativeMoveFrame) * (1000 / frameRate);
  const fireDuration = (impactFrameIndex - maxPelvisFrame) * (1000 / frameRate);
  const tempoRatio = loadDuration / fireDuration;
  
  // Extract rotational velocities
  const pelvisMaxVelocity = calculateMaxPelvisVelocity(poses, frameRate);
  const torsoMaxVelocity = calculateMaxTorsoVelocity(poses, frameRate);
  const armMaxVelocity = calculateMaxArmVelocity(poses, frameRate);
  
  return {
    impactFrame: impactFrameIndex,
    totalFrames: frames.length,
    frameRate,
    loadDuration,
    fireDuration,
    tempoRatio,
    negativeMoveFrame,
    maxPelvisFrame,
    pelvisMaxVelocity,
    torsoMaxVelocity,
    armMaxVelocity,
    poses
  };
}

/**
 * Run pose estimation on extracted frames
 */
async function runPoseEstimationOnFrames(frames: ExtractedFrame[]): Promise<Pose[]> {
  const detector = await createPoseDetector();
  const poses: Pose[] = [];
  
  for (const frame of frames) {
    const pose = await detector.estimatePoses(frame.imageData);
    poses.push(pose[0] || { keypoints: [], score: 0 });
  }
  
  detector.dispose();
  return poses;
}

/**
 * Create MediaPipe Pose detector
 */
async function createPoseDetector(): Promise<PoseDetector> {
  return await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
    }
  );
}

/**
 * Find frame with maximum pelvis velocity
 */
function findMaxPelvisVelocityFrame(
  poses: Pose[],
  startFrame: number,
  endFrame: number
): number {
  let maxVelocity = 0;
  let maxFrame = startFrame;
  
  for (let i = startFrame + 1; i < endFrame; i++) {
    const velocity = calculatePelvisAngularVelocity(poses[i - 1], poses[i]);
    if (velocity > maxVelocity) {
      maxVelocity = velocity;
      maxFrame = i;
    }
  }
  
  return maxFrame;
}

/**
 * Find negative move frame (start of load phase)
 */
function findNegativeMoveFrame(
  poses: Pose[],
  startFrame: number,
  endFrame: number
): number {
  // Look for the frame where pelvis starts moving backward
  // Simplified: find earliest frame with minimal pelvis rotation
  
  let minRotation = Infinity;
  let minFrame = startFrame;
  
  for (let i = startFrame; i < endFrame; i++) {
    const rotation = getPelvisRotation(poses[i]);
    if (rotation < minRotation) {
      minRotation = rotation;
      minFrame = i;
    }
  }
  
  return minFrame;
}

/**
 * Calculate maximum pelvis velocity
 */
function calculateMaxPelvisVelocity(poses: Pose[], frameRate: number): number {
  let maxVelocity = 0;
  
  for (let i = 1; i < poses.length; i++) {
    const velocity = calculatePelvisAngularVelocity(poses[i - 1], poses[i]);
    maxVelocity = Math.max(maxVelocity, velocity);
  }
  
  return maxVelocity * frameRate; // Convert to deg/s
}

/**
 * Calculate maximum torso velocity
 */
function calculateMaxTorsoVelocity(poses: Pose[], frameRate: number): number {
  let maxVelocity = 0;
  
  for (let i = 1; i < poses.length; i++) {
    const velocity = calculateTorsoAngularVelocity(poses[i - 1], poses[i]);
    maxVelocity = Math.max(maxVelocity, velocity);
  }
  
  return maxVelocity * frameRate;
}

/**
 * Calculate maximum arm velocity
 */
function calculateMaxArmVelocity(poses: Pose[], frameRate: number): number {
  let maxVelocity = 0;
  
  for (let i = 1; i < poses.length; i++) {
    const velocity = calculateArmAngularVelocity(poses[i - 1], poses[i]);
    maxVelocity = Math.max(maxVelocity, velocity);
  }
  
  return maxVelocity * frameRate;
}

// Helper functions for angle calculations

function calculatePelvisAngularVelocity(prevPose: Pose, currPose: Pose): number {
  const prevAngle = getPelvisRotation(prevPose);
  const currAngle = getPelvisRotation(currPose);
  return Math.abs(currAngle - prevAngle);
}

function calculateTorsoAngularVelocity(prevPose: Pose, currPose: Pose): number {
  const prevAngle = getTorsoRotation(prevPose);
  const currAngle = getTorsoRotation(currPose);
  return Math.abs(currAngle - prevAngle);
}

function calculateArmAngularVelocity(prevPose: Pose, currPose: Pose): number {
  const prevAngle = getArmRotation(prevPose);
  const currAngle = getArmRotation(currPose);
  return Math.abs(currAngle - prevAngle);
}

function getPelvisRotation(pose: Pose): number {
  if (!pose.keypoints || pose.keypoints.length === 0) return 0;
  
  // Calculate angle between left hip and right hip
  const leftHip = pose.keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = pose.keypoints.find(kp => kp.name === 'right_hip');
  
  if (!leftHip || !rightHip) return 0;
  
  const dx = rightHip.x - leftHip.x;
  const dy = rightHip.y - leftHip.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function getTorsoRotation(pose: Pose): number {
  if (!pose.keypoints || pose.keypoints.length === 0) return 0;
  
  const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');
  
  if (!leftShoulder || !rightShoulder) return 0;
  
  const dx = rightShoulder.x - leftShoulder.x;
  const dy = rightShoulder.y - leftShoulder.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function getArmRotation(pose: Pose): number {
  if (!pose.keypoints || pose.keypoints.length === 0) return 0;
  
  // Use dominant arm (right arm for now)
  const shoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');
  const elbow = pose.keypoints.find(kp => kp.name === 'right_elbow');
  const wrist = pose.keypoints.find(kp => kp.name === 'right_wrist');
  
  if (!shoulder || !elbow || !wrist) return 0;
  
  // Calculate angle of upper arm
  const dx = elbow.x - shoulder.x;
  const dy = elbow.y - shoulder.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

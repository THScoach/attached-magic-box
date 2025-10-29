import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';

export interface KeypointData {
  name: string;
  x: number;
  y: number;
  score: number;
}

export interface PoseData {
  keypoints: KeypointData[];
  timestamp: number;
}

let detector: poseDetection.PoseDetector | null = null;

export async function initializePoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detector) return detector;

  await tf.ready();
  await tf.setBackend('webgl');

  const model = poseDetection.SupportedModels.MoveNet;
  detector = await poseDetection.createDetector(model, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
  });

  return detector;
}

export async function extractVideoFrames(
  videoFile: File,
  numFrames: number = 8
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const frames: string[] = [];
    let currentFrame = 0;
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      const interval = duration / (numFrames + 1);
      
      const captureFrame = () => {
        if (currentFrame >= numFrames) {
          video.remove();
          canvas.remove();
          resolve(frames);
          return;
        }
        
        const time = (currentFrame + 1) * interval;
        video.currentTime = time;
      };
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.8));
        currentFrame++;
        captureFrame();
      };
      
      captureFrame();
    };
    
    video.onerror = () => {
      reject(new Error('Error loading video'));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
}

export async function detectPoseInFrames(
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<PoseData[]> {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  
  const detector = await initializePoseDetector();
  const poses: PoseData[] = [];
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const fps = 30; // Sample at 30fps for pose detection
      const totalFrames = Math.floor(duration * fps);
      const interval = 1 / fps;
      
      for (let i = 0; i < totalFrames; i++) {
        video.currentTime = i * interval;
        
        await new Promise<void>((seekResolve) => {
          video.onseeked = () => seekResolve();
        });
        
        const detectedPoses = await detector.estimatePoses(video);
        
        if (detectedPoses.length > 0) {
          poses.push({
            keypoints: detectedPoses[0].keypoints.map(kp => ({
              name: kp.name || '',
              x: kp.x,
              y: kp.y,
              score: kp.score || 0
            })),
            timestamp: video.currentTime * 1000 // Convert to milliseconds
          });
        }
        
        if (onProgress) {
          onProgress((i + 1) / totalFrames * 100);
        }
      }
      
      video.remove();
      resolve(poses);
    };
    
    video.onerror = () => {
      reject(new Error('Error loading video for pose detection'));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
}

export function drawSkeletonOnCanvas(
  canvas: HTMLCanvasElement,
  keypoints: KeypointData[],
  videoWidth: number,
  videoHeight: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Define skeleton connections
  const connections = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
  ];

  // Draw skeleton lines
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 3;
  
  connections.forEach(([start, end]) => {
    const startPoint = keypoints.find(kp => kp.name === start);
    const endPoint = keypoints.find(kp => kp.name === end);
    
    if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  });

  // Draw keypoints
  ctx.fillStyle = '#ff0000';
  keypoints.forEach(kp => {
    if (kp.score > 0.3) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}

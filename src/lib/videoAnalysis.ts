import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

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

export async function extractVideoFrames(
  videoFile: File,
  numFrames: number = 8
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const frames: string[] = [];
    let currentFrame = 0;
    let loadTimeout: number;
    
    // Set a timeout for loading
    loadTimeout = window.setTimeout(() => {
      URL.revokeObjectURL(video.src);
      video.remove();
      canvas.remove();
      reject(new Error('Video loading timeout - file may be corrupted or incompatible'));
    }, 10000);
    
    const cleanup = () => {
      clearTimeout(loadTimeout);
      URL.revokeObjectURL(video.src);
      video.remove();
      canvas.remove();
    };
    
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded:', {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
      
      // Check if video has valid dimensions
      if (!video.videoWidth || !video.videoHeight || !video.duration || video.duration === Infinity) {
        cleanup();
        reject(new Error('Invalid video metadata - file may be corrupted'));
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      const interval = duration / (numFrames + 1);
      
      const captureFrame = () => {
        if (currentFrame >= numFrames) {
          cleanup();
          resolve(frames);
          return;
        }
        
        const time = (currentFrame + 1) * interval;
        video.currentTime = time;
      };
      
      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.85));
          currentFrame++;
          captureFrame();
        } catch (err) {
          console.error('Error capturing frame:', err);
          cleanup();
          reject(new Error('Error capturing video frame'));
        }
      };
      
      // Start capturing frames
      captureFrame();
    };
    
    video.onerror = (e) => {
      console.error('Video element error:', e);
      cleanup();
      reject(new Error('Error loading video - format may not be supported by your browser'));
    };
    
    // Create blob URL and load video
    try {
      const blobUrl = URL.createObjectURL(videoFile);
      console.log('Loading video from blob URL, file size:', videoFile.size, 'type:', videoFile.type);
      video.src = blobUrl;
      video.load();
    } catch (err) {
      cleanup();
      reject(new Error('Failed to create video URL'));
    }
  });
}

export async function detectPoseInFrames(
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<PoseData[]> {
  try {
    // Dynamically import MediaPipe Pose
    const { Pose } = await import('@mediapipe/pose');
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      
      const poseData: PoseData[] = [];
      let currentFrame = 0;
      let isProcessing = false;
      
      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });
      
      pose.setOptions({
        modelComplexity: 1, // 0, 1, or 2 (higher = more accurate but slower)
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      pose.onResults((results) => {
        if (results.poseLandmarks) {
          const keypoints: KeypointData[] = results.poseLandmarks.map((landmark, index) => ({
            name: getLandmarkName(index),
            x: landmark.x * video.videoWidth,
            y: landmark.y * video.videoHeight,
            score: landmark.visibility || 0
          }));
          
          poseData.push({
            keypoints,
            timestamp: video.currentTime * 1000 // Convert to milliseconds
          });
        }
        
        isProcessing = false;
      });
      
      const processFrame = async () => {
        if (isProcessing || video.ended) return;
        
        isProcessing = true;
        await pose.send({ image: video });
        
        currentFrame++;
        if (onProgress) {
          onProgress(Math.min((currentFrame / 120) * 100, 100)); // Assume ~120 frames
        }
      };
      
      video.onloadedmetadata = () => {
        console.log('Video loaded for pose detection:', {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
        
        // Process frames every 33ms (approximately 30fps)
        const intervalId = setInterval(() => {
          if (video.ended || video.currentTime >= video.duration) {
            clearInterval(intervalId);
            pose.close();
            URL.revokeObjectURL(video.src);
            video.remove();
            console.log(`Pose detection complete: ${poseData.length} frames analyzed`);
            resolve(poseData);
            return;
          }
          
          processFrame();
        }, 33);
        
        video.play();
      };
      
      video.onerror = (e) => {
        console.error('Video error during pose detection:', e);
        pose.close();
        reject(new Error('Error loading video for pose detection'));
      };
      
      video.src = URL.createObjectURL(videoFile);
      video.load();
    });
  } catch (error) {
    console.error('Pose detection error:', error);
    // Fallback to no pose data
    return [];
  }
}

// Helper function to convert MediaPipe landmark index to readable name
function getLandmarkName(index: number): string {
  const names = [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner',
    'right_eye', 'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
    'left_pinky', 'right_pinky', 'left_index', 'right_index', 'left_thumb', 'right_thumb',
    'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
    'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index'
  ];
  return names[index] || `landmark_${index}`;
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

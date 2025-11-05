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

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  codec?: string;
}

// Extract video metadata including frame rate
export async function extractVideoMetadata(videoFile: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    let frameRate = 30; // Default fallback
    let frameCount = 0;
    let lastTime = -1;
    let frameTimes: number[] = [];
    
    // Check if this is an iOS slow-motion video by filename/type
    const isLikelyiOSSlowMo = (videoFile.name.toLowerCase().includes('img_') && 
                               videoFile.type === 'video/quicktime') ||
                              videoFile.name.toLowerCase().includes('slowmo');
    
    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
    };
    
    video.onloadedmetadata = async () => {
      try {
        const width = video.videoWidth;
        const height = video.videoHeight;
        const duration = video.duration;
        
        // PRIORITY: Check for iOS slow-motion indicators
        // iOS slow-mo files are often named IMG_XXXX.mov and are 240fps but report as 30fps
        if (isLikelyiOSSlowMo) {
          console.log('Detected likely iOS slow-motion video - assuming 240fps capture rate');
          cleanup();
          resolve({ width, height, duration, frameRate: 240 });
          return;
        }
        
        // Method 1: Try to get frame rate from video track (works well for some videos)
        if ('captureStream' in video || 'mozCaptureStream' in video) {
          try {
            const stream = (video as any).captureStream?.() || (video as any).mozCaptureStream?.();
            if (stream) {
              const videoTracks = stream.getVideoTracks();
              if (videoTracks.length > 0) {
                const settings = videoTracks[0].getSettings();
                if (settings.frameRate) {
                  frameRate = settings.frameRate;
                  console.log(`Frame rate detected from track: ${frameRate}fps`);
                  cleanup();
                  resolve({ width, height, duration, frameRate });
                  return;
                }
              }
            }
          } catch (e) {
            console.log('Video track method not available, trying alternative methods');
          }
        }
        
        // Method 2: Use requestVideoFrameCallback (Chrome/Edge)
        if ('requestVideoFrameCallback' in video) {
          let sampleCount = 0;
          const maxSamples = 30;
          
          const measureFrameRate = () => {
            (video as any).requestVideoFrameCallback((now: number, metadata: any) => {
              if (metadata && metadata.mediaTime !== undefined) {
                if (lastTime !== -1) {
                  const deltaTime = metadata.mediaTime - lastTime;
                  if (deltaTime > 0) {
                    frameTimes.push(1 / deltaTime);
                  }
                }
                lastTime = metadata.mediaTime;
                sampleCount++;
                
                if (sampleCount < maxSamples && !video.ended) {
                  measureFrameRate();
                } else {
                  // Calculate average frame rate from samples
                  if (frameTimes.length > 0) {
                    frameRate = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
                    console.log(`Frame rate calculated from ${frameTimes.length} samples: ${frameRate.toFixed(2)}fps`);
                  }
                  cleanup();
                  resolve({ width, height, duration, frameRate: Math.round(frameRate) });
                }
              }
            });
          };
          
          video.play().then(() => {
            measureFrameRate();
          }).catch(() => {
            // Fallback if play fails
            cleanup();
            resolve({ width, height, duration, frameRate: 30 });
          });
          
          return;
        }
        
        // Method 3: Estimate from duration (least accurate)
        // This is just a fallback - most modern browsers support one of the above methods
        console.log('Using fallback frame rate estimation');
        cleanup();
        resolve({ width, height, duration, frameRate: 30 });
        
      } catch (error) {
        console.error('Error extracting metadata:', error);
        cleanup();
        reject(error);
      }
    };
    
    video.onerror = (e) => {
      console.error('Video error during metadata extraction:', e);
      cleanup();
      reject(new Error('Failed to load video for metadata extraction'));
    };
    
    try {
      video.src = URL.createObjectURL(videoFile);
      video.load();
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
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
  onProgress?: (progress: number) => void,
  sourceFrameRate?: number // Original capture frame rate (e.g., 240fps for iOS slow-mo)
): Promise<PoseData[]> {
  try {
    // Dynamically import MediaPipe Pose module
    const mediapipeModule = await import('@mediapipe/pose');
    const Pose = mediapipeModule.Pose || (mediapipeModule as any).default?.Pose;
    
    if (!Pose) {
      console.error('MediaPipe Pose not found in module');
      return [];
    }
    
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
          
          // Calculate real swing time if this is a slow-motion video
          // For 240fps video sampled at 30fps: real_time = playback_time × (30/240) = playback_time × 0.125
          const samplingRate = 30; // We sample at 30fps (processFrame every 33ms)
          const playbackTime = video.currentTime * 1000; // milliseconds
          const realTimestamp = sourceFrameRate && sourceFrameRate > samplingRate
            ? playbackTime * (samplingRate / sourceFrameRate)
            : playbackTime;
          
          poseData.push({
            keypoints,
            timestamp: realTimestamp
          });
        }
        
        isProcessing = false;
      });
      
      const processFrame = async () => {
        if (isProcessing || video.ended) return;
        
        isProcessing = true;
        await pose.send({ image: video });
        
        currentFrame++;
        if (onProgress && video.duration) {
          // Calculate progress based on video playback position
          const progress = Math.min((video.currentTime / video.duration) * 100, 100);
          onProgress(progress);
        }
      };
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        console.log('Video loaded for pose detection:', {
          duration,
          width: video.videoWidth,
          height: video.videoHeight,
          sourceFrameRate
        });
        
        // Calculate optimal sampling rate - cap at 120 total frames for performance
        // For high FPS videos, we'll skip frames intelligently
        const maxFramesToProcess = 120;
        const targetSamplingFps = 30; // We want about 30 samples per second
        const estimatedTotalFrames = duration * (sourceFrameRate || 30);
        
        // If video would have too many frames, increase interval to skip frames
        const samplingInterval = estimatedTotalFrames > maxFramesToProcess 
          ? Math.ceil((duration * 1000) / maxFramesToProcess) // milliseconds between samples
          : 33; // default 33ms = ~30fps
        
        console.log(`Processing strategy: ${Math.ceil((duration * 1000) / samplingInterval)} frames at ${samplingInterval}ms intervals`);
        
        // Process frames at calculated interval
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
        }, samplingInterval);
        
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

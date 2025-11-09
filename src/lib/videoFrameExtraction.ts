/**
 * Video Frame Extraction Utilities
 * Extracts individual frames from video blobs for pose analysis
 */

export interface ExtractedFrame {
  frame: number;
  timestamp: number; // milliseconds
  imageData: ImageData;
}

/**
 * Extract frames from a video blob
 */
export async function extractFramesFromVideo(
  videoBlob: Blob,
  frameRate: number = 30 // Sample at 30fps for analysis
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const frames: ExtractedFrame[] = [];
    const url = URL.createObjectURL(videoBlob);
    
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      const frameInterval = 1 / frameRate;
      let currentTime = 0;
      let frameIndex = 0;

      const captureFrame = () => {
        if (currentTime >= duration) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        
        frames.push({
          frame: frameIndex,
          timestamp: currentTime * 1000,
          imageData
        });

        frameIndex++;
        currentTime += frameInterval;
        captureFrame();
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Video loading failed'));
      };

      captureFrame();
    };

    video.load();
  });
}

/**
 * Convert frame timestamp to frame index based on frame rate
 */
export function timestampToFrameIndex(timestamp: number, frameRate: number): number {
  return Math.floor((timestamp / 1000) * frameRate);
}

/**
 * Convert frame index to timestamp based on frame rate
 */
export function frameIndexToTimestamp(frameIndex: number, frameRate: number): number {
  return (frameIndex / frameRate) * 1000;
}

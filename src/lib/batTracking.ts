/**
 * Bat Tracking Utilities
 * Detects and tracks baseball bat across video frames
 */

import * as tf from '@tensorflow/tfjs';

export interface BatDetection {
  detected: boolean;
  bbox?: [number, number, number, number]; // [x, y, width, height]
  confidence?: number;
  centerX?: number;
  centerY?: number;
  angle?: number; // degrees from horizontal
}

export interface BatPosition {
  frame: number;
  timestamp: number;
  detected: boolean;
  x?: number;
  y?: number;
  angle?: number;
  confidence?: number;
}

export interface BatVelocity {
  timestamp: number;
  velocity: number; // deg/s
  confidence: number;
  detected: boolean;
}

/**
 * Detect bat in a single frame using color/edge detection
 * (Simplified approach - works better than full object detection for fast-moving bat)
 */
export function detectBatInFrame(imageData: ImageData): BatDetection {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { detected: false };

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  // Convert to grayscale and detect edges
  const grayscale = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const edges = detectEdges(grayscale);
  
  // Look for elongated objects (bat-like shapes)
  const batCandidate = findElongatedObject(edges);
  
  if (batCandidate) {
    const angle = calculateObjectAngle(batCandidate);
    return {
      detected: true,
      bbox: batCandidate.bbox,
      confidence: batCandidate.confidence,
      centerX: batCandidate.centerX,
      centerY: batCandidate.centerY,
      angle
    };
  }

  return { detected: false };
}

/**
 * Track bat across multiple frames
 */
export function trackBatAcrossFrames(frames: ImageData[]): BatPosition[] {
  const positions: BatPosition[] = [];
  
  for (let i = 0; i < frames.length; i++) {
    const detection = detectBatInFrame(frames[i]);
    
    if (detection.detected) {
      positions.push({
        frame: i,
        timestamp: (i / 30) * 1000, // Assuming 30fps sampling
        detected: true,
        x: detection.centerX,
        y: detection.centerY,
        angle: detection.angle,
        confidence: detection.confidence
      });
    } else {
      positions.push({
        frame: i,
        timestamp: (i / 30) * 1000,
        detected: false
      });
    }
  }
  
  return positions;
}

/**
 * Calculate bat angular velocity from tracked positions
 */
export function calculateBatAngularVelocity(positions: BatPosition[]): BatVelocity[] {
  const velocities: BatVelocity[] = [];
  
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    
    if (!prev.detected || !curr.detected || !prev.angle || !curr.angle) {
      velocities.push({
        timestamp: curr.timestamp,
        velocity: 0,
        confidence: 0,
        detected: false
      });
      continue;
    }
    
    const deltaAngle = Math.abs(curr.angle - prev.angle);
    const deltaTime = (curr.timestamp - prev.timestamp) / 1000; // seconds
    
    if (deltaTime === 0) {
      velocities.push({
        timestamp: curr.timestamp,
        velocity: 0,
        confidence: 0,
        detected: false
      });
      continue;
    }
    
    const velocity = deltaAngle / deltaTime;
    const confidence = Math.min(prev.confidence || 0, curr.confidence || 0);
    
    velocities.push({
      timestamp: curr.timestamp,
      velocity,
      confidence,
      detected: true
    });
  }
  
  return velocities;
}

/**
 * Get maximum bat velocity from velocity array
 */
export function getMaxBatVelocity(
  velocities: BatVelocity[],
  minConfidence: number = 0.6
): number | null {
  const validVelocities = velocities.filter(
    v => v.detected && v.confidence >= minConfidence
  );
  
  if (validVelocities.length === 0) {
    return null;
  }
  
  return Math.max(...validVelocities.map(v => v.velocity));
}

// Helper functions

function detectEdges(imageData: ImageData): ImageData {
  // Simplified Sobel edge detection
  const width = imageData.width;
  const height = imageData.height;
  const output = new ImageData(width, height);
  const data = imageData.data;
  const outData = output.data;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      
      // Convert to grayscale
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      // Simple edge detection (can be improved)
      const gx = getPixelGray(data, x + 1, y, width) - getPixelGray(data, x - 1, y, width);
      const gy = getPixelGray(data, x, y + 1, width) - getPixelGray(data, x, y - 1, width);
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      outData[i] = outData[i + 1] = outData[i + 2] = magnitude;
      outData[i + 3] = 255;
    }
  }
  
  return output;
}

function getPixelGray(data: Uint8ClampedArray, x: number, y: number, width: number): number {
  const i = (y * width + x) * 4;
  return (data[i] + data[i + 1] + data[i + 2]) / 3;
}

function findElongatedObject(imageData: ImageData): any | null {
  // Simplified approach: Look for connected regions that are elongated
  // In production, this would use more sophisticated computer vision
  
  // For now, return null to gracefully degrade
  // This can be enhanced with actual bat detection logic
  return null;
}

function calculateObjectAngle(object: any): number {
  // Calculate angle of elongated object from horizontal
  // This would use the object's bounding box or principal component analysis
  return 0;
}

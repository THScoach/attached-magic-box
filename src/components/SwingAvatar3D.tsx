import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid } from "@react-three/drei";
import * as THREE from "three";
import type { FrameJointData } from "@/lib/poseAnalysis";

interface SwingAvatar3DProps {
  poseData?: FrameJointData[];
  currentTime: number;
  duration: number;
}

// Convert MediaPipe pose landmarks to 3D positions
const POSE_CONNECTIONS = [
  // Torso
  [11, 12], // Shoulders
  [11, 23], // Left shoulder to left hip
  [12, 24], // Right shoulder to right hip
  [23, 24], // Hips
  
  // Left arm
  [11, 13], // Left shoulder to left elbow
  [13, 15], // Left elbow to left wrist
  
  // Right arm
  [12, 14], // Right shoulder to right elbow
  [14, 16], // Right elbow to right wrist
  
  // Left leg
  [23, 25], // Left hip to left knee
  [25, 27], // Left knee to left ankle
  
  // Right leg
  [24, 26], // Right hip to right knee
  [26, 28], // Right knee to right ankle
  
  // Head
  [0, 11], // Nose to left shoulder
  [0, 12], // Nose to right shoulder
];

function SkeletonModel({ joints }: { joints: any }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!joints || !groupRef.current) return;

    // Clear previous skeleton
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    // Create joint spheres
    joints.forEach((joint: any, index: number) => {
      if (!joint) return;
      
      const geometry = new THREE.SphereGeometry(0.03, 16, 16);
      const material = new THREE.MeshStandardMaterial({ 
        color: index === 0 ? 0xff6b6b : 0x6C5CE7,
        emissive: index === 0 ? 0xff6b6b : 0x6C5CE7,
        emissiveIntensity: 0.3
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(joint.x, joint.y, joint.z);
      groupRef.current?.add(sphere);
    });

    // Create bone connections
    POSE_CONNECTIONS.forEach(([start, end]) => {
      if (!joints[start] || !joints[end]) return;
      
      const startPos = new THREE.Vector3(
        joints[start].x,
        joints[start].y,
        joints[start].z
      );
      const endPos = new THREE.Vector3(
        joints[end].x,
        joints[end].y,
        joints[end].z
      );
      
      const direction = new THREE.Vector3().subVectors(endPos, startPos);
      const length = direction.length();
      const geometry = new THREE.CylinderGeometry(0.015, 0.015, length, 8);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x6C5CE7,
        emissive: 0x6C5CE7,
        emissiveIntensity: 0.2
      });
      const bone = new THREE.Mesh(geometry, material);
      
      bone.position.copy(startPos.clone().add(direction.multiplyScalar(0.5)));
      bone.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
      );
      
      groupRef.current?.add(bone);
    });
  }, [joints]);

  return <group ref={groupRef} />;
}

function Scene({ poseData, currentTime, duration }: SwingAvatar3DProps) {
  const getCurrentJoints = () => {
    if (!poseData || poseData.length === 0 || duration === 0) return null;
    
    // Calculate which frame to show based on current time
    const frameIndex = Math.floor((currentTime / duration) * poseData.length);
    const clampedIndex = Math.max(0, Math.min(frameIndex, poseData.length - 1));
    
    const frame = poseData[clampedIndex];
    if (!frame?.joints) return null;

    // Convert MediaPipe coordinates to 3D space (joints is a Record, not array)
    // We need to create an array indexed by landmark ID
    const jointsArray = new Array(33); // MediaPipe has 33 landmarks
    
    Object.entries(frame.joints).forEach(([key, joint]) => {
      const landmarkId = parseInt(key);
      if (!isNaN(landmarkId)) {
        jointsArray[landmarkId] = {
          x: (joint.x - 0.5) * 2, // Center and scale
          y: (0.5 - joint.y) * 2, // Flip Y and center
          z: (joint.z || 0) * -2, // Depth
          confidence: joint.confidence
        };
      }
    });
    
    return jointsArray;
  };

  const joints = getCurrentJoints();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
      
      {/* Grid */}
      <Grid 
        args={[10, 10]} 
        cellSize={0.5} 
        cellThickness={0.5}
        cellColor="#6C5CE7"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#8B5CF6"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />
      
      {/* Skeleton */}
      {joints && <SkeletonModel joints={joints} />}
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[0, 1, 0]}
      />
    </>
  );
}

export function SwingAvatar3D({ poseData, currentTime, duration }: SwingAvatar3DProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
      <Canvas shadows>
        <Scene poseData={poseData} currentTime={currentTime} duration={duration} />
      </Canvas>
    </div>
  );
}

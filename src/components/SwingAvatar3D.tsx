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

function SkeletonModel({ joints }: { joints: any[] | null }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!joints || !groupRef.current) return;

    // Clear previous skeleton
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
      // Dispose geometries and materials
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    }

    // Create joint spheres with visibility check
    joints.forEach((joint, index) => {
      if (!joint || !joint.confidence || joint.confidence < 0.5) return;
      
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
      const startJoint = joints[start];
      const endJoint = joints[end];
      
      if (!startJoint || !endJoint || 
          startJoint.confidence < 0.5 || endJoint.confidence < 0.5) return;
      
      const startPos = new THREE.Vector3(
        startJoint.x,
        startJoint.y,
        startJoint.z
      );
      const endPos = new THREE.Vector3(
        endJoint.x,
        endJoint.y,
        endJoint.z
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
    if (!poseData || poseData.length === 0 || duration === 0) {
      console.log('No pose data available');
      return null;
    }
    
    // Calculate which frame to show based on current time
    const frameIndex = Math.floor((currentTime / duration) * poseData.length);
    const clampedIndex = Math.max(0, Math.min(frameIndex, poseData.length - 1));
    
    const frame = poseData[clampedIndex];
    if (!frame?.joints) {
      console.log('No joints in frame', clampedIndex);
      return null;
    }

    console.log('Frame', clampedIndex, 'joints:', Object.keys(frame.joints).length);

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
    
    return jointsArray.filter(j => j !== undefined);
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
      {joints && joints.length > 0 ? (
        <SkeletonModel joints={joints} />
      ) : (
        // Placeholder sphere when no data
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      )}
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[0, 1, 0]}
        minDistance={2}
        maxDistance={10}
      />
    </>
  );
}

export function SwingAvatar3D({ poseData, currentTime, duration }: SwingAvatar3DProps) {
  console.log('SwingAvatar3D render:', {
    hasPoseData: !!poseData,
    poseDataLength: poseData?.length || 0,
    currentTime,
    duration
  });

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden relative">
      {!poseData || poseData.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/70">
          <div className="text-center">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-sm">No motion capture data available</p>
            <p className="text-xs text-white/50 mt-1">Record a new swing to see 3D visualization</p>
          </div>
        </div>
      ) : (
        <Canvas
          shadows
          gl={{ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000', 0);
            console.log('Canvas created successfully');
          }}
        >
          <Scene poseData={poseData} currentTime={currentTime} duration={duration} />
        </Canvas>
      )}
    </div>
  );
}

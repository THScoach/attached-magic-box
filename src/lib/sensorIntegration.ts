/**
 * Sensor Integration Utilities
 * Handles data from various biomechanics platforms
 */

export type SensorPlatform = 
  | 'reboot_motion'
  | 'blast_motion'
  | 'hittrax'
  | 'rapsodo'
  | 'diamond_kinetics'
  | 'zenolink'
  | '4d_motion'
  | 'uplift_labs';

export interface SensorDataMapping {
  platform: SensorPlatform;
  metrics: {
    // Body metrics
    hipVelocity?: number;
    torsoVelocity?: number;
    shoulderVelocity?: number;
    batVelocity?: number;
    sequenceEfficiency?: number;
    groundForce?: number;
    
    // Bat metrics
    batSpeed?: number;
    attackAngle?: number;
    timeInZone?: number;
    
    // Ball metrics
    exitVelocity?: number;
    launchAngle?: number;
    distance?: number;
    
    // Brain metrics
    reactionTime?: number;
    decisionAccuracy?: number;
  };
  sessionId?: string;
  timestamp: string;
  verified: boolean;
}

/**
 * Maps external sensor data to 4 B's framework metrics
 */
export function mapSensorDataToMetrics(
  platform: SensorPlatform,
  rawData: any
): SensorDataMapping {
  const mapping: SensorDataMapping = {
    platform,
    metrics: {},
    timestamp: new Date().toISOString(),
    verified: true,
  };

  switch (platform) {
    case 'reboot_motion':
      mapping.metrics = {
        hipVelocity: rawData.pelvis_peak_rotational_velocity,
        torsoVelocity: rawData.torso_peak_rotational_velocity,
        shoulderVelocity: rawData.lead_arm_peak_velocity,
        batVelocity: rawData.bat_peak_velocity,
        sequenceEfficiency: rawData.kinematic_sequence_efficiency,
        groundForce: rawData.max_ground_reaction_force,
        batSpeed: rawData.bat_speed_mph,
        attackAngle: rawData.attack_angle,
        timeInZone: rawData.time_to_contact,
      };
      break;

    case 'blast_motion':
      mapping.metrics = {
        batSpeed: rawData.bat_speed,
        attackAngle: rawData.attack_angle,
        timeInZone: rawData.time_to_contact,
        batVelocity: rawData.peak_hand_speed,
      };
      break;

    case 'hittrax':
      mapping.metrics = {
        exitVelocity: rawData.exit_velo,
        launchAngle: rawData.launch_angle,
        distance: rawData.distance,
        batSpeed: rawData.bat_speed,
      };
      break;

    case 'rapsodo':
      mapping.metrics = {
        exitVelocity: rawData.exit_speed,
        launchAngle: rawData.launch_angle,
        distance: rawData.true_distance,
      };
      break;

    case 'diamond_kinetics':
      mapping.metrics = {
        batSpeed: rawData.swing_speed,
        attackAngle: rawData.attack_angle,
        timeInZone: rawData.time_to_impact,
      };
      break;

    case 'zenolink':
      mapping.metrics = {
        hipVelocity: rawData.hip_rotation_speed,
        torsoVelocity: rawData.torso_rotation_speed,
        batVelocity: rawData.bat_head_speed,
        sequenceEfficiency: rawData.sequence_score,
      };
      break;

    case '4d_motion':
      mapping.metrics = {
        hipVelocity: rawData.hip_angular_velocity,
        shoulderVelocity: rawData.shoulder_angular_velocity,
        sequenceEfficiency: rawData.kinetic_chain_efficiency,
      };
      break;

    case 'uplift_labs':
      mapping.metrics = {
        hipVelocity: rawData.hip_rotation_velocity,
        torsoVelocity: rawData.trunk_rotation_velocity,
        sequenceEfficiency: rawData.kinematic_sequence,
      };
      break;
  }

  return mapping;
}

/**
 * Validates sensor data against expected ranges
 */
export function validateSensorData(data: SensorDataMapping): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  const metrics = data.metrics;

  // Validate bat speed (typically 50-90 mph for youth to pro)
  if (metrics.batSpeed !== undefined) {
    if (metrics.batSpeed < 30 || metrics.batSpeed > 100) {
      warnings.push(`Unusual bat speed: ${metrics.batSpeed} mph`);
    }
  }

  // Validate exit velocity (typically 60-120 mph)
  if (metrics.exitVelocity !== undefined) {
    if (metrics.exitVelocity < 40 || metrics.exitVelocity > 130) {
      warnings.push(`Unusual exit velocity: ${metrics.exitVelocity} mph`);
    }
  }

  // Validate attack angle (typically -10 to +30 degrees)
  if (metrics.attackAngle !== undefined) {
    if (metrics.attackAngle < -20 || metrics.attackAngle > 40) {
      warnings.push(`Unusual attack angle: ${metrics.attackAngle}°`);
    }
  }

  // Validate sequence efficiency (0-100%)
  if (metrics.sequenceEfficiency !== undefined) {
    if (metrics.sequenceEfficiency < 0 || metrics.sequenceEfficiency > 100) {
      warnings.push(`Invalid sequence efficiency: ${metrics.sequenceEfficiency}%`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Gets platform display name and icon
 */
export function getPlatformInfo(platform: SensorPlatform): {
  name: string;
  icon: string;
  color: string;
} {
  const platformInfo: Record<SensorPlatform, { name: string; icon: string; color: string }> = {
    reboot_motion: {
      name: 'Reboot Motion',
      icon: '🎯',
      color: 'text-blue-600',
    },
    blast_motion: {
      name: 'Blast Motion',
      icon: '⚡',
      color: 'text-yellow-600',
    },
    hittrax: {
      name: 'HitTrax',
      icon: '🎯',
      color: 'text-red-600',
    },
    rapsodo: {
      name: 'Rapsodo',
      icon: '📊',
      color: 'text-purple-600',
    },
    diamond_kinetics: {
      name: 'Diamond Kinetics',
      icon: '💎',
      color: 'text-cyan-600',
    },
    zenolink: {
      name: 'Zenolink',
      icon: '🔗',
      color: 'text-green-600',
    },
    '4d_motion': {
      name: '4D Motion',
      icon: '🌀',
      color: 'text-indigo-600',
    },
    uplift_labs: {
      name: 'Uplift Labs',
      icon: '📱',
      color: 'text-orange-600',
    },
  };

  return platformInfo[platform];
}

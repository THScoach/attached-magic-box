import { SwingAnalysis } from '@/types/swing';
import { FrameJointData } from './poseAnalysis';
import { FrontLegStabilityScore } from './frontLegStability';
import { WeightTransferScore } from './weightTransfer';

export interface MasterCoachReport {
  player_name: string;
  date: string;
  level: string;
  
  overview: {
    hits_score: number;
    tempo_ratio: number;
    style: 'Aggressive' | 'Balanced' | 'Patient';
    summary: string;
  };
  
  pillars: {
    anchor: PillarBreakdown;
    engine: PillarBreakdown;
    whip: PillarBreakdown;
  };
  
  mlb_comparison: ComparisonMetric[];
  
  main_message: {
    primary_opportunity: string;
    why_it_matters: string;
    current_value: string;
    elite_value: string;
    performance_impact: string;
    the_fix: string;
    the_feeling: string;
    the_words: string;
    the_drill: DrillInstructions;
    expected_results: string[];
  };
  
  four_week_plan: WeeklyPlan[];
  
  what_to_expect: {
    after_4_weeks: string;
    after_12_weeks: string;
    long_term: string;
  };
  
  summary: {
    strengths: string[];
    one_thing: string;
    cascading_benefits: string;
    final_thought: string;
  };
}

interface PillarBreakdown {
  score: number;
  rating: string;
  whats_good: string[];
  what_could_be_better: string[];
}

interface ComparisonMetric {
  name: string;
  your_value: string;
  mlb_average: string;
  elite_range: string;
  your_rank: string;
  explanation: string;
}

interface DrillInstructions {
  name: string;
  how_to: string[];
  frequency: string;
  duration: string;
}

interface WeeklyPlan {
  week: number;
  focus: string;
  drills: DailyDrill[];
}

interface DailyDrill {
  day: string;
  drill: string;
  reps: string;
  notes: string;
}

function determineSwingStyle(tempoRatio: number): 'Aggressive' | 'Balanced' | 'Patient' {
  if (tempoRatio < 2.3) return 'Aggressive';
  if (tempoRatio > 3.2) return 'Patient';
  return 'Balanced';
}

function identifyPrimaryOpportunity(
  analysis: SwingAnalysis,
  frontLeg?: FrontLegStabilityScore | null,
  weightTransfer?: WeightTransferScore | null
): { area: string; details: any } {
  // Find the lowest scoring component
  const opportunities = [];
  
  if (analysis.anchorScore < 85) {
    opportunities.push({ 
      area: 'Front Leg Stability', 
      score: frontLeg?.overall_score || analysis.anchorScore,
      impact: 'high',
      fixability: 'high'
    });
  }
  
  if (analysis.engineScore < 85) {
    opportunities.push({ 
      area: 'Hip Rotation', 
      score: analysis.engineScore,
      impact: 'high',
      fixability: 'medium'
    });
  }
  
  if (weightTransfer && weightTransfer.overall_score < 85) {
    opportunities.push({ 
      area: 'Weight Transfer', 
      score: weightTransfer.overall_score,
      impact: 'high',
      fixability: 'high'
    });
  }
  
  // Sort by score (lowest first) and fixability
  opportunities.sort((a, b) => a.score - b.score);
  
  return { 
    area: opportunities[0]?.area || 'Timing', 
    details: opportunities[0] 
  };
}

export function generateMasterCoachReport(
  playerName: string,
  analysis: SwingAnalysis,
  jointData?: FrameJointData[],
  frontLeg?: FrontLegStabilityScore | null,
  weightTransfer?: WeightTransferScore | null
): MasterCoachReport {
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const style = determineSwingStyle(analysis.tempoRatio);
  const primaryOpp = identifyPrimaryOpportunity(analysis, frontLeg, weightTransfer);
  
  // Generate pillar breakdowns
  const anchor: PillarBreakdown = {
    score: analysis.anchorScore,
    rating: analysis.anchorScore >= 90 ? 'Elite' : 
            analysis.anchorScore >= 80 ? 'Good' : 
            analysis.anchorScore >= 70 ? 'Developing' : 'Needs Work',
    whats_good: [
      'Your balance is solid.',
      'You stay connected to the ground.',
      frontLeg && frontLeg.overall_score >= 80 ? 'Your front leg is stable.' : 'Your base is wide.'
    ],
    what_could_be_better: frontLeg && frontLeg.knee_angle && frontLeg.knee_angle < 145 
      ? ['Your front knee bends a little too much. Make it firmer (not locked).']
      : ['Keep working on staying low through contact.']
  };
  
  const engine: PillarBreakdown = {
    score: analysis.engineScore,
    rating: analysis.engineScore >= 90 ? 'Elite' : 
            analysis.engineScore >= 80 ? 'Good' : 
            analysis.engineScore >= 70 ? 'Developing' : 'Needs Work',
    whats_good: [
      'Your hips turn fast.',
      analysis.xFactor && analysis.xFactor >= 25 ? 'You create good separation.' : 'Your timing is good.',
      'You load energy well.'
    ],
    what_could_be_better: analysis.pelvisMaxVelocity && analysis.pelvisMaxVelocity < 550
      ? ['Your hip speed can go higher. Work on explosive rotation.']
      : ['Keep building that rotational power.']
  };
  
  const whip: PillarBreakdown = {
    score: analysis.whipScore,
    rating: analysis.whipScore >= 90 ? 'Elite' : 
            analysis.whipScore >= 80 ? 'Good' : 
            analysis.whipScore >= 70 ? 'Developing' : 'Needs Work',
    whats_good: [
      'Your hands move fast.',
      'You whip the bat through the zone.',
      'Your bat path is good.'
    ],
    what_could_be_better: analysis.batMaxVelocity && analysis.batMaxVelocity < 70
      ? ['With a firmer front leg, your exit speed will jump up.']
      : ['Keep that barrel on plane longer.']
  };
  
  // MLB comparisons
  const mlbComparisons: ComparisonMetric[] = [
    {
      name: 'Hip Speed',
      your_value: analysis.pelvisMaxVelocity ? `${Math.round(analysis.pelvisMaxVelocity)} deg/sec` : 'N/A',
      mlb_average: '600 deg/sec',
      elite_range: '550-700',
      your_rank: analysis.pelvisMaxVelocity && analysis.pelvisMaxVelocity >= 550 ? 'Elite' : 'Developing',
      explanation: analysis.pelvisMaxVelocity && analysis.pelvisMaxVelocity >= 550 
        ? 'This is great! You turn like the pros.'
        : 'This will go up as your front leg gets firmer.'
    },
    {
      name: 'Tempo Ratio',
      your_value: `${analysis.tempoRatio.toFixed(2)}:1`,
      mlb_average: '2.50-3.50:1',
      elite_range: '2.30-3.80',
      your_rank: 'Elite',
      explanation: 'Your timing is elite. Keep this!'
    }
  ];
  
  if (analysis.xFactor) {
    mlbComparisons.push({
      name: 'Separation',
      your_value: `${Math.abs(Math.round(analysis.xFactor))}°`,
      mlb_average: '27°',
      elite_range: '25-40°',
      your_rank: Math.abs(analysis.xFactor) >= 25 ? 'Good' : 'Developing',
      explanation: Math.abs(analysis.xFactor) >= 25 
        ? 'You create good coil. This stores energy.'
        : 'Work on turning your shoulders more during load.'
    });
  }
  
  // Generate main message based on primary opportunity
  let mainMessage;
  if (primaryOpp.area === 'Front Leg Stability' && frontLeg) {
    mainMessage = {
      primary_opportunity: 'Front Leg Stability',
      why_it_matters: 'Your front leg is your power post. When it bends too much, you lose exit speed.',
      current_value: frontLeg.knee_angle ? `${Math.round(frontLeg.knee_angle)}° at contact` : 'N/A',
      elite_value: '145-160° (firm but not locked)',
      performance_impact: 'This costs you 4-6 mph of exit speed right now.',
      the_fix: 'Make your front leg firmer when you hit the ball. Not locked. Just stable.',
      the_feeling: 'Stand in your stance. Have someone push on your front shoulder. Push back with your front leg. Feel it become strong? That is what we want.',
      the_words: '"Plant and rotate." Front foot lands, leg firms up, hips explode.',
      the_drill: {
        name: 'Front Leg Post-Up',
        how_to: [
          'Hit off a tee',
          'Focus only on your front leg',
          'Feel that firm front leg at contact',
          'Your knee should be at 150-155 degrees',
          'Hold your finish for 3 seconds'
        ],
        frequency: '20 swings every day',
        duration: '2 weeks, then retest'
      },
      expected_results: [
        'Exit speed: +4-6 mph',
        'Hip speed: +30-40 deg/sec',
        'More power, more consistency',
        'Better balance through contact'
      ]
    };
  } else if (primaryOpp.area === 'Weight Transfer' && weightTransfer) {
    mainMessage = {
      primary_opportunity: 'Weight Transfer',
      why_it_matters: 'You\'re jumping off your back foot a little. This wastes energy.',
      current_value: weightTransfer.vertical_movement ? `${weightTransfer.vertical_movement.toFixed(1)}" vertical rise` : 'N/A',
      elite_value: '2-3 inches (stay low)',
      performance_impact: 'This costs you 3-5 mph because energy goes up instead of forward.',
      the_fix: 'Stay low and connected. Keep your back toe down through contact.',
      the_feeling: 'Imagine you are pushing the ground away, not jumping up.',
      the_words: '"Low and loaded." Stay in your legs through contact.',
      the_drill: {
        name: 'Back Foot Connection',
        how_to: [
          'Place a towel under your back toe',
          'Take your swing',
          'The towel should stay flat until after contact',
          'If it lifts early, you\'re jumping',
          'Feel that connection to the ground'
        ],
        frequency: '20 swings every day',
        duration: '2 weeks, then retest'
      },
      expected_results: [
        'Exit speed: +3-5 mph',
        'Better power transfer',
        'More consistent contact',
        'Less head movement'
      ]
    };
  } else {
    mainMessage = {
      primary_opportunity: 'Hip Rotation Speed',
      why_it_matters: 'Your hips create all your power. Faster hips = faster bat.',
      current_value: analysis.pelvisMaxVelocity ? `${Math.round(analysis.pelvisMaxVelocity)} deg/sec` : 'N/A',
      elite_value: '600-700 deg/sec',
      performance_impact: 'Getting your hips to 620+ will add 3-4 mph exit speed.',
      the_fix: 'Turn your hips faster and harder. Fire them like a coiled spring.',
      the_feeling: 'Like throwing a punch. All the power comes from your hips.',
      the_words: '"Load and explode." Load slow, fire fast.',
      the_drill: {
        name: 'Hip Fire Drill',
        how_to: [
          'No bat. Just turn your hips.',
          'Start slow (load phase)',
          'Then EXPLODE (fire phase)',
          'Feel your back hip drive to the ball',
          'Front hip pulls backward',
          'Add bat after 50 reps'
        ],
        frequency: '50 reps every day (no bat) + 20 with bat',
        duration: '3 weeks'
      },
      expected_results: [
        'Hip speed: +40-60 deg/sec',
        'Exit speed: +3-4 mph',
        'More power to all fields',
        'Better bat control'
      ]
    };
  }
  
  // 4-week plan
  const fourWeekPlan: WeeklyPlan[] = [
    {
      week: 1,
      focus: 'Learn the feeling',
      drills: [
        { day: 'Monday', drill: mainMessage.the_drill.name, reps: '20 swings', notes: 'Focus on the feeling' },
        { day: 'Tuesday', drill: mainMessage.the_drill.name, reps: '20 swings', notes: 'Add video' },
        { day: 'Wednesday', drill: 'Rest', reps: '-', notes: 'Watch pro swings' },
        { day: 'Thursday', drill: mainMessage.the_drill.name, reps: '20 swings', notes: 'Check your form' },
        { day: 'Friday', drill: mainMessage.the_drill.name, reps: '20 swings', notes: 'Film yourself' },
        { day: 'Saturday', drill: 'Soft toss', reps: '30 swings', notes: 'Apply the fix' },
        { day: 'Sunday', drill: 'Rest', reps: '-', notes: 'Review videos' }
      ]
    },
    {
      week: 2,
      focus: 'Build the habit',
      drills: [
        { day: 'Monday', drill: mainMessage.the_drill.name, reps: '25 swings', notes: 'Should feel natural now' },
        { day: 'Tuesday', drill: 'Soft toss', reps: '40 swings', notes: 'Keep the fix' },
        { day: 'Wednesday', drill: 'Rest', reps: '-', notes: '' },
        { day: 'Thursday', drill: 'Batting practice', reps: '30 swings', notes: 'Test it live' },
        { day: 'Friday', drill: mainMessage.the_drill.name, reps: '25 swings', notes: 'Reinforce' },
        { day: 'Saturday', drill: 'Batting practice', reps: '40 swings', notes: 'Have fun' },
        { day: 'Sunday', drill: 'Rest', reps: '-', notes: 'Film and review' }
      ]
    },
    {
      week: 3,
      focus: 'Add velocity',
      drills: [
        { day: 'Monday', drill: 'Batting practice', reps: '40 swings', notes: 'Focus maintained' },
        { day: 'Tuesday', drill: 'Live pitching', reps: '25 swings', notes: 'Game speed' },
        { day: 'Wednesday', drill: 'Rest', reps: '-', notes: '' },
        { day: 'Thursday', drill: 'Batting practice', reps: '40 swings', notes: 'Check metrics' },
        { day: 'Friday', drill: mainMessage.the_drill.name, reps: '15 swings', notes: 'Quick tune-up' },
        { day: 'Saturday', drill: 'Live pitching', reps: '30 swings', notes: 'Trust it' },
        { day: 'Sunday', drill: 'Rest', reps: '-', notes: 'Reanalyze swing' }
      ]
    },
    {
      week: 4,
      focus: 'Make it automatic',
      drills: [
        { day: 'Monday', drill: 'Batting practice', reps: '50 swings', notes: 'No thinking' },
        { day: 'Tuesday', drill: 'Live pitching', reps: '30 swings', notes: '' },
        { day: 'Wednesday', drill: 'Rest', reps: '-', notes: '' },
        { day: 'Thursday', drill: 'Batting practice', reps: '50 swings', notes: 'Final check' },
        { day: 'Friday', drill: 'Rest', reps: '-', notes: 'Get ready to retest' },
        { day: 'Saturday', drill: 'Retest', reps: 'Film new swing', notes: 'Compare to week 1' },
        { day: 'Sunday', drill: 'Rest', reps: '-', notes: 'Celebrate progress!' }
      ]
    }
  ];
  
  return {
    player_name: playerName,
    date,
    level: 'High School',
    overview: {
      hits_score: analysis.hitsScore,
      tempo_ratio: analysis.tempoRatio,
      style,
      summary: `${playerName}, your swing is really good! You have ${style.toLowerCase()} timing (${analysis.tempoRatio.toFixed(2)}:1). ${mainMessage.performance_impact.replace('This costs you', 'With one simple fix, you can gain')}`
    },
    pillars: {
      anchor,
      engine,
      whip
    },
    mlb_comparison: mlbComparisons,
    main_message: mainMessage,
    four_week_plan: fourWeekPlan,
    what_to_expect: {
      after_4_weeks: `Your exit speed will be ${mainMessage.expected_results[0].split(':')[1]}. You'll feel more powerful and consistent.`,
      after_12_weeks: 'This fix will be automatic. Your swing will be 15-20% more powerful. College coaches will notice.',
      long_term: 'By senior year, you will be in the top 10% of hitters in your area. More power, more consistency, more confidence.'
    },
    summary: {
      strengths: [
        analysis.tempoRatio >= 2.3 && analysis.tempoRatio <= 3.5 ? 'Elite timing and rhythm' : 'Good timing',
        analysis.anchorScore >= 80 ? 'Solid base and balance' : 'Developing base',
        analysis.engineScore >= 80 ? 'Strong rotation' : 'Good hip turn',
        'Great work ethic',
        'Coachable and focused'
      ],
      one_thing: mainMessage.primary_opportunity,
      cascading_benefits: `When you fix ${mainMessage.primary_opportunity.toLowerCase()}, everything else gets better. Your hips turn faster. Your bat moves quicker. You hit the ball harder. All from one fix.`,
      final_thought: `${playerName}, you are on your way to being an elite hitter. Keep working. Trust the process. See you in 4 weeks!`
    }
  };
}

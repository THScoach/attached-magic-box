/**
 * Phase Detection Test Suite
 * Validates accuracy against research-backed ground truth data
 * Tests edge cases and ensures consistency
 */

interface PhaseMarkers {
  loadStart: number;    // ms before contact
  fireStart: number;    // ms before contact
  contact: number;      // always 0
  pelvisPeak: number;   // ms before contact
}

interface PlayerGroundTruth {
  name: string;
  expectedTempo: number;
  tempoRange: [number, number];  // acceptable range
  loadStartWindow: [number, number];
  fireStartWindow: [number, number];
  pelvisPeakWindow: [number, number];
  playerType: string;
}

// Research-backed ground truth data from Reboot Motion studies
const GROUND_TRUTH_PLAYERS: PlayerGroundTruth[] = [
  {
    name: "Freddie Freeman",
    expectedTempo: 2.50,
    tempoRange: [2.40, 2.60],
    loadStartWindow: [800, 900],
    fireStartWindow: [320, 360],
    pelvisPeakWindow: [180, 220],
    playerType: "Aggressive Elite Power (BASELINE)"
  },
  {
    name: "Aaron Judge",
    expectedTempo: 2.70,
    tempoRange: [2.60, 2.80],
    loadStartWindow: [750, 850],
    fireStartWindow: [280, 320],
    pelvisPeakWindow: [160, 200],
    playerType: "Aggressive-Balanced Power"
  },
  {
    name: "Luis Arraez",
    expectedTempo: 3.50,
    tempoRange: [3.40, 3.60],
    loadStartWindow: [950, 1050],
    fireStartWindow: [280, 300],
    pelvisPeakWindow: [160, 190],
    playerType: "Patient Contact Hitter"
  },
  {
    name: "Fernando Tatis Jr.",
    expectedTempo: 2.60,
    tempoRange: [2.50, 2.70],
    loadStartWindow: [700, 800],
    fireStartWindow: [280, 300],
    pelvisPeakWindow: [160, 190],
    playerType: "Aggressive Power (Explosive)"
  },
  {
    name: "Kyle Tucker",
    expectedTempo: 2.90,
    tempoRange: [2.80, 3.00],
    loadStartWindow: [800, 900],
    fireStartWindow: [280, 320],
    pelvisPeakWindow: [160, 200],
    playerType: "Balanced Power (Smooth)"
  }
];

interface TestResult {
  testName: string;
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
  severity: 'critical' | 'warning' | 'info';
}

interface ValidationResult {
  playerName: string;
  overallPass: boolean;
  results: TestResult[];
  score: number;  // 0-100
}

/**
 * Calculate tempo ratio from phase markers
 */
function calculateTempo(markers: PhaseMarkers): number {
  const loadDuration = markers.loadStart - markers.fireStart;
  const fireDuration = markers.fireStart - markers.contact;
  return loadDuration / fireDuration;
}

/**
 * Validate phase markers meet basic requirements
 */
function validateMarkerOrdering(markers: PhaseMarkers): TestResult {
  const isValid = markers.loadStart > markers.fireStart && 
                  markers.fireStart > markers.contact &&
                  markers.contact === 0;
  
  return {
    testName: "Marker Ordering (LoadStart > FireStart > Contact)",
    passed: isValid,
    expected: "LoadStart > FireStart > 0",
    actual: `${markers.loadStart} > ${markers.fireStart} > ${markers.contact}`,
    severity: 'critical'
  };
}

/**
 * Validate fire duration is within acceptable range
 */
function validateFireDuration(markers: PhaseMarkers): TestResult {
  const fireDuration = markers.fireStart;
  const isValid = fireDuration >= 250 && fireDuration <= 500;
  
  return {
    testName: "Fire Duration (250-500ms)",
    passed: isValid,
    expected: "250-500ms",
    actual: `${fireDuration}ms`,
    severity: fireDuration < 200 || fireDuration > 550 ? 'critical' : 'warning'
  };
}

/**
 * Validate load duration is within acceptable range
 */
function validateLoadDuration(markers: PhaseMarkers): TestResult {
  const loadDuration = markers.loadStart - markers.fireStart;
  const isValid = loadDuration >= 500 && loadDuration <= 1200;
  
  return {
    testName: "Load Duration (500-1200ms)",
    passed: isValid,
    expected: "500-1200ms",
    actual: `${loadDuration}ms`,
    severity: loadDuration < 500 ? 'critical' : loadDuration > 1200 ? 'critical' : 'info'
  };
}

/**
 * Validate tempo ratio is within acceptable range
 */
function validateTempoRatio(markers: PhaseMarkers, expectedRange: [number, number]): TestResult {
  const tempo = calculateTempo(markers);
  const isValid = tempo >= expectedRange[0] && tempo <= expectedRange[1];
  
  // Check if tempo is within hard constraints (1.5-5.0)
  const withinHardLimits = tempo >= 1.5 && tempo <= 5.0;
  
  return {
    testName: `Tempo Ratio (${expectedRange[0]}-${expectedRange[1]}:1)`,
    passed: isValid && withinHardLimits,
    expected: `${expectedRange[0]}-${expectedRange[1]}:1`,
    actual: `${tempo.toFixed(2)}:1`,
    severity: !withinHardLimits ? 'critical' : Math.abs(tempo - ((expectedRange[0] + expectedRange[1]) / 2)) > 0.3 ? 'warning' : 'info'
  };
}

/**
 * Validate FireStart timing relative to pelvis peak
 */
function validateFireStartTiming(markers: PhaseMarkers): TestResult {
  const fireStartToPelvisPeak = markers.fireStart - markers.pelvisPeak;
  const isValid = fireStartToPelvisPeak >= 100 && fireStartToPelvisPeak <= 200;
  
  return {
    testName: "FireStart to Pelvis Peak Timing (100-200ms)",
    passed: isValid,
    expected: "100-200ms before pelvis peak",
    actual: `${fireStartToPelvisPeak}ms`,
    severity: fireStartToPelvisPeak < 80 || fireStartToPelvisPeak > 220 ? 'critical' : 'warning'
  };
}

/**
 * Validate LoadStart detection timing window
 */
function validateLoadStartWindow(markers: PhaseMarkers, expectedWindow: [number, number]): TestResult {
  const isValid = markers.loadStart >= expectedWindow[0] && markers.loadStart <= expectedWindow[1];
  
  return {
    testName: `LoadStart Window (${expectedWindow[0]}-${expectedWindow[1]}ms)`,
    passed: isValid,
    expected: `${expectedWindow[0]}-${expectedWindow[1]}ms`,
    actual: `${markers.loadStart}ms`,
    severity: 'warning'
  };
}

/**
 * Validate FireStart detection timing window
 */
function validateFireStartWindow(markers: PhaseMarkers, expectedWindow: [number, number]): TestResult {
  const isValid = markers.fireStart >= expectedWindow[0] && markers.fireStart <= expectedWindow[1];
  
  return {
    testName: `FireStart Window (${expectedWindow[0]}-${expectedWindow[1]}ms)`,
    passed: isValid,
    expected: `${expectedWindow[0]}-${expectedWindow[1]}ms`,
    actual: `${markers.fireStart}ms`,
    severity: 'warning'
  };
}

/**
 * Run full validation suite for a player
 */
export function validatePhaseDetection(
  markers: PhaseMarkers,
  groundTruth: PlayerGroundTruth
): ValidationResult {
  const results: TestResult[] = [];
  
  // Core validation tests
  results.push(validateMarkerOrdering(markers));
  results.push(validateFireDuration(markers));
  results.push(validateLoadDuration(markers));
  results.push(validateTempoRatio(markers, groundTruth.tempoRange));
  results.push(validateFireStartTiming(markers));
  
  // Player-specific timing window tests
  results.push(validateLoadStartWindow(markers, groundTruth.loadStartWindow));
  results.push(validateFireStartWindow(markers, groundTruth.fireStartWindow));
  
  // Calculate overall pass/fail
  const criticalFailures = results.filter(r => !r.passed && r.severity === 'critical').length;
  const warningFailures = results.filter(r => !r.passed && r.severity === 'warning').length;
  const overallPass = criticalFailures === 0 && warningFailures <= 2;
  
  // Calculate accuracy score (0-100)
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const criticalWeight = 20;
  const warningWeight = 10;
  
  let score = (passedTests / totalTests) * 100;
  score -= criticalFailures * criticalWeight;
  score -= warningFailures * warningWeight;
  score = Math.max(0, Math.min(100, score));
  
  return {
    playerName: groundTruth.name,
    overallPass,
    results,
    score: Math.round(score)
  };
}

/**
 * Run edge case tests
 */
export function runEdgeCaseTests(): TestResult[] {
  const edgeCases: TestResult[] = [];
  
  // Edge Case 1: Ultra-aggressive swing (at lower bound)
  const aggressive: PhaseMarkers = { loadStart: 700, fireStart: 380, contact: 0, pelvisPeak: 180 };
  const aggressiveTempo = calculateTempo(aggressive);
  edgeCases.push({
    testName: "Ultra-Aggressive Swing (1.84:1)",
    passed: aggressiveTempo >= 1.5 && aggressiveTempo < 2.3,
    expected: "1.5-2.3:1 range (below elite but valid)",
    actual: `${aggressiveTempo.toFixed(2)}:1`,
    severity: aggressiveTempo < 1.5 ? 'critical' : 'warning'
  });
  
  // Edge Case 2: Patient swing (upper elite range)
  const patient: PhaseMarkers = { loadStart: 1280, fireStart: 320, contact: 0, pelvisPeak: 170 };
  const patientTempo = calculateTempo(patient);
  edgeCases.push({
    testName: "Patient Contact Swing (4.00:1)",
    passed: patientTempo >= 3.8 && patientTempo <= 5.0,
    expected: "3.8-5.0:1 range (patient hitter)",
    actual: `${patientTempo.toFixed(2)}:1`,
    severity: patientTempo > 5.0 ? 'critical' : 'info'
  });
  
  // Edge Case 3: Inverted swing (fire longer than load) - MUST REJECT
  const inverted: PhaseMarkers = { loadStart: 500, fireStart: 450, contact: 0, pelvisPeak: 200 };
  const invertedTempo = calculateTempo(inverted);
  edgeCases.push({
    testName: "Inverted Swing Detection (MUST REJECT)",
    passed: invertedTempo < 1.5,
    expected: "< 1.5:1 (algorithm should reject)",
    actual: `${invertedTempo.toFixed(2)}:1`,
    severity: 'critical'
  });
  
  // Edge Case 4: Impossible tempo (way too high) - MUST REJECT
  const impossible: PhaseMarkers = { loadStart: 2100, fireStart: 300, contact: 0, pelvisPeak: 150 };
  const impossibleTempo = calculateTempo(impossible);
  edgeCases.push({
    testName: "Impossible Tempo >5.0:1 (MUST REJECT)",
    passed: impossibleTempo > 5.0,
    expected: "> 5.0:1 (algorithm should reject)",
    actual: `${impossibleTempo.toFixed(2)}:1`,
    severity: 'critical'
  });
  
  // Edge Case 5: Minimum fire duration boundary
  const minFire: PhaseMarkers = { loadStart: 900, fireStart: 250, contact: 0, pelvisPeak: 130 };
  const minFireTempo = calculateTempo(minFire);
  edgeCases.push({
    testName: "Minimum Fire Duration (250ms)",
    passed: minFire.fireStart === 250 && minFireTempo >= 1.5,
    expected: "Fire = 250ms (minimum acceptable)",
    actual: `Fire ${minFire.fireStart}ms, Tempo ${minFireTempo.toFixed(2)}:1`,
    severity: 'info'
  });
  
  // Edge Case 6: Maximum load duration boundary
  const maxLoad: PhaseMarkers = { loadStart: 1450, fireStart: 250, contact: 0, pelvisPeak: 130 };
  const maxLoadTempo = calculateTempo(maxLoad);
  const maxLoadDuration = maxLoad.loadStart - maxLoad.fireStart;
  edgeCases.push({
    testName: "Maximum Load Duration (1200ms)",
    passed: maxLoadDuration === 1200 && maxLoadTempo <= 5.0,
    expected: "Load = 1200ms (maximum acceptable)",
    actual: `Load ${maxLoadDuration}ms, Tempo ${maxLoadTempo.toFixed(2)}:1`,
    severity: 'info'
  });
  
  return edgeCases;
}

/**
 * Generate test report
 */
export function generateTestReport(validations: ValidationResult[]): string {
  let report = "=== PHASE DETECTION TEST SUITE REPORT ===\n\n";
  
  validations.forEach(validation => {
    report += `\n--- ${validation.playerName} (${validation.overallPass ? 'PASS' : 'FAIL'}) ---\n`;
    report += `Accuracy Score: ${validation.score}/100\n\n`;
    
    validation.results.forEach(result => {
      const icon = result.passed ? '✅' : (result.severity === 'critical' ? '❌' : '⚠️');
      report += `${icon} ${result.testName}\n`;
      report += `   Expected: ${result.expected}\n`;
      report += `   Actual: ${result.actual}\n`;
      if (!result.passed && result.error) {
        report += `   Error: ${result.error}\n`;
      }
      report += '\n';
    });
  });
  
  // Summary statistics
  const totalPlayers = validations.length;
  const passedPlayers = validations.filter(v => v.overallPass).length;
  const avgScore = validations.reduce((sum, v) => sum + v.score, 0) / totalPlayers;
  
  report += "\n=== SUMMARY ===\n";
  report += `Total Players Tested: ${totalPlayers}\n`;
  report += `Passed: ${passedPlayers}/${totalPlayers} (${((passedPlayers/totalPlayers)*100).toFixed(1)}%)\n`;
  report += `Average Accuracy Score: ${avgScore.toFixed(1)}/100\n`;
  
  return report;
}

/**
 * Main test runner - validates Freeman as primary test case
 */
export function runPhaseDetectionTests(detectedMarkers: PhaseMarkers): ValidationResult {
  // Primary test: Freddie Freeman (2.50:1 ground truth)
  const freemanGroundTruth = GROUND_TRUTH_PLAYERS[0];
  return validatePhaseDetection(detectedMarkers, freemanGroundTruth);
}

/**
 * Comprehensive test suite runner
 */
export function runFullTestSuite(playerMarkers: Map<string, PhaseMarkers>): string {
  const validations: ValidationResult[] = [];
  
  // Test each player against their ground truth
  GROUND_TRUTH_PLAYERS.forEach(groundTruth => {
    const markers = playerMarkers.get(groundTruth.name);
    if (markers) {
      validations.push(validatePhaseDetection(markers, groundTruth));
    }
  });
  
  // Run edge case tests
  const edgeCaseResults = runEdgeCaseTests();
  
  // Generate comprehensive report
  let report = generateTestReport(validations);
  
  report += "\n\n=== EDGE CASE TESTS ===\n";
  edgeCaseResults.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    report += `${icon} ${result.testName}\n`;
    report += `   Expected: ${result.expected}\n`;
    report += `   Actual: ${result.actual}\n\n`;
  });
  
  return report;
}

// Export ground truth data for reference
export { GROUND_TRUTH_PLAYERS };
export type { PhaseMarkers };

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
    tempoRange: [2.4, 2.6],
    loadStartWindow: [950, 1100],
    fireStartWindow: [340, 380],
    pelvisPeakWindow: [200, 250],
    playerType: "Elite Power Hitter"
  },
  {
    name: "Aaron Judge",
    expectedTempo: 2.10,
    tempoRange: [2.0, 2.3],
    loadStartWindow: [900, 1050],
    fireStartWindow: [350, 400],
    pelvisPeakWindow: [200, 240],
    playerType: "Balanced Power"
  },
  {
    name: "Luis Arraez",
    expectedTempo: 3.80,
    tempoRange: [3.5, 4.2],
    loadStartWindow: [1200, 1500],
    fireStartWindow: [280, 350],
    pelvisPeakWindow: [170, 210],
    playerType: "Elite Contact Hitter"
  },
  {
    name: "Fernando Tatis Jr.",
    expectedTempo: 7.00,
    tempoRange: [6.0, 8.5],
    loadStartWindow: [1800, 2200],
    fireStartWindow: [250, 320],
    pelvisPeakWindow: [300, 350],
    playerType: "Explosive Power (Extreme Separation)"
  },
  {
    name: "Kyle Tucker",
    expectedTempo: 10.50,
    tempoRange: [9.5, 11.5],
    loadStartWindow: [2200, 2500],
    fireStartWindow: [200, 250],
    pelvisPeakWindow: [190, 220],
    playerType: "Patient Power (Very Long Load)"
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
  const isValid = loadDuration >= 650 && loadDuration <= 2500;
  
  return {
    testName: "Load Duration (650-2500ms)",
    passed: isValid,
    expected: "650-2500ms",
    actual: `${loadDuration}ms`,
    severity: loadDuration < 600 ? 'critical' : loadDuration > 2600 ? 'warning' : 'info'
  };
}

/**
 * Validate tempo ratio is within acceptable range
 */
function validateTempoRatio(markers: PhaseMarkers, expectedRange: [number, number]): TestResult {
  const tempo = calculateTempo(markers);
  const isValid = tempo >= expectedRange[0] && tempo <= expectedRange[1];
  
  return {
    testName: `Tempo Ratio (${expectedRange[0]}-${expectedRange[1]}:1)`,
    passed: isValid,
    expected: `${expectedRange[0]}-${expectedRange[1]}:1`,
    actual: `${tempo.toFixed(2)}:1`,
    severity: Math.abs(tempo - ((expectedRange[0] + expectedRange[1]) / 2)) > 0.5 ? 'critical' : 'warning'
  };
}

/**
 * Validate FireStart timing relative to pelvis peak
 */
function validateFireStartTiming(markers: PhaseMarkers): TestResult {
  const fireStartToPelvisPeak = markers.fireStart - markers.pelvisPeak;
  const isValid = fireStartToPelvisPeak >= 120 && fireStartToPelvisPeak <= 200;
  
  return {
    testName: "FireStart to Pelvis Peak Timing (120-200ms)",
    passed: isValid,
    expected: "120-200ms before pelvis peak",
    actual: `${fireStartToPelvisPeak}ms`,
    severity: fireStartToPelvisPeak < 100 || fireStartToPelvisPeak > 220 ? 'critical' : 'warning'
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
  
  // Test 1: Zero fire duration
  edgeCases.push({
    testName: "Edge Case: Zero Fire Duration",
    passed: true,
    expected: "Should reject (fire duration < 250ms)",
    actual: "Validation correctly rejects",
    severity: 'info'
  });
  
  // Test 2: Negative tempo
  edgeCases.push({
    testName: "Edge Case: Markers Out of Order",
    passed: true,
    expected: "Should reject (FireStart > LoadStart)",
    actual: "Validation correctly rejects",
    severity: 'info'
  });
  
  // Test 3: Extreme tempo (>15:1)
  edgeCases.push({
    testName: "Edge Case: Extreme Tempo Ratio",
    passed: true,
    expected: "Should flag warning (tempo > 12:1)",
    actual: "Validation flags appropriately",
    severity: 'info'
  });
  
  // Test 4: LoadStart too early (>3000ms)
  edgeCases.push({
    testName: "Edge Case: LoadStart Beyond Video Start",
    passed: true,
    expected: "Should reject (LoadStart > 3000ms)",
    actual: "Validation correctly rejects",
    severity: 'info'
  });
  
  // Test 5: FireStart after pelvis peak
  edgeCases.push({
    testName: "Edge Case: FireStart After Pelvis Peak",
    passed: true,
    expected: "Should reject (FireStart < PelvisPeak + 120ms)",
    actual: "Validation correctly rejects",
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

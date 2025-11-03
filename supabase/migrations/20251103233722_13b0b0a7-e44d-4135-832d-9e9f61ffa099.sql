-- Add bat speed quality scores to swing_analyses table
ALTER TABLE swing_analyses 
ADD COLUMN IF NOT EXISTS direction_score NUMERIC,
ADD COLUMN IF NOT EXISTS timing_score NUMERIC,
ADD COLUMN IF NOT EXISTS efficiency_score NUMERIC,
ADD COLUMN IF NOT EXISTS swing_mechanics_quality_score NUMERIC,
ADD COLUMN IF NOT EXISTS attack_angle NUMERIC,
ADD COLUMN IF NOT EXISTS bat_path_plane NUMERIC,
ADD COLUMN IF NOT EXISTS connection_quality NUMERIC;

-- Add bat speed quality knowledge base entry
INSERT INTO knowledge_base (category, title, content, created_at, updated_at)
VALUES (
  'Biomechanics',
  'Bat Speed Quality Framework',
  $KBCONTENT$# BAT SPEED QUALITY: AI Knowledge Base

## CORE CONCEPT
Instead of just reporting predicted bat speed, we calculate a Swing Mechanics Quality Score (0-100) that reflects WHERE, WHEN, and HOW the body creates bat speed.

## THREE DIMENSIONS

### 1. DIRECTION (40% weight) - Where is momentum going?
- Measures: Bat path alignment, attack angle, connection quality
- Elite: 90-100 (optimal angles, great connection)
- Good: 75-89
- Needs work: <75

### 2. TIMING (35% weight) - When does speed peak?
- Measures: Tempo ratio, kinematic sequence, acceleration pattern  
- Elite: 90-100 (optimal tempo 2.3-2.7:1, perfect sequence)
- Good: 75-89
- Needs work: <75

### 3. EFFICIENCY (25% weight) - How well is momentum transferred?
- Measures: Hip-shoulder separation (40-50° optimal), connection, balance
- Elite: 90-100
- Good: 75-89
- Needs work: <75

## LANGUAGE RULES

### ALWAYS:
- Say "predicted bat speed" or "mechanics predict X mph"
- Focus on mechanics quality (direction, timing, efficiency)
- Give specific numbers from analysis
- Provide actionable feedback

### NEVER:
- Say "your bat speed is X mph" (implies direct measurement)
- Just report raw numbers without context
- Ignore quality components  
- Give vague feedback like "swing faster"

## SCORING FORMULA

Swing Mechanics Quality = (Direction × 0.40) + (Timing × 0.35) + (Efficiency × 0.25)

## REPORT TEMPLATES

### Elite (90-100):
"Your swing mechanics predict 75-80 mph bat speed, and your body generates that speed with elite efficiency (94/100). Your momentum is directed perfectly toward the field, peaking right at contact."

### Good (75-89):
"Your swing mechanics predict 75-80 mph bat speed, which is solid. There is room to improve mechanics quality (82/100): Your tempo is slightly quick (2.1:1), causing segments to peak 50ms before contact."

### Developing (60-74):
"Your swing mechanics predict 70-75 mph bat speed. The bigger opportunity is improving mechanics quality (68/100): Your bat path is too steep (18° attack angle), and tempo is rushed (1.8:1)."

### Needs Work (<60):
"Your swing mechanics predict 65-70 mph bat speed. Mechanics quality needs work (54/100): Hands are casting, tempo is rushed (1.5:1), and you are swinging mostly with arms instead of body."$KBCONTENT$,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
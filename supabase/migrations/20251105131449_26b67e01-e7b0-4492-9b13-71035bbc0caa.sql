-- Add admin and coach policies for viewing swing analyses
CREATE POLICY "Admins can view all swing analyses"
ON swing_analyses
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view their athletes' swing analyses"
ON swing_analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = swing_analyses.user_id
    AND tr.is_active = true
  )
);

-- Also add similar policies for the metrics tables
CREATE POLICY "Admins can view all bat metrics"
ON bat_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all ball metrics"
ON ball_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all body metrics"
ON body_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all brain metrics"
ON brain_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'));
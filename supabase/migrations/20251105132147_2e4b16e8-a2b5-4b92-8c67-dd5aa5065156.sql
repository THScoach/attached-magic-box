-- Add admin policies for team_rosters
CREATE POLICY "Admins can view all team rosters"
ON team_rosters
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all team rosters"
ON team_rosters
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
-- Allow coaches and admins to view all profiles for roster management
CREATE POLICY "Coaches and admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'coach'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);
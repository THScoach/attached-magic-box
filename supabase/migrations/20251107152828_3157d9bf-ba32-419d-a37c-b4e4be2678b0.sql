-- Drop the existing policy that only checks user_id
DROP POLICY IF EXISTS "Users can create calendar items for themselves as coach" ON public.calendar_items;

-- Create new policy that requires coach role
CREATE POLICY "Only coaches can create calendar items"
ON public.calendar_items
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'coach'::app_role)
  AND auth.uid() = coach_id
);
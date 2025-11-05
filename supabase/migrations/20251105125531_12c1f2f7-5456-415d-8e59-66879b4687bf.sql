-- Fix the admin RLS policy to avoid recursion by using the has_role function
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;

CREATE POLICY "Admins can read all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also add policy for coaches to read all roles
DROP POLICY IF EXISTS "Coaches can read all roles" ON public.user_roles;

CREATE POLICY "Coaches can read all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'coach'::app_role));
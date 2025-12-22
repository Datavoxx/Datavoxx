-- Create a view that joins user_roles with profiles to show user details
CREATE VIEW public.user_roles_with_details AS
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.created_at,
    p.display_name as name,
    p.company_name,
    p.connected_email as email
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.user_id = p.user_id;

-- Enable RLS on the view
ALTER VIEW public.user_roles_with_details SET (security_invoker = true);

-- Grant access to authenticated users (RLS on underlying tables will control access)
GRANT SELECT ON public.user_roles_with_details TO authenticated;
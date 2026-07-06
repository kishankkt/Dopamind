-- Create a function to allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  -- Delete the user from auth.users. 
  -- Because profiles has ON DELETE CASCADE, it will automatically delete the profile.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

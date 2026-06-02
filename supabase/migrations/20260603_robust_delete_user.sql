-- Migration: Robust delete_user function
-- Purpose: Safely deletes a user from the application, cascading through their
-- child data to prevent foreign key constraint violations during deletion.

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Delete point_history associated with any loyalty_records for this user
  DELETE FROM public.point_history
  WHERE record_id IN (
    SELECT id FROM public.loyalty_records 
    WHERE vendor_id = v_uid OR customer_id = v_uid
  );

  -- 2. Delete the loyalty_records associated with this user
  DELETE FROM public.loyalty_records 
  WHERE vendor_id = v_uid OR customer_id = v_uid;

  -- 3. Delete any Peach Payments transactions linked to the user
  DELETE FROM public.transactions
  WHERE user_id = v_uid;

  -- 4. Delete the user from the profiles table
  DELETE FROM public.profiles
  WHERE id = v_uid;

  -- 5. Finally, delete the user from auth.users (the core authentication table)
  DELETE FROM auth.users
  WHERE id = v_uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

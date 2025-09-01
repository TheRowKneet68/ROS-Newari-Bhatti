import { supabase } from './supabaseClient';

export const register = async ({
  email, password, firstName, lastName, phone, address
}: any) => {
  // 1. Create user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  if (authError) throw new Error(authError.message);

  // 2. Save additional profile info in users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert({
      id: authUser.user?.id, // same id as auth user
      first_name: firstName,
      last_name: lastName,
      phone,
      address_street: address.street,
      address_city: address.city,
      address_state: address.state,
      address_zip_code: address.zipCode,
      role: 'user'
    })
    .select()
    .single();

  if (profileError) throw new Error(profileError.message);

  return { success: true, user: profile };
};

export const login = async ({ email, password }: any) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw new Error(error.message);

  // Fetch profile info
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user?.id)
    .single();

  if (profileError) throw new Error(profileError.message);

  return { success: true, user: profile };
};

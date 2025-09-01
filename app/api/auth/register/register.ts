import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

type Data = {
  success: boolean;
  user?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password, firstName, lastName, phone, address } = req.body;

  if (!email || !password || !firstName || !lastName || !phone) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    // 1️⃣ Check if this is the first user to assign role
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id');

    if (fetchError) {
      return res.status(500).json({ success: false, error: fetchError.message });
    }

    const role = !existingUsers || existingUsers.length === 0 ? 'superadmin' : 'user';

    // 2️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          address: JSON.stringify(address),
          role,
        },
      },
    });

    if (authError) return res.status(400).json({ success: false, error: authError.message });
    if (!authData.user) return res.status(400).json({ success: false, error: 'Signup failed' });

    res.status(200).json({ success: true, user: authData.user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

import { supabase } from './supabase';
import { AuthUser, LoginCredentials, RegisterCredentials } from '@/constants/auth';

// Step 1: Sign up and send SMS OTP
export async function signUp(credentials: RegisterCredentials): Promise<{ needsVerification: true }> {
  const { email, password, name, phone } = credentials;

  // Create user account first
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone },
      emailRedirectTo: undefined,
    },
  });

  if (error) throw error;

  // Send SMS OTP using Supabase phone auth
  const { error: smsError } = await supabase.auth.signInWithOtp({
    phone: phone,
    options: {
      channel: 'sms',
    },
  });

  if (smsError) throw smsError;

  return { needsVerification: true };
}

// Step 2: Verify SMS OTP and create user profile
export async function verifyOTP(phone: string, otp: string, userDetails?: { email: string; name: string }): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms',
  });

  if (error) throw error;

  if (!data.user) return null;

  // Create user profile in public.users table
  if (userDetails) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        name: userDetails.name,
        email: userDetails.email,
        phone_numbe: phone, // Note: your schema has 'phone_numbe' (missing 'r')
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Don't throw error here as auth verification succeeded
    }
  }

  return {
    id: data.user.id,
    email: userDetails?.email || data.user.email || '',
    phone: data.user.phone || phone,
    name: userDetails?.name || ((data.user.user_metadata as any)?.name ?? ''),
    created_at: data.user.created_at,
    updated_at: data.user.updated_at,
  };
}

// Resend SMS OTP
export async function resendOTP(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
    },
  });

  if (error) throw error;
}

// Regular password login
export async function signIn(credentials: LoginCredentials): Promise<AuthUser | null> {
  const { email, password } = credentials;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (!data.user) return null;

  // Get user profile from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email!,
    phone: profile?.phone_numbe || data.user.phone || '',
    name: profile?.name || ((data.user.user_metadata as any)?.name ?? ''),
    created_at: data.user.created_at,
    updated_at: data.user.updated_at,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
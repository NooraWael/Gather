import { supabase } from './supabase';
import { Registration, RegistrationStatus } from '@/constants/types';

export interface RegistrationWithUser extends Registration {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone_numbe?: string | null;
  } | null;
}

export async function registerForEvent(
  eventId: string,
  userId: string,
  status: RegistrationStatus = 'registered',
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as Registration[];
}

export async function getRegistrationsForEvent(eventId: string): Promise<RegistrationWithUser[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      event_id,
      user_id,
      status,
      created_at,
      user:users (
        id,
        name,
        email,
        phone_numbe
      )
    `)
    .eq('event_id', eventId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return (data as any[]).map((row) => ({
    id: row.id,
    event_id: row.event_id,
    user_id: row.user_id,
    status: row.status as RegistrationStatus,
    created_at: row.created_at,
    user: row.user ?? null,
  }));
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus,
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

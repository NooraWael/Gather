import { supabase } from './supabase';
import { Registration } from '@/constants/types';

export async function registerForEvent(eventId: string, userId: string): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
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

import { supabase } from './supabase';
import { Event, EventWithRegistrations } from '@/constants/types';

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .order('date_time', { ascending: true });

  if (error) throw error;
  return data as Event[];
}

export async function createEvent(event: Partial<Event>): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function getEventWithRegistrations(eventId: string): Promise<EventWithRegistrations | null> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      registrations (*)
    `)
    .eq('id', eventId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    registrations: data.registrations || [],
    current_attendees: data.registrations?.length || 0,
  } as EventWithRegistrations;
}

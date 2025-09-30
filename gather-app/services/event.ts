import { supabase } from './supabase';
import type {
  Event,
  EventStatus,
  EventWithRegistrations,
  Registration,
  RegistrationStatus,
} from '@/constants/types';
import { getCurrentUserProfile } from './user';

type SupabaseEventRow = {
  id: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string;
  capacity: number;
  is_paid: boolean;
  image_url: string | null;
  category: string | null;
  status: string | null;
  phone_number: string | null;
  created_by: string;
  created_at: string;
  registrations?: SupabaseRegistrationRow[] | null;
};

type SupabaseRegistrationRow = {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
};

type SupabaseJoinedEventRow = {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
  event: SupabaseEventRow | null;
};

const EVENT_STATUS_MAP: Record<string, EventStatus> = {
  pending: 'pending',
  active: 'accepted',
  accepted: 'accepted',
  rejected: 'declined',
  declined: 'declined',
};

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80';

function mapEventStatus(status?: string | null): EventStatus {
  if (!status) return 'pending';
  return EVENT_STATUS_MAP[status] ?? 'pending';
}

function buildRegistrations(rows?: SupabaseRegistrationRow[] | null): Registration[] {
  if (!rows) return [];
  return rows.map((row) => ({
    id: row.id,
    event_id: row.event_id,
    user_id: row.user_id,
    status: row.status,
    created_at: row.created_at,
  }));
}

function transformEventRow(row: SupabaseEventRow, userRegistration?: Registration): EventWithRegistrations {
  const registrations = buildRegistrations(row.registrations);
  const activeRegistrations = registrations.filter((reg) => reg.status !== 'cancelled');

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    date_time: row.date_time,
    location: row.location,
    capacity: row.capacity,
    is_paid: row.is_paid,
    image_url: row.image_url ?? DEFAULT_EVENT_IMAGE,
    category: row.category ?? 'General',
    status: mapEventStatus(row.status),
    phone_number: row.phone_number ?? undefined,
    created_by: row.created_by,
    created_at: row.created_at,
    registrations,
    current_attendees: activeRegistrations.length,
    user_registration: userRegistration,
  };
}

export async function getEvents(): Promise<EventWithRegistrations[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      registrations (
        id,
        event_id,
        user_id,
        status,
        created_at
      )
    `)
    .eq('status', 'active')
    .order('date_time', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => transformEventRow(row as SupabaseEventRow));
}

export async function getEventsCreatedByUser(userId: string): Promise<EventWithRegistrations[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      registrations (
        id,
        event_id,
        user_id,
        status,
        created_at
      )
    `)
    .eq('created_by', userId)
    .order('date_time', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => transformEventRow(row as SupabaseEventRow));
}

export async function getJoinedEventsForUser(userId: string): Promise<EventWithRegistrations[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      event_id,
      user_id,
      status,
      created_at,
      event:events (
        *,
        registrations (
          id,
          event_id,
          user_id,
          status,
          created_at
        )
      )
    `)
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data) return [];

  const rows = data as unknown as SupabaseJoinedEventRow[];

  return rows
    .filter((item) => item.event)
    .map((item) => {
      const userRegistration: Registration = {
        id: item.id,
        event_id: item.event_id,
        user_id: item.user_id,
        status: item.status,
        created_at: item.created_at,
      };

      return transformEventRow(item.event as SupabaseEventRow, userRegistration);
    });
}

export async function createEvent(event: Partial<Event>): Promise<Event | null> {
  // Get the user profile first to use the correct ID
  const userProfile = await getCurrentUserProfile();
  
  if (!userProfile) {
    throw new Error('User profile not found');
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      created_by: userProfile.id, // Use profile ID instead of auth ID
    })
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>,
): Promise<EventWithRegistrations | null> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select(`
      *,
      registrations (
        id,
        event_id,
        user_id,
        status,
        created_at
      )
    `)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return transformEventRow(data as SupabaseEventRow);
}

export async function getEventWithRegistrations(
  eventId: string,
  currentUserId?: string,
): Promise<EventWithRegistrations | null> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      registrations (
        id,
        event_id,
        user_id,
        status,
        created_at
      )
    `)
    .eq('id', eventId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const eventRow = data as SupabaseEventRow;
  const registrations = buildRegistrations(eventRow.registrations);
  const userRegistration = currentUserId
    ? registrations.find((reg) => reg.user_id === currentUserId)
    : undefined;

  return transformEventRow({ ...eventRow, registrations: eventRow.registrations }, userRegistration);
}

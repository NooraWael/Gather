import { AuthStorage } from '@/utils/async';
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_numbe?: string;
  created_at: string;
  interests?: string[];
  bio?: string;
  location?: string;
}

export interface UserStats {
  eventsHosting: number;
  joinedEvents: number;
  peopleConnected: number;
}

export interface UserRegistrationWithEvent {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  event: {
    id: string;
    title: string;
    date_time: string;
    location: string;
    created_by: string;
  };
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  let { data: { user } } = await supabase.auth.getUser();
  
  // If Supabase session is missing, try to get email from AsyncStorage
  if (!user) {
    console.log('No Supabase session, checking AsyncStorage...');
    const storedUserInfo = await AuthStorage.getUserInfo();
    
    if (!storedUserInfo?.email) {
      console.log('No stored user info either');
      return null;
    }
    
    // Use stored email to lookup profile
    console.log('Looking up profile by stored email:', storedUserInfo.email);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', storedUserInfo.email)
      .maybeSingle();

       console.log('Profile lookup result:', data); // Add this
    console.log('Profile lookup error:', error); 
    if (error) {
      console.error('Error fetching user profile by email:', error);
      return null;
    }

    return data as UserProfile;
  }

  // Normal flow - Supabase session exists
  console.log('Supabase session found, looking up by email:', user.email);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email!)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile;
}

// Update user profile
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data as UserProfile;
}

// Get user statistics
export async function getUserStats(userId: string): Promise<UserStats> {
  // Get events the user is hosting
  const { data: hostingEvents, error: hostingError } = await supabase
    .from('events')
    .select('id')
    .eq('created_by', userId)
    .eq('status', 'active');

  if (hostingError) {
    console.error('Error fetching hosting events:', hostingError);
  }

  // Get events the user has joined
  const { data: joinedEvents, error: joinedError } = await supabase
    .from('registrations')
    .select('id')
    .eq('user_id', userId)
    .neq('status', 'cancelled');

  if (joinedError) {
    console.error('Error fetching joined events:', joinedError);
  }

  // Get unique people connected (rough estimate)
  // This could be more sophisticated with actual connections table
  const { data: connections, error: connectionsError } = await supabase
    .from('registrations')
    .select('event_id')
    .eq('user_id', userId);

  let peopleConnected = 0;
  if (!connectionsError && connections) {
    // Get all other registrations for events this user joined
    const eventIds = connections.map(c => c.event_id);
    if (eventIds.length > 0) {
      const { data: otherRegistrations } = await supabase
        .from('registrations')
        .select('user_id')
        .in('event_id', eventIds)
        .neq('user_id', userId);

      if (otherRegistrations) {
        const uniqueUsers = new Set(otherRegistrations.map(r => r.user_id));
        peopleConnected = uniqueUsers.size;
      }
    }
  }

  return {
    eventsHosting: hostingEvents?.length || 0,
    joinedEvents: joinedEvents?.length || 0,
    peopleConnected,
  };
}

// Get user's upcoming registrations with event details
export async function getUserUpcomingEvents(userId: string): Promise<UserRegistrationWithEvent[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      event:events (
        id,
        title,
        date_time,
        location,
        created_by
      )
    `)
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .gte('event.date_time', new Date().toISOString())
    // Remove this problematic line:
    // .order('event.date_time', { ascending: true });

  if (error) {
    console.error('Error fetching user events:', error);
    return [];
  }

  // Sort in JavaScript instead
  return data
    .filter(item => item.event && item.event.date_time) // Filter out null events
    .sort((a, b) => new Date(a.event.date_time).getTime() - new Date(b.event.date_time).getTime())
    .map(item => ({
      id: item.id,
      event_id: item.event_id,
      user_id: item.user_id,
      status: item.status,
      created_at: item.created_at,
      event: item.event
    })) as UserRegistrationWithEvent[];
}

// Save user interests
export async function saveUserInterests(interests: string[]): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { error } = await supabase
    .from('users')
    .update({ interests })
    .eq('id', user.id);

  if (error) {
    console.error('Error saving interests:', error);
    return false;
  }

  return true;
}

// Delete user account
export async function deleteUserAccount(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  try {
    // Delete user profile data (cascading will handle related records)
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      return false;
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    return false;
  }
}
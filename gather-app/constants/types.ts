export type EventPriceType = 'Free' | 'Paid';

export type CreatedEventStatus = 'pending' | 'accepted' | 'declined';
export type JoinedEventStatus = 'pending approval' | 'registered';
export type EventStatus = CreatedEventStatus | JoinedEventStatus;

export type RegistrationStatus = 'registered' | 'pending_payment' | 'approved' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  capacity: number;
  is_paid: boolean;
  image_url: string;
  category: string;
  status: EventStatus;
  phone_number?: string; 
  created_by: string;
  created_at: string;
  creator?: User;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
}

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  attendees: number;
  price: EventPriceType;
  image: string;
  category: string;
}

export interface MyEventCardProps extends EventCardProps {
  isCreated: boolean;
  status: EventStatus;
}

export interface EventWithRegistrations extends Event {
  registrations: Registration[];
  current_attendees: number;
  user_registration?: Registration; // Current user's registration if exists
}

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
}
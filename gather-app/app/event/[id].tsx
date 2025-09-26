import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { EventWithRegistrations, Registration, RegistrationStatus } from '@/constants/types';

// Mock current user ID - replace with actual auth
const CURRENT_USER_ID = 'user123';

// Mock data
const mockEvents: { [key: string]: EventWithRegistrations } = {
  '1': {
    id: '1',
    title: 'Community Food Festival',
    description: 'Join us for an amazing community food festival featuring local vendors, live music, and activities for the whole family.',
    date_time: '2025-10-15T12:00:00Z',
    location: 'Central Park, Main Pavilion Area',
    capacity: 200,
    is_paid: true,
    image_url: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&w=900&q=80',
    category: 'Food & Drink',
    status: 'accepted',
    phone_number: '+973-1234-5678',
    created_by: 'user123', // This user's event
    created_at: '2025-09-20T10:00:00Z',
    creator: {
      id: 'user123',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      created_at: '2025-08-15T10:00:00Z',
    },
    registrations: [
      {
        id: 'reg1',
        event_id: '1',
        user_id: 'user456',
        status: 'registered',
        created_at: '2025-09-21T10:00:00Z',
      },
      {
        id: 'reg2',
        event_id: '1',
        user_id: 'user789',
        status: 'pending_payment',
        created_at: '2025-09-22T10:00:00Z',
      },
      {
        id: 'reg3',
        event_id: '1',
        user_id: 'user101',
        status: 'approved',
        created_at: '2025-09-20T15:30:00Z',
      },
      {
        id: 'reg4',
        event_id: '1',
        user_id: 'user102',
        status: 'approved',
        created_at: '2025-09-19T09:15:00Z',
      }
    ],
    current_attendees: 87,
    user_registration: undefined,
  },
  '2': {
    id: '2',
    title: 'Book Club: Local Authors',
    description: 'A cozy book club meeting focusing on works by local authors.',
    date_time: '2025-10-18T18:30:00Z',
    location: 'Corner Coffee Shop, Downtown',
    capacity: 15,
    is_paid: false,
    image_url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    category: 'Literature',
    status: 'accepted',
    created_by: 'user456', // Not this user's event
    created_at: '2025-09-18T10:00:00Z',
    creator: {
      id: 'user456',
      name: 'Mohammed Hassan',
      email: 'mohammed@example.com',
      created_at: '2025-07-10T10:00:00Z',
    },
    registrations: [],
    current_attendees: 12,
    user_registration: undefined,
  },
};

// Component for managing your own event
const OwnEventDetail = ({ event, onEventUpdate }: { event: EventWithRegistrations, onEventUpdate: (event: EventWithRegistrations) => void }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Simulate API call to update event
      await new Promise(resolve => setTimeout(resolve, 1000));
      onEventUpdate(editedEvent);
      setIsEditing(false);
      Alert.alert('Success', 'Event updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update event. Please try again.');
    }
  };

  const handleManageParticipants = () => {
    router.push(`/event/participants?id=${event.id}`);
  };

  // Calculate participants stats
  const pendingCount = event.registrations.filter(reg => 
    reg.status === 'registered' || reg.status === 'pending_payment'
  ).length;
  
  const approvedCount = event.registrations.filter(reg => 
    reg.status === 'approved'
  ).length;

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Event Image */}
      <ThemedView style={styles.imageContainer}>
        <Image source={{ uri: event.image_url }} style={styles.image} resizeMode="cover" />
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* Header with Edit Button */}
        <ThemedView style={styles.ownEventHeader}>
          <ThemedText style={[styles.ownEventTitle, { color: palette.primary }]}>
            Your Event
          </ThemedText>
          <Pressable
            onPress={() => setIsEditing(!isEditing)}
            style={[styles.editButton, { backgroundColor: isEditing ? palette.muted : palette.accent }]}
          >
            <Feather name={isEditing ? "x" : "edit-2"} size={16} color="#FFFFFF" />
            <ThemedText style={styles.editButtonText}>
              {isEditing ? 'Cancel' : 'Edit'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Event Details */}
        <ThemedView style={styles.detailsSection}>
          <ThemedView style={styles.editableField}>
            <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>Title</ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.editInput, { borderColor: palette.muted + '40', backgroundColor: palette.surface, color: palette.primary }]}
                value={editedEvent.title}
                onChangeText={(text) => setEditedEvent(prev => ({ ...prev, title: text }))}
                placeholder="Event title"
                placeholderTextColor={palette.muted}
              />
            ) : (
              <ThemedText style={[styles.fieldValue, { color: palette.primary }]}>{event.title}</ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.editableField}>
            <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>Description</ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.editTextArea, { borderColor: palette.muted + '40', backgroundColor: palette.surface, color: palette.primary }]}
                value={editedEvent.description}
                onChangeText={(text) => setEditedEvent(prev => ({ ...prev, description: text }))}
                placeholder="Event description"
                placeholderTextColor={palette.muted}
                multiline
                numberOfLines={4}
              />
            ) : (
              <ThemedText style={[styles.fieldValue, { color: palette.primary }]}>{event.description}</ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.editableField}>
            <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>Location</ThemedText>
            {isEditing ? (
              <TextInput
                style={[styles.editInput, { borderColor: palette.muted + '40', backgroundColor: palette.surface, color: palette.primary }]}
                value={editedEvent.location}
                onChangeText={(text) => setEditedEvent(prev => ({ ...prev, location: text }))}
                placeholder="Event location"
                placeholderTextColor={palette.muted}
              />
            ) : (
              <ThemedText style={[styles.fieldValue, { color: palette.primary }]}>{event.location}</ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.editableField}>
            <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>Date & Time</ThemedText>
            <ThemedText style={[styles.fieldValue, { color: palette.primary }]}>
              {formatDate(event.date_time)} at {formatTime(event.date_time)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.editableField}>
            <ThemedText style={[styles.fieldLabel, { color: palette.muted }]}>Capacity</ThemedText>
            <ThemedText style={[styles.fieldValue, { color: palette.primary }]}>
              {event.current_attendees} / {event.capacity} attending
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {isEditing && (
          <Pressable
            onPress={handleSaveChanges}
            style={[styles.saveButton, { backgroundColor: palette.primary }]}
          >
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </Pressable>
        )}

        {/* Participants Management Section */}
        <ThemedView style={styles.participantsSection}>
          <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
            Participants Overview
          </ThemedText>
          
          {/* Participants Stats */}
          <ThemedView style={[styles.participantsStats, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
            <ThemedView style={[styles.statItem, { backgroundColor: palette.surface }]}>
              <ThemedText style={[styles.statNumber, { color: palette.primary }]}>
                {event.registrations.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: palette.muted }]}>
                Total Registrations
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={[styles.statDivider, { backgroundColor: palette.muted + '30' }]} />
            
            <ThemedView style={[styles.statItem, { backgroundColor: palette.surface }]}>
              <ThemedText style={[styles.statNumber, { color: '#F59E0B' }]}>
                {pendingCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: palette.muted }]}>
                Pending
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={[styles.statDivider, { backgroundColor: palette.muted + '30' }]} />
            
            <ThemedView style={[styles.statItem, { backgroundColor: palette.surface }]}>
              <ThemedText style={[styles.statNumber, { color: '#10B981' }]}>
                {approvedCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: palette.muted }]}>
                Approved
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Manage Participants Button */}
          <Pressable
            onPress={handleManageParticipants}
            style={[styles.manageParticipantsButton, { backgroundColor: palette.primary }]}
          >
            <Feather name="users" size={20} color="#FFFFFF" />
            <ThemedText style={styles.manageParticipantsText}>
              Manage Participants
            </ThemedText>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
};

// Main Event Detail Component
export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  
  const [event, setEvent] = useState<EventWithRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (id && mockEvents[id]) {
          setEvent(mockEvents[id]);
        } else {
          Alert.alert('Error', 'Event not found');
          router.back();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load event details');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getRegistrationButtonText = () => {
    if (!event) return '';
    
    if (event.user_registration) {
      switch (event.user_registration.status) {
        case 'registered':
          return 'Registered';
        case 'pending_payment':
          return 'Payment Required';
        case 'approved':
          return 'Registration Approved';
        case 'cancelled':
          return 'Registration Cancelled';
        default:
          return 'Registered';
      }
    }
    return event.is_paid ? 'Register & Pay' : 'Register for Free';
  };

  const getRegistrationButtonColor = () => {
    if (!event) return palette.primary;
    
    if (event.user_registration) {
      switch (event.user_registration.status) {
        case 'approved':
          return '#10B981';
        case 'pending_payment':
          return '#F59E0B';
        case 'cancelled':
          return '#EF4444';
        default:
          return palette.muted;
      }
    }
    return palette.primary;
  };

  const handleRegister = async () => {
    if (!event || event.user_registration) return;
    
    setIsRegistering(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRegistration: Registration = {
        id: `reg_${Date.now()}`,
        event_id: event.id,
        user_id: CURRENT_USER_ID,
        status: event.is_paid ? 'pending_payment' : 'registered',
        created_at: new Date().toISOString(),
      };

      setEvent(prev => prev ? {
        ...prev,
        user_registration: newRegistration,
        current_attendees: prev.current_attendees + 1,
      } : null);

      const message = event.is_paid 
        ? 'Registration successful! The event organizer will review your registration and payment manually.'
        : 'Registration successful! You are now registered for this event.';
      
      Alert.alert('Registration Successful!', message, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to register for event. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView 
        style={[styles.container, styles.centered, { backgroundColor: palette.background }]}
        edges={['top', 'left', 'right']}
      >
        <ActivityIndicator size="large" color={palette.primary} />
        <ThemedText style={[styles.loadingText, { color: palette.muted }]}>
          Loading event details...
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView 
        style={[styles.container, styles.centered, { backgroundColor: palette.background }]}
        edges={['top', 'left', 'right']}
      >
        <ThemedText style={[styles.errorText, { color: palette.muted }]}>
          Event not found
        </ThemedText>
      </SafeAreaView>
    );
  }

  const isOwnEvent = event.created_by === CURRENT_USER_ID;
  const canRegister = !event.user_registration && event.current_attendees < event.capacity && event.status === 'accepted' && !isOwnEvent;

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: palette.muted + '40' }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { backgroundColor: palette.muted + '20' }
          ]}
        >
          <Feather name="arrow-left" size={24} color={palette.secondary} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: palette.primary }]}>
          {isOwnEvent ? 'Manage Event' : 'Event Details'}
        </ThemedText>
        <ThemedView style={styles.headerSpacer} />
      </ThemedView>

      {isOwnEvent ? (
        <OwnEventDetail event={event} onEventUpdate={setEvent} />
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Event Image */}
            <ThemedView style={styles.imageContainer}>
              <Image source={{ uri: event.image_url }} style={styles.image} resizeMode="cover" />
            </ThemedView>

            <ThemedView style={styles.content}>
              {/* Title and Category */}
              <ThemedView style={styles.titleSection}>
                <Text style={[styles.title, { color: palette.primary }]}>
                  {event.title}
                </Text>
                <ThemedView style={[styles.categoryPill, { backgroundColor: palette.accent }]}>
                  <Text style={styles.categoryText}>{event.category}</Text>
                </ThemedView>
              </ThemedView>

              {/* Event Details */}
              <ThemedView style={styles.detailsSection}>
                <ThemedView style={styles.detailRow}>
                  <Feather name="calendar" size={20} color={palette.secondary} />
                  <ThemedView style={styles.detailTextContainer}>
                    <ThemedText style={[styles.detailLabel, { color: palette.muted }]}>
                      Date & Time
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: palette.primary }]}>
                      {formatDate(event.date_time)}
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: palette.primary }]}>
                      {formatTime(event.date_time)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <Feather name="map-pin" size={20} color={palette.secondary} />
                  <ThemedView style={styles.detailTextContainer}>
                    <ThemedText style={[styles.detailLabel, { color: palette.muted }]}>
                      Location
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: palette.primary }]}>
                      {event.location}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <Feather name="users" size={20} color={palette.secondary} />
                  <ThemedView style={styles.detailTextContainer}>
                    <ThemedText style={[styles.detailLabel, { color: palette.muted }]}>
                      Capacity
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: palette.primary }]}>
                      {event.current_attendees} / {event.capacity} attending
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.detailRow}>
                  <Feather name="dollar-sign" size={20} color={palette.secondary} />
                  <ThemedView style={styles.detailTextContainer}>
                    <ThemedText style={[styles.detailLabel, { color: palette.muted }]}>
                      Price
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: palette.primary }]}>
                      {event.is_paid ? 'Paid Event' : 'Free Event'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                {event.creator && (
                  <ThemedView style={styles.detailRow}>
                    <Feather name="user" size={20} color={palette.secondary} />
                    <ThemedView style={styles.detailTextContainer}>
                      <ThemedText style={[styles.detailLabel, { color: palette.muted }]}>
                        Organized by
                      </ThemedText>
                      <ThemedText style={[styles.detailValue, { color: palette.primary }]}>
                        {event.creator.name}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Description */}
              <ThemedView style={styles.descriptionSection}>
                <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                  About This Event
                </ThemedText>
                <ThemedText style={[styles.description, { color: palette.primary }]}>
                  {event.description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ScrollView>

          {/* Registration Button */}
          <ThemedView style={[styles.bottomSection, { borderTopColor: palette.muted + '40' }]}>
            <Pressable
              onPress={handleRegister}
              disabled={!canRegister || isRegistering}
              style={({ pressed }) => [
                styles.registerButton,
                { 
                  backgroundColor: canRegister ? getRegistrationButtonColor() : palette.muted,
                  opacity: pressed ? 0.8 : 1 
                }
              ]}
            >
              <Text style={styles.registerButtonText}>
                {isRegistering ? 'Registering...' : getRegistrationButtonText()}
              </Text>
            </Pressable>
          </ThemedView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 12,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Own Event Styles
  ownEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  ownEventTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  editableField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  editTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  participantsSection: {
    marginTop: 12,
  },
  participantsStats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  manageParticipantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  manageParticipantsText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
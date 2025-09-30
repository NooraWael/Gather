import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import type { EventWithRegistrations } from '@/constants/types';
import { getEventWithRegistrations, updateEvent } from '@/services/event';
import { registerForEvent } from '@/services/registration';
import { getCurrentUserId } from '@/services/user';

// Component for managing your own event
const OwnEventDetail = ({ event, onEventUpdate }: { event: EventWithRegistrations, onEventUpdate: (event: EventWithRegistrations) => void }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(true);

      const updates = {
        title: editedEvent.title.trim(),
        description: editedEvent.description,
        location: editedEvent.location,
      };

      const updated = await updateEvent(event.id, updates);

      if (updated) {
        onEventUpdate(updated);
        setEditedEvent(updated);
      } else {
        const fallback = { ...event, ...updates };
        onEventUpdate(fallback);
        setEditedEvent(fallback);
      }

      setIsEditing(false);
      Alert.alert('Success', 'Event updated successfully!');
    } catch (error) {
      console.error('Failed to update event:', error);
      Alert.alert('Error', 'Failed to update event. Please try again.');
    } finally {
      setIsSaving(false);
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
            style={[styles.saveButton, { backgroundColor: palette.primary, opacity: isSaving ? 0.7 : 1 }]}
            disabled={isSaving}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </ThemedText>
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
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  
  const [event, setEvent] = useState<EventWithRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadEvent = useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (!eventId) {
        setError('Missing event identifier.');
        if (showLoader) {
          setLoading(false);
        }
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      try {
        const resolvedUserId = await getCurrentUserId();
        if (!isMountedRef.current) return;

        setUserId(resolvedUserId ?? null);

        const eventData = await getEventWithRegistrations(eventId, resolvedUserId ?? undefined);
        if (!isMountedRef.current) return;

        if (!eventData) {
          setError('Event not found.');
          Alert.alert('Event not found', 'This event may have been removed.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }

        setEvent(eventData);
        setError(null);
      } catch (err) {
        console.error('Failed to load event details:', err);
        if (!isMountedRef.current) return;

        setError('Failed to load event details.');
        Alert.alert('Error', 'Failed to load event details.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        if (isMountedRef.current && showLoader) {
          setLoading(false);
        }
      }
    },
    [eventId, router],
  );

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

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
    if (!userId) {
      return 'Sign in to register';
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

  const handleRegister = useCallback(async () => {
    if (!event || event.user_registration) return;

    if (!userId) {
      Alert.alert(
        'Sign in required',
        'Please sign in to register for events.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign in', onPress: () => router.push('/auth/login') },
        ],
      );
      return;
    }

    const isPaidEvent = event.is_paid;
    setIsRegistering(true);

    try {
      const registration = await registerForEvent(
        event.id,
        userId,
        isPaidEvent ? 'pending_payment' : 'registered',
      );

      if (!registration) {
        throw new Error('Registration failed');
      }

      setEvent((prev) => {
        if (!prev) return prev;
        const updatedRegistrations = [...prev.registrations, registration];
        return {
          ...prev,
          registrations: updatedRegistrations,
          user_registration: registration,
          current_attendees: prev.current_attendees + 1,
        };
      });

      const message = isPaidEvent
        ? 'Registration successful! The event organizer will review your registration and payment manually.'
        : 'Registration successful! You are now registered for this event.';

      Alert.alert('Registration Successful!', message, [{ text: 'OK' }]);

      await loadEvent({ showLoader: false });
    } catch (err) {
      console.error('Failed to register for event:', err);
      Alert.alert('Error', 'Failed to register for event. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  }, [event, loadEvent, router, userId]);

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

  const isOwnEvent = userId ? event.created_by === userId : false;
  const canRegister =
    !event.user_registration &&
    event.current_attendees < event.capacity &&
    event.status === 'accepted' &&
    !isOwnEvent;

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

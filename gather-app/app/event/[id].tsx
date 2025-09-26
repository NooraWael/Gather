import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Image,
  Pressable,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { EventWithRegistrations, Registration } from '@/constants/types';

// Mock data - replace with actual Supabase queries
const mockEvents: { [key: string]: EventWithRegistrations } = {
  '1': {
    id: '1',
    title: 'Community Food Festival',
    description: 'Join us for an amazing community food festival featuring local vendors, live music, and activities for the whole family. Experience the best of our local culinary scene while connecting with neighbors and supporting small businesses.\n\nThis event will feature over 20 local food vendors, live entertainment throughout the day, and special activities for children. Come hungry and ready to discover new flavors and meet your community!',
    date_time: '2025-10-15T12:00:00Z',
    location: 'Central Park, Main Pavilion Area',
    capacity: 200,
    is_paid: true,
    image_url: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&w=900&q=80',
    category: 'Food & Drink',
    status: 'accepted',
    phone_number: '+973-1234-5678',
    created_by: 'user123',
    created_at: '2025-09-20T10:00:00Z',
    creator: {
      id: 'user123',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      created_at: '2025-08-15T10:00:00Z',
    },
    registrations: [],
    current_attendees: 87,
    user_registration: undefined,
  },
  '2': {
    id: '2',
    title: 'Book Club: Local Authors',
    description: 'A cozy book club meeting focusing on works by local authors. This month we\'re discussing "Stories from the Gulf" by Ahmed Al-Rashid. Join fellow book lovers for engaging discussions and fresh coffee.',
    date_time: '2025-10-18T18:30:00Z',
    location: 'Corner Coffee Shop, Downtown',
    capacity: 15,
    is_paid: false,
    image_url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    category: 'Literature',
    status: 'accepted',
    created_by: 'user456',
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
  '3': {
    id: '3',
    title: 'Morning Yoga in the Park',
    description: 'Start your day with peaceful morning yoga in beautiful Riverside Park. All skill levels welcome! Bring your own mat and water bottle. Led by certified instructor Fatima Al-Zahra.',
    date_time: '2025-10-20T07:00:00Z',
    location: 'Riverside Park, Yoga Pavilion',
    capacity: 25,
    is_paid: true,
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    category: 'Health & Wellness',
    status: 'accepted',
    phone_number: '+973-9876-5432',
    created_by: 'user789',
    created_at: '2025-09-15T10:00:00Z',
    creator: {
      id: 'user789',
      name: 'Fatima Al-Zahra',
      email: 'fatima@example.com',
      created_at: '2025-06-20T10:00:00Z',
    },
    registrations: [],
    current_attendees: 18,
    user_registration: undefined,
  },
};

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  
  const [event, setEvent] = useState<EventWithRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Simulate data fetching
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Simulate API delay
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
          return event.is_paid ? 'Payment Pending' : 'Registered';
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
          return '#10B981'; // Green
        case 'pending_payment':
          return '#F59E0B'; // Amber
        case 'cancelled':
          return '#EF4444'; // Red
        default:
          return palette.muted;
      }
    }
    return palette.primary;
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleRegister = () => {
    if (!event || event.user_registration) {
      return;
    }

    if (event.is_paid) {
      setShowTermsModal(true);
    } else {
      proceedWithRegistration();
    }
  };

  const proceedWithRegistration = async () => {
    if (!event) return;
    
    setIsRegistering(true);
    
    try {
      // Simulate API call to create registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRegistration: Registration = {
        id: `reg_${Date.now()}`,
        event_id: event.id,
        user_id: 'current-user-id', // Replace with actual user ID
        status: event.is_paid ? 'pending_payment' : 'registered',
        created_at: new Date().toISOString(),
      };

      setEvent(prev => prev ? {
        ...prev,
        user_registration: newRegistration,
        current_attendees: prev.current_attendees + 1,
      } : null);

      if (event.is_paid) {
        Alert.alert(
          'Registration Successful!',
          `You have 24 hours to send payment via Benefit to ${event.phone_number}. Your registration will be cancelled if payment is not received within this timeframe.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Registration Successful!',
          'You are now registered for this event. See you there!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register for event. Please try again.');
    } finally {
      setIsRegistering(false);
      setShowTermsModal(false);
    }
  };

  const openBenefitPayment = () => {
    if (!event?.phone_number) return;
    
    const benefitUrl = `benefit://pay?phone=${event.phone_number.replace(/[^0-9]/g, '')}`;
    Linking.canOpenURL(benefitUrl).then(supported => {
      if (supported) {
        Linking.openURL(benefitUrl);
      } else {
        Alert.alert(
          'Benefit App Required',
          'Please install the Benefit app to make payments.',
          [{ text: 'OK' }]
        );
      }
    });
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

  const canRegister = !event.user_registration && event.current_attendees < event.capacity && event.status === 'accepted';

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: palette.muted + '40' }]}>
        <Pressable
          onPress={handleBackPress}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { backgroundColor: palette.muted + '20' }
          ]}
        >
          <Feather name="arrow-left" size={24} color={palette.secondary} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: palette.primary }]}>
          Event Details
        </ThemedText>
        <ThemedView style={styles.headerSpacer} />
      </ThemedView>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Image */}
        <ThemedView style={styles.imageContainer}>
          <Image source={{ uri: event.image_url }} style={styles.image} resizeMode="cover" /> 
            <Text style={styles.statusText}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Text>
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

        {event.user_registration?.status === 'pending_payment' && (
          <Pressable
            onPress={openBenefitPayment}
            style={[styles.paymentButton, { backgroundColor: palette.accent }]}
          >
            <Feather name="credit-card" size={16} color="#FFFFFF" />
            <Text style={styles.paymentButtonText}>Pay with Benefit</Text>
          </Pressable>
        )}
      </ThemedView>

      {/* Terms and Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.primary }]}>
              Terms & Conditions
            </Text>
            
            <ScrollView style={styles.termsScroll}>
              <Text style={[styles.termsText, { color: palette.primary }]}>
                By registering for this paid event, you agree to the following terms:
                {'\n\n'}
                • You have 24 hours to complete payment via Benefit to {event.phone_number}
                {'\n\n'}
                • Your registration will be automatically cancelled if payment is not received within 24 hours
                {'\n\n'}
                • Payment must be sent to the provided phone number using the Benefit app
                {'\n\n'}
                • Once payment is confirmed, your registration status will be updated to "Approved"
                {'\n\n'}
                • Refunds are subject to the event organizer's discretion
              </Text>
            </ScrollView>

            <ThemedView style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowTermsModal(false)}
                style={[styles.modalButton, { backgroundColor: palette.muted }]}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                onPress={proceedWithRegistration}
                style={[styles.modalButton, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.modalButtonText}>
                  {isRegistering ? 'Processing...' : 'Agree & Register'}
                </Text>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
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
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
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
    marginBottom: 12,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
  },
  paymentButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  termsScroll: {
    maxHeight: 300,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
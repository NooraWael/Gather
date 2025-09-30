import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Image,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { EventStatus } from '@/constants/types';
import { createEvent } from '@/services/event';
import { getCurrentUserId } from '@/services/user';

interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  time: Date;
  location: string;
  capacity: string;
  is_paid: boolean;
  phone_number: string;
  category: string;
  image_url: string;
}

const CATEGORIES = [
  'Food & Drink',
  'Health & Wellness',
  'Literature',
  'Music',
  'Sports',
  'Technology',
  'Art & Culture',
  'Business',
  'Education',
  'Social',
  'Other',
];

export default function AddEventScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [eventData, setEventData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    location: '',
    capacity: '',
    is_paid: false,
    phone_number: '',
    category: CATEGORIES[0],
    image_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!eventData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!eventData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!eventData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    const capacity = parseInt(eventData.capacity);
    if (!eventData.capacity.trim() || isNaN(capacity) || capacity < 1) {
      newErrors.capacity = 'Valid capacity is required (minimum 1)';
    }

    if (eventData.is_paid && !eventData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required for paid events';
    }

    if (eventData.is_paid && eventData.phone_number.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(eventData.phone_number.replace(/[\s-]/g, ''))) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }
    }

    const combinedDate = new Date(eventData.date);
    combinedDate.setHours(eventData.time.getHours());
    combinedDate.setMinutes(eventData.time.getMinutes());
    combinedDate.setSeconds(0);
    combinedDate.setMilliseconds(0);

    if (combinedDate <= new Date()) {
      newErrors.date = 'Event date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time
      const eventDateTime = new Date(eventData.date);
      eventDateTime.setHours(eventData.time.getHours());
      eventDateTime.setMinutes(eventData.time.getMinutes());

      const userId = await getCurrentUserId();
      if (!userId) {
        setIsLoading(false);
        Alert.alert(
          'Sign in required',
          'Please sign in to create events.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign in', onPress: () => router.push('/auth/login') },
          ]
        );
        return;
      }

      const fallbackImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80';
      const hasRemoteImage = eventData.image_url && eventData.image_url.startsWith('http');

      const eventPayload = {
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        date_time: eventDateTime.toISOString(),
        location: eventData.location.trim(),
        capacity: parseInt(eventData.capacity),
        is_paid: eventData.is_paid,
        phone_number: eventData.is_paid ? eventData.phone_number.trim() : undefined,
        category: eventData.category,
        image_url: hasRemoteImage ? eventData.image_url : fallbackImage,
        status: 'pending' as EventStatus, // Will be reviewed by admin
        created_by: userId,
      };

      await createEvent(eventPayload);

      Alert.alert(
        'Event Submitted!',
        'Your event has been submitted for review. You will be notified once it has been approved.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error) {
      console.error('Error creating event:', error);
      const message = error instanceof Error && error.message
        ? error.message
        : 'Failed to create event. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventData(prev => ({ ...prev, image_url: result.assets[0].uri }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempTime, setTempTime] = useState<Date>(new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setEventData(prev => ({ ...prev, date: selectedDate }));
        if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
      }
    } else {
      // On iOS, just update temp value - don't close modal
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedTime) {
        setEventData(prev => ({ ...prev, time: selectedTime }));
      }
    } else {
      // On iOS, just update temp value - don't close modal
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
  };

  const DateTimePickerModal = ({ visible, mode, value, onChange, onClose }: {
    visible: boolean;
    mode: 'date' | 'time';
    value: Date;
    onChange: (event: any, date?: Date) => void;
    onClose: () => void;
  }) => {
    if (Platform.OS === 'android') {
      return visible ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          minimumDate={mode === 'date' ? new Date() : undefined}
          onChange={onChange}
        />
      ) : null;
    }

    // iOS Modal - use local state to prevent flickering
    const [localValue, setLocalValue] = useState(value);

    // Update local value when modal opens
    React.useEffect(() => {
      if (visible) {
        setLocalValue(mode === 'date' ? tempDate : tempTime);
      }
    }, [visible, mode, tempDate, tempTime]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <ThemedView style={[styles.modalHeader, { borderBottomColor: palette.muted + '40' }]}>
              <Pressable onPress={onClose}>
                <ThemedText style={[styles.modalButton, { color: palette.primary }]}>Cancel</ThemedText>
              </Pressable>
              <ThemedText style={[styles.modalTitle, { color: palette.primary }]}>
                Select {mode === 'date' ? 'Date' : 'Time'}
              </ThemedText>
              <Pressable onPress={() => {
                // Only update the actual state when Done is pressed
                if (mode === 'date') {
                  setEventData(prev => ({ ...prev, date: localValue }));
                  if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                } else {
                  setEventData(prev => ({ ...prev, time: localValue }));
                }
                onClose();
              }}>
                <ThemedText style={[styles.modalButton, { color: palette.accent }]}>Done</ThemedText>
              </Pressable>
            </ThemedView>
            <ThemedView style={styles.pickerContainer}>
              <DateTimePicker
                value={localValue}
                mode={mode}
                display="spinner"
                minimumDate={mode === 'date' ? new Date() : undefined}
                onChange={(event, selectedDate) => {
                  // Only update local state - don't call parent onChange
                  if (selectedDate) {
                    setLocalValue(selectedDate);
                  }
                }}
                textColor={palette.primary}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    );
  };

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
          Create Event
        </ThemedText>
        <ThemedView style={styles.headerSpacer} />
      </ThemedView>

      {/* Main Content with Keyboard Avoidance */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            {/* Event Image */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                Event Image
              </ThemedText>
              <Pressable
                onPress={pickImage}
                style={[styles.imagePicker, { borderColor: palette.muted + '40' }]}
              >
                {eventData.image_url ? (
                  <Image source={{ uri: eventData.image_url }} style={styles.selectedImage} />
                ) : (
                  <ThemedView style={styles.imagePickerContent}>
                    <Feather name="camera" size={32} color={palette.muted} />
                    <ThemedText style={[styles.imagePickerText, { color: palette.muted }]}>
                      Tap to add event photo
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </ThemedView>

            {/* Event Title */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                Event Title *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    borderColor: errors.title ? '#EF4444' : palette.muted + '40',
                    backgroundColor: palette.surface,
                    color: palette.primary 
                  }
                ]}
                value={eventData.title}
                onChangeText={(text) => {
                  setEventData(prev => ({ ...prev, title: text }));
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="Enter event title"
                placeholderTextColor={palette.muted}
                editable={!isLoading}
              />
              {errors.title && (
                <ThemedText style={styles.errorText}>{errors.title}</ThemedText>
              )}
            </ThemedView>

            {/* Event Description */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                Description *
              </ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    borderColor: errors.description ? '#EF4444' : palette.muted + '40',
                    backgroundColor: palette.surface,
                    color: palette.primary 
                  }
                ]}
                value={eventData.description}
                onChangeText={(text) => {
                  setEventData(prev => ({ ...prev, description: text }));
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                }}
                placeholder="Describe your event..."
                placeholderTextColor={palette.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
              />
              {errors.description && (
                <ThemedText style={styles.errorText}>{errors.description}</ThemedText>
              )}
            </ThemedView>

            {/* Date and Time */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                Date & Time *
              </ThemedText>
              <ThemedView style={styles.dateTimeRow}>
                <Pressable
                  onPress={() => {
                    setTempDate(eventData.date);
                    setShowDatePicker(true);
                  }}
                  style={[styles.dateTimeButton, { backgroundColor: palette.surface, borderColor: palette.muted + '40' }]}
                >
                  <Feather name="calendar" size={20} color={palette.muted} />
                  <ThemedText style={[styles.dateTimeText, { color: palette.primary }]}>
                    {formatDate(eventData.date)}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setTempTime(eventData.time);
                    setShowTimePicker(true);
                  }}
                  style={[styles.dateTimeButton, { backgroundColor: palette.surface, borderColor: palette.muted + '40' }]}
                >
                  <Feather name="clock" size={20} color={palette.muted} />
                  <ThemedText style={[styles.dateTimeText, { color: palette.primary }]}>
                    {formatTime(eventData.time)}
                  </ThemedText>
                </Pressable>
              </ThemedView>
              {errors.date && (
                <ThemedText style={styles.errorText}>{errors.date}</ThemedText>
              )}
            </ThemedView>

            {/* Location */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                Location *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    borderColor: errors.location ? '#EF4444' : palette.muted + '40',
                    backgroundColor: palette.surface,
                    color: palette.primary 
                  }
                ]}
                value={eventData.location}
                onChangeText={(text) => {
                  setEventData(prev => ({ ...prev, location: text }));
                  if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                }}
                placeholder="Enter event location"
                placeholderTextColor={palette.muted}
                editable={!isLoading}
              />
              {errors.location && (
                <ThemedText style={styles.errorText}>{errors.location}</ThemedText>
              )}
            </ThemedView>

            {/* Capacity */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                Capacity *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    borderColor: errors.capacity ? '#EF4444' : palette.muted + '40',
                    backgroundColor: palette.surface,
                    color: palette.primary 
                  }
                ]}
                value={eventData.capacity}
                onChangeText={(text) => {
                  setEventData(prev => ({ ...prev, capacity: text }));
                  if (errors.capacity) setErrors(prev => ({ ...prev, capacity: '' }));
                }}
                placeholder="Maximum attendees"
                placeholderTextColor={palette.muted}
                keyboardType="numeric"
                editable={!isLoading}
              />
              {errors.capacity && (
                <ThemedText style={styles.errorText}>{errors.capacity}</ThemedText>
              )}
            </ThemedView>

            {/* Category */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                Category
              </ThemedText>
              <Pressable
                onPress={() => setShowCategories(!showCategories)}
                style={[styles.dropdown, { backgroundColor: palette.surface, borderColor: palette.muted + '40' }]}
              >
                <ThemedText style={[styles.dropdownText, { color: palette.primary }]}>
                  {eventData.category}
                </ThemedText>
                <Feather 
                  name={showCategories ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={palette.muted} 
                />
              </Pressable>
              {showCategories && (
                <ThemedView style={[styles.categoryList, { backgroundColor: palette.surface, borderColor: palette.muted + '40' }]}>
                  {CATEGORIES.map((category) => (
                    <Pressable
                      key={category}
                      onPress={() => {
                        setEventData(prev => ({ ...prev, category }));
                        setShowCategories(false);
                      }}
                      style={[
                        styles.categoryItem,
                        category === eventData.category && { backgroundColor: palette.accent + '20' }
                      ]}
                    >
                      <ThemedText style={[styles.categoryText, { color: palette.primary }]}>
                        {category}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ThemedView>
              )}
            </ThemedView>

            {/* Paid Event Toggle */}
            <ThemedView style={styles.section}>
              <ThemedView style={styles.switchRow}>
                <ThemedView style={styles.switchInfo}>
                  <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                    Paid Event
                  </ThemedText>
                  <ThemedText style={[styles.switchDescription, { color: palette.muted }]}>
                    Attendees will pay via Benefit
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={eventData.is_paid}
                  onValueChange={(value) => setEventData(prev => ({ ...prev, is_paid: value }))}
                  trackColor={{ false: palette.muted + '40', true: palette.accent }}
                  thumbColor={palette.surface}
                />
              </ThemedView>
            </ThemedView>

            {/* Phone Number (for paid events) */}
            {eventData.is_paid && (
              <ThemedView style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
                  Benefit Phone Number *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: errors.phone_number ? '#EF4444' : palette.muted + '40',
                      backgroundColor: palette.surface,
                      color: palette.primary 
                    }
                  ]}
                  value={eventData.phone_number}
                  onChangeText={(text) => {
                    setEventData(prev => ({ ...prev, phone_number: text }));
                    if (errors.phone_number) setErrors(prev => ({ ...prev, phone_number: '' }));
                  }}
                  placeholder="+973-1234-5678"
                  placeholderTextColor={palette.muted}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
                <ThemedText style={[styles.helperText, { color: palette.muted }]}>
                  Attendees will send payment to this number via Benefit app
                </ThemedText>
                {errors.phone_number && (
                  <ThemedText style={styles.errorText}>{errors.phone_number}</ThemedText>
                )}
              </ThemedView>
            )}

            {/* Bottom padding to ensure content is not hidden behind button */}
            <ThemedView style={styles.bottomPadding} />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Create Button */}
      <ThemedView style={[styles.fixedBottomSection, { 
        backgroundColor: palette.background,
        borderTopColor: palette.muted + '40' 
      }]}>
        <Pressable
          onPress={handleCreateEvent}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.createButton,
            { 
              backgroundColor: palette.primary,
              opacity: isLoading ? 0.7 : pressed ? 0.8 : 1
            }
          ]}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating Event...' : 'Create Event'}
          </Text>
        </Pressable>
      </ThemedView>

      {/* Date/Time Pickers */}
      <DateTimePickerModal
        visible={showDatePicker}
        mode="date"
        value={eventData.date}
        onChange={handleDateChange}
        onClose={() => setShowDatePicker(false)}
      />

      <DateTimePickerModal
        visible={showTimePicker}
        mode="time"
        value={eventData.time}
        onChange={handleTimeChange}
        onClose={() => setShowTimePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 100,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 0,
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 0,
  },
  dateTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 0,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  categoryList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
  },
  switchDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  bottomPadding: {
    height: 100, // Space for the fixed button
  },
  fixedBottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    // Add safe area padding for devices with bottom indicators
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Modal styles for iOS date/time picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  modalButton: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  pickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
});

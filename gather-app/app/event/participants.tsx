import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { EventWithRegistrations, Registration, RegistrationStatus } from '@/constants/types';
import { router } from 'expo-router';

// Mock user data for registrations
const mockUsers: { [key: string]: any } = {
  'user456': { id: 'user456', name: 'Mohammed Hassan', email: 'mohammed@example.com' },
  'user789': { id: 'user789', name: 'Fatima Al-Zahra', email: 'fatima@example.com' },
  'user101': { id: 'user101', name: 'Ahmed Al-Mansouri', email: 'ahmed@example.com' },
  'user102': { id: 'user102', name: 'Layla Ibrahim', email: 'layla@example.com' },
  'user103': { id: 'user103', name: 'Omar Khalil', email: 'omar@example.com' },
  'user104': { id: 'user104', name: 'Nour Al-Din', email: 'nour@example.com' },
};

// Mock event data with more registrations
const mockEvent: EventWithRegistrations = {
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
    current_attendees: 6,
    creator: {
      id: 'user123',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      created_at: '2025-08-15T10:00:00Z',
    },
  registrations: [
    { id: 'reg1', user_id: 'user456', status: 'registered', created_at: '2024-10-01T10:00:00Z', event_id: '1' },
    { id: 'reg2', user_id: 'user789', status: 'pending_payment', created_at: '2024-10-02T14:30:00Z' , event_id: '1'},
    { id: 'reg3', user_id: 'user101', status: 'approved', created_at: '2024-09-28T09:15:00Z' , event_id: '1'},
    { id: 'reg4', user_id: 'user102', status: 'approved', created_at: '2024-09-29T16:45:00Z', event_id: '1' },
    { id: 'reg5', user_id: 'user103', status: 'registered', created_at: '2024-10-03T11:20:00Z', event_id: '1' },
    { id: 'reg6', user_id: 'user104', status: 'approved', created_at: '2024-09-30T13:10:00Z', event_id: '1' },
  ]
};

type TabType = 'pending' | 'approved';

export default function EventParticipantsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [event, setEvent] = useState<EventWithRegistrations>(mockEvent);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ 
    visible: boolean; 
    action: string; 
    registrationId: string; 
    userName: string 
  }>({
    visible: false,
    action: '',
    registrationId: '',
    userName: '',
  });
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');

  const handleApproveRegistration = async (registrationId: string) => {
    setLoading(registrationId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedEvent = {
        ...event,
        registrations: event.registrations.map(reg => 
          reg.id === registrationId ? { ...reg, status: 'approved' as RegistrationStatus } : reg
        )
      };
      setEvent(updatedEvent);
      Alert.alert('Success', 'Registration approved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve registration.');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveParticipant = async (registrationId: string) => {
    setLoading(registrationId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedEvent = {
        ...event,
        registrations: event.registrations.filter(reg => reg.id !== registrationId),
        current_attendees: Math.max(0, event.current_attendees - 1),
      };
      setEvent(updatedEvent);
      Alert.alert('Success', 'Participant removed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove participant.');
    } finally {
      setLoading(null);
      setConfirmModal({ visible: false, action: '', registrationId: '', userName: '' });
    }
  };

  const showConfirmDialog = (action: string, registrationId: string, userName: string) => {
    setConfirmModal({ visible: true, action, registrationId, userName });
  };

  const confirmAction = () => {
    if (confirmModal.action === 'remove') {
      handleRemoveParticipant(confirmModal.registrationId);
    }
  };

  // Filter registrations based on search query and tab
  const filterRegistrations = (registrations: Registration[], searchQuery: string) => {
    if (!searchQuery.trim()) return registrations;
    
    return registrations.filter(reg => {
      const user = mockUsers[reg.user_id];
      if (!user) return false;
      
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  };

  // Get current tab's registrations with search filtering
  const currentRegistrations = useMemo(() => {
    let filtered;
    if (activeTab === 'pending') {
      filtered = event.registrations.filter(reg => 
        reg.status === 'registered' || reg.status === 'pending_payment'
      );
    } else {
      filtered = event.registrations.filter(reg => 
        reg.status === 'approved'
      );
    }
    return filterRegistrations(filtered, searchQuery);
  }, [event.registrations, activeTab, searchQuery]);

  const renderRegistration = ({ item }: { item: Registration }) => {
    const user = mockUsers[item.user_id];
    if (!user) return null;

    const isLoading = loading === item.id;
    const canApprove = item.status === 'registered' || item.status === 'pending_payment';
    const canRemove = item.status === 'approved';

    return (
      <ThemedView style={[styles.registrationCard, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
        <ThemedView style={[styles.registrationInfo, { backgroundColor: palette.surface }]}>
          <ThemedView style={[styles.registrationHeader, { backgroundColor: palette.surface }]}>
            <ThemedText style={[styles.registrationName, { color: palette.primary, backgroundColor: palette.surface }]}>
              {user.name}
            </ThemedText>
          </ThemedView>
          
          <ThemedText style={[styles.registrationEmail, { color: palette.muted, backgroundColor: palette.surface }]}>
            {user.email}
          </ThemedText>
          
          <ThemedText style={[styles.registrationDate, { color: palette.muted, backgroundColor: palette.surface }]}>
            Registered on {new Date(item.created_at).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.actionButtons, { backgroundColor: palette.surface }]}>
          {canApprove && (
            <Pressable
              onPress={() => handleApproveRegistration(item.id)}
              disabled={isLoading}
              style={[styles.actionButton, styles.approveButton, { backgroundColor: palette.primary }]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.actionButtonText}>Approve</ThemedText>
                </>
              )}
            </Pressable>
          )}
          
          {canRemove && (
            <Pressable
              onPress={() => showConfirmDialog('remove', item.id, user.name)}
              disabled={isLoading}
              style={[styles.actionButton, styles.removeButton, { backgroundColor: '#EF4444' }]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="x" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.actionButtonText}>Remove</ThemedText>
                </>
              )}
            </Pressable>
          )}
        </ThemedView>
      </ThemedView>
    );
  };

  // Tab Button component
  const TabButton = ({ 
    title, 
    isActive, 
    onPress,
    count
  }: { 
    title: string; 
    isActive: boolean; 
    onPress: () => void; 
    count: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { borderBottomColor: isActive ? palette.primary : 'transparent' }
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.tabText,
          { color: isActive ? palette.primary : palette.muted }
        ]}
      >
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  // Navigation Header
  const NavigationHeader = () => (
    <ThemedView style={[styles.header, { backgroundColor: palette.background, borderBottomColor: palette.muted + '20' }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => {router.back()}}>
        <Feather name="arrow-left" size={24} color={palette.primary}  />
      </TouchableOpacity>
      <ThemedView style={[styles.headerContent, { backgroundColor: palette.background }]}>
        <ThemedText style={[styles.headerTitle, { color: palette.primary }]}>
          Event Participants
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: palette.muted }]}>
          {event.title}
        </ThemedText>
      </ThemedView>

    </ThemedView>
  );

  // Search Input component
  const SearchInput = () => (
    <ThemedView style={[styles.searchContainer, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
      <Feather name="search" size={16} color={palette.muted} />
      <TextInput
        style={[styles.searchInput, { color: palette.primary }]}
        placeholder={`Search ${activeTab} participants...`}
        placeholderTextColor={palette.muted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Feather name="x" size={16} color={palette.muted} />
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  const pendingCount = event.registrations.filter(reg => 
    reg.status === 'registered' || reg.status === 'pending_payment'
  ).length;
  
  const approvedCount = event.registrations.filter(reg => 
    reg.status === 'approved'
  ).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Navigation Header */}
        <NavigationHeader />

        {/* Summary Stats */}
        <ThemedView style={[styles.statsContainer, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
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
              Pending Approval
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

        {/* Tab Header */}
        <ThemedView style={styles.tabContainer}>
          <TabButton
            title="Pending Approvals"
            isActive={activeTab === 'pending'}
            onPress={() => {
              setActiveTab('pending');
              setSearchQuery('');
            }}
            count={pendingCount}
          />
          <TabButton
            title="Approved Participants"
            isActive={activeTab === 'approved'}
            onPress={() => {
              setActiveTab('approved');
              setSearchQuery('');
            }}
            count={approvedCount}
          />
        </ThemedView>

        {/* Search Input */}
        <ThemedView style={styles.searchSection}>
          <SearchInput />
        </ThemedView>

        {/* Participants List */}
        <FlatList
          data={currentRegistrations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderRegistration}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <ThemedView style={{ height: 12 }} />}
          ListEmptyComponent={
            <ThemedView style={styles.emptyState}>
              {searchQuery.length > 0 ? (
                <>
                  <Feather name="search" size={48} color={palette.muted} />
                  <ThemedText style={[styles.emptyStateTitle, { color: palette.primary }]}>
                    No results found
                  </ThemedText>
                  <ThemedText style={[styles.emptyStateText, { color: palette.muted }]}>
                    Try adjusting your search to find participants
                  </ThemedText>
                </>
              ) : (
                <>
                  <Feather 
                    name={activeTab === 'pending' ? 'clock' : 'users'} 
                    size={48} 
                    color={palette.muted} 
                  />
                  <ThemedText style={[styles.emptyStateTitle, { color: palette.primary }]}>
                    {activeTab === 'pending' ? 'No pending approvals' : 'No approved participants'}
                  </ThemedText>
                  <ThemedText style={[styles.emptyStateText, { color: palette.muted }]}>
                    {activeTab === 'pending' 
                      ? 'New registrations will appear here for approval' 
                      : 'Approved participants will appear here'
                    }
                  </ThemedText>
                </>
              )}
            </ThemedView>
          }
        />

        {/* Confirmation Modal */}
        <Modal
          visible={confirmModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmModal({ visible: false, action: '', registrationId: '', userName: '' })}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={[styles.modalContent, { backgroundColor: palette.background, borderColor: palette.muted + '30' }]}>
              <ThemedView style={styles.modalHeader}>
                <Feather name="alert-triangle" size={24} color="#EF4444" />
                <ThemedText style={[styles.modalTitle, { color: palette.primary }]}>
                  Remove Participant
                </ThemedText>
              </ThemedView>
              
              <ThemedText style={[styles.modalMessage, { color: palette.muted }]}>
                Are you sure you want to remove <ThemedText style={{ color: palette.primary, fontFamily: 'Inter-SemiBold' }}>{confirmModal.userName}</ThemedText> from this event? This action cannot be undone.
              </ThemedText>
              
              <ThemedView style={styles.modalActions}>
                <Pressable
                  onPress={() => setConfirmModal({ visible: false, action: '', registrationId: '', userName: '' })}
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: palette.muted + '20' }]}
                >
                  <ThemedText style={[styles.modalButtonText, { color: palette.primary }]}>
                    Cancel
                  </ThemedText>
                </Pressable>
                
                <Pressable
                  onPress={confirmAction}
                  style={[styles.modalButton, styles.confirmButton, { backgroundColor: '#EF4444' }]}
                >
                  <ThemedText style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Remove
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
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
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  registrationCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  registrationInfo: {
    flex: 1,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  registrationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  registrationEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  registrationDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  approveButton: {
    // backgroundColor set inline
  },
  removeButton: {
    // backgroundColor set inline
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    // backgroundColor set inline
  },
  confirmButton: {
    // backgroundColor set inline
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
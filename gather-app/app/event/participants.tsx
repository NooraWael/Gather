import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { EventWithRegistrations, RegistrationStatus } from '@/constants/types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getEventWithRegistrations } from '@/services/event';
import {
  getRegistrationsForEvent,
  RegistrationWithUser,
  updateRegistrationStatus,
} from '@/services/registration';

type TabType = 'pending' | 'approved';

const isPendingStatus = (status: RegistrationStatus) =>
  status === 'registered' || status === 'pending_payment';

export default function EventParticipantsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [event, setEvent] = useState<EventWithRegistrations | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithUser[]>([]);
  const [screenLoading, setScreenLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    action: '',
    registrationId: '',
    userName: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (!eventId) {
        setError('Missing event identifier.');
        if (showLoader) setScreenLoading(false);
        return;
      }

      if (showLoader) {
        setScreenLoading(true);
      }

      try {
        setError(null);
        const [eventData, registrantData] = await Promise.all([
          getEventWithRegistrations(eventId),
          getRegistrationsForEvent(eventId),
        ]);

        if (!isMountedRef.current) return;

        if (!eventData) {
          setError('Event not found.');
          Alert.alert('Event not found', 'This event may have been removed.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }

        setEvent(eventData);
        setRegistrations(registrantData);
      } catch (err) {
        console.error('Failed to load participants:', err);
        if (!isMountedRef.current) return;
        setError('Failed to load participants.');
      } finally {
        if (isMountedRef.current && showLoader) {
          setScreenLoading(false);
        }
      }
    },
    [eventId, router],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData({ showLoader: false });
    if (isMountedRef.current) {
      setRefreshing(false);
    }
  }, [loadData]);

  const handleApproveRegistration = useCallback(
    async (registrationId: string) => {
      setActionLoading(registrationId);
      try {
        await updateRegistrationStatus(registrationId, 'approved');
        if (!isMountedRef.current) return;

        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === registrationId ? { ...reg, status: 'approved' } : reg,
          ),
        );

        setEvent((prev) =>
          prev
            ? {
                ...prev,
                registrations: prev.registrations.map((reg) =>
                  reg.id === registrationId ? { ...reg, status: 'approved' } : reg,
                ),
              }
            : prev,
        );

        Alert.alert('Success', 'Registration approved successfully!');
      } catch (err) {
        console.error('Failed to approve registration:', err);
        Alert.alert('Error', 'Failed to approve registration.');
      } finally {
        setActionLoading(null);
      }
    },
    [],
  );

  const handleRemoveParticipant = useCallback(
    async (registrationId: string) => {
      setActionLoading(registrationId);
      try {
        await updateRegistrationStatus(registrationId, 'cancelled');
        if (!isMountedRef.current) return;

        setRegistrations((prev) => prev.filter((reg) => reg.id !== registrationId));

        setEvent((prev) =>
          prev
            ? {
                ...prev,
                registrations: prev.registrations.filter((reg) => reg.id !== registrationId),
                current_attendees: Math.max(0, prev.current_attendees - 1),
              }
            : prev,
        );

        Alert.alert('Success', 'Participant removed successfully!');
      } catch (err) {
        console.error('Failed to remove participant:', err);
        Alert.alert('Error', 'Failed to remove participant.');
      } finally {
        setActionLoading(null);
        setConfirmModal({ visible: false, action: '', registrationId: '', userName: '' });
      }
    },
    [],
  );

  const showConfirmDialog = (action: string, registrationId: string, userName: string) => {
    setConfirmModal({ visible: true, action, registrationId, userName });
  };

  const confirmAction = () => {
    if (confirmModal.action === 'remove') {
      handleRemoveParticipant(confirmModal.registrationId);
    }
  };

  const filterRegistrations = useCallback((items: RegistrationWithUser[], query: string) => {
    if (!query.trim()) return items;

    const lowered = query.toLowerCase();
    return items.filter((reg) => {
      const user = reg.user;
      if (!user) return false;

      const name = user.name?.toLowerCase() ?? '';
      const email = user.email?.toLowerCase() ?? '';
      return name.includes(lowered) || email.includes(lowered);
    });
  }, []);

  const currentRegistrations = useMemo(() => {
    const base = registrations.filter((reg) =>
      activeTab === 'pending' ? isPendingStatus(reg.status) : reg.status === 'approved',
    );

    return filterRegistrations(base, searchQuery);
  }, [registrations, activeTab, searchQuery, filterRegistrations]);

  const pendingCount = useMemo(
    () => registrations.filter((reg) => isPendingStatus(reg.status)).length,
    [registrations],
  );

  const approvedCount = useMemo(
    () => registrations.filter((reg) => reg.status === 'approved').length,
    [registrations],
  );

  const renderRegistration = ({ item }: { item: RegistrationWithUser }) => {
    const user = item.user;
    if (!user) return null;

    const isProcessing = actionLoading === item.id;
    const canApprove = isPendingStatus(item.status);
    const canRemove = item.status === 'approved';

    return (
      <ThemedView style={[styles.registrationCard, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
        <ThemedView style={[styles.registrationInfo, { backgroundColor: palette.surface }]}>
          <ThemedView style={[styles.registrationHeader, { backgroundColor: palette.surface }]}>
            <ThemedText style={[styles.registrationName, { color: palette.primary, backgroundColor: palette.surface }]}>
              {user.name ?? 'Unnamed participant'}
            </ThemedText>
          </ThemedView>
          
          <ThemedText style={[styles.registrationEmail, { color: palette.muted, backgroundColor: palette.surface }]}>
            {user.email ?? 'No email provided'}
          </ThemedText>

          <ThemedText style={[styles.registrationDate, { color: palette.muted, backgroundColor: palette.surface }]}>
            Registered on {new Date(item.created_at).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.actionButtons, { backgroundColor: palette.surface }]}>
          {canApprove && (
            <Pressable
              onPress={() => handleApproveRegistration(item.id)}
              disabled={isProcessing}
              style={[styles.actionButton, styles.approveButton, { backgroundColor: palette.primary }]}
            >
              {isProcessing ? (
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
              onPress={() => showConfirmDialog('remove', item.id, user.name ?? 'this participant')}
              disabled={isProcessing}
              style={[styles.actionButton, styles.removeButton, { backgroundColor: '#EF4444' }]}
            >
              {isProcessing ? (
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
      <TouchableOpacity style={styles.backButton} onPress={router.back}>
        <Feather name="arrow-left" size={24} color={palette.primary}  />
      </TouchableOpacity>
      <ThemedView style={[styles.headerContent, { backgroundColor: palette.background }]}>
        <ThemedText style={[styles.headerTitle, { color: palette.primary }]}>
          Event Participants
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: palette.muted }]}>
          {event?.title ?? 'Event overview'}
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

  if (screenLoading && !event) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: palette.background }]}
        edges={['top', 'left', 'right']}
      >
        <ThemedView style={styles.loadingState}>
          <ActivityIndicator size="large" color={palette.primary} />
          <ThemedText style={[styles.loadingText, { color: palette.muted }]}>
            Loading participants...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: palette.background }]}
        edges={['top', 'left', 'right']}
      >
        <ThemedView style={styles.loadingState}>
          <ThemedText style={[styles.loadingText, { color: palette.muted }]}>
            {error ?? 'Event not found'}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const totalRegistrations = registrations.length;

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
              {totalRegistrations}
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

        {error && !screenLoading && (
          <ThemedView
            style={[
              styles.errorBanner,
              {
                backgroundColor: palette.muted + '15',
                borderColor: palette.muted + '30',
              },
            ]}
          >
            <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>{error}</ThemedText>
          </ThemedView>
        )}

        {/* Participants List */}
        <FlatList
          data={currentRegistrations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderRegistration}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <ThemedView style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={palette.primary}
              colors={[palette.primary]}
            />
          }
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
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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

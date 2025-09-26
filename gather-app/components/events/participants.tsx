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
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { EventWithRegistrations, Registration, RegistrationStatus } from '@/constants/types';

// Mock user data for registrations
const mockUsers: { [key: string]: any } = {
  'user456': { id: 'user456', name: 'Mohammed Hassan', email: 'mohammed@example.com' },
  'user789': { id: 'user789', name: 'Fatima Al-Zahra', email: 'fatima@example.com' },
  'user101': { id: 'user101', name: 'Ahmed Al-Mansouri', email: 'ahmed@example.com' },
  'user102': { id: 'user102', name: 'Layla Ibrahim', email: 'layla@example.com' },
};

interface ParticipantsManagerProps {
  event: EventWithRegistrations;
  onEventUpdate: (event: EventWithRegistrations) => void;
}

export default function ParticipantsManager({ event, onEventUpdate }: ParticipantsManagerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; action: string; registrationId: string; userName: string }>({
    visible: false,
    action: '',
    registrationId: '',
    userName: '',
  });
  
  // Dropdown and search states
  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [approvedExpanded, setApprovedExpanded] = useState(true);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [approvedSearchQuery, setApprovedSearchQuery] = useState('');

  const getRegistrationStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case 'registered': return '#10B981';
      case 'pending_payment': return '#F59E0B';
      case 'approved': return '#059669';
      case 'cancelled': return '#EF4444';
      default: return palette.muted;
    }
  };

  const getRegistrationStatusText = (status: RegistrationStatus) => {
    switch (status) {
      case 'registered': return 'Registered';
      case 'pending_payment': return 'Pending Payment';
      case 'approved': return 'Approved';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

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
      onEventUpdate(updatedEvent);
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
      onEventUpdate(updatedEvent);
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

  // Filter registrations based on search query
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

  // Group registrations by status with search filtering
  const pendingRegistrations = useMemo(() => {
    const pending = event.registrations.filter(reg => 
      reg.status === 'registered' || reg.status === 'pending_payment'
    );
    return filterRegistrations(pending, pendingSearchQuery);
  }, [event.registrations, pendingSearchQuery]);

  const approvedRegistrations = useMemo(() => {
    const approved = event.registrations.filter(reg => 
      reg.status === 'approved'
    );
    return filterRegistrations(approved, approvedSearchQuery);
  }, [event.registrations, approvedSearchQuery]);

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

  // Tab Button component for section headers
  const SectionHeader = ({ 
    title, 
    icon, 
    color, 
    count, 
    isExpanded, 
    onToggle 
  }: {
    title: string;
    icon: string;
    color: string;
    count: number;
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.sectionHeaderButton,
        { 
          backgroundColor: palette.surface, 
          borderColor: palette.muted + '30',
          borderBottomColor: isExpanded ? palette.primary : palette.muted + '30'
        }
      ]}
      onPress={onToggle}
    >
      <ThemedView style={[styles.sectionHeaderContent, { backgroundColor: palette.surface }]}>
        <ThemedView style={[styles.sectionHeaderLeft, { backgroundColor: palette.surface }]}>
          <Feather name={icon as any} size={20} color={color} />
          <ThemedText style={[styles.sectionTitle, { color: palette.secondary }]}>
            {title} ({count})
          </ThemedText>
        </ThemedView>
        <Feather 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={palette.muted} 
        />
      </ThemedView>
    </TouchableOpacity>
  );

  // Search Input component
  const SearchInput = ({ 
    placeholder, 
    value, 
    onChangeText 
  }: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
  }) => (
    <ThemedView style={[styles.searchContainer, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
      <Feather name="search" size={16} color={palette.muted} />
      <TextInput
        style={[styles.searchInput, { color: palette.primary }]}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Feather name="x" size={16} color={palette.muted} />
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
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
            {event.registrations.filter(reg => reg.status === 'registered' || reg.status === 'pending_payment').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: palette.muted }]}>
            Pending Approval
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={[styles.statDivider, { backgroundColor: palette.muted + '30' }]} />
        
        <ThemedView style={[styles.statItem, { backgroundColor: palette.surface }]}>
          <ThemedText style={[styles.statNumber, { color: '#10B981' }]}>
            {event.registrations.filter(reg => reg.status === 'approved').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: palette.muted }]}>
            Approved
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Pending Approvals Section */}
      {event.registrations.filter(reg => reg.status === 'registered' || reg.status === 'pending_payment').length > 0 && (
        <ThemedView style={styles.section}>
          <SectionHeader
            title="Pending Approvals"
            icon="clock"
            color="#F59E0B"
            count={event.registrations.filter(reg => reg.status === 'registered' || reg.status === 'pending_payment').length}
            isExpanded={pendingExpanded}
            onToggle={() => setPendingExpanded(!pendingExpanded)}
          />
          
          {pendingExpanded && (
            <>
              <SearchInput
                placeholder="Search pending registrations..."
                value={pendingSearchQuery}
                onChangeText={setPendingSearchQuery}
              />
              
              <FlatList
                data={pendingRegistrations}
                renderItem={renderRegistration}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <ThemedView style={{ height: 12 }} />}
                ListEmptyComponent={
                  pendingSearchQuery.length > 0 ? (
                    <ThemedView style={styles.noResultsContainer}>
                      <ThemedText style={[styles.noResultsText, { color: palette.muted }]}>
                        No pending registrations match your search
                      </ThemedText>
                    </ThemedView>
                  ) : null
                }
              />
            </>
          )}
        </ThemedView>
      )}

      {/* Approved Participants Section */}
      {event.registrations.filter(reg => reg.status === 'approved').length > 0 && (
        <ThemedView style={styles.section}>
          <SectionHeader
            title="Approved Participants"
            icon="users"
            color="#10B981"
            count={event.registrations.filter(reg => reg.status === 'approved').length}
            isExpanded={approvedExpanded}
            onToggle={() => setApprovedExpanded(!approvedExpanded)}
          />
          
          {approvedExpanded && (
            <>
              <SearchInput
                placeholder="Search approved participants..."
                value={approvedSearchQuery}
                onChangeText={setApprovedSearchQuery}
              />
              
              <FlatList
                data={approvedRegistrations}
                renderItem={renderRegistration}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <ThemedView style={{ height: 12 }} />}
                ListEmptyComponent={
                  approvedSearchQuery.length > 0 ? (
                    <ThemedView style={styles.noResultsContainer}>
                      <ThemedText style={[styles.noResultsText, { color: palette.muted }]}>
                        No approved participants match your search
                      </ThemedText>
                    </ThemedView>
                  ) : null
                }
              />
            </>
          )}
        </ThemedView>
      )}

      {/* Empty State */}
      {event.registrations.length === 0 && (
        <ThemedView style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
          <Feather name="users" size={48} color={palette.muted} />
          <ThemedText style={[styles.emptyStateTitle, { color: palette.primary }]}>
            No registrations yet
          </ThemedText>
          <ThemedText style={[styles.emptyStateText, { color: palette.muted }]}>
            When people register for your event, they'll appear here for approval.
          </ThemedText>
        </ThemedView>
      )}

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionHeaderButton: {
    borderWidth: 1,
    borderRadius: 8,
    borderBottomWidth: 2,
    marginBottom: 12,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
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
    borderWidth: 1,
    borderRadius: 12,
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
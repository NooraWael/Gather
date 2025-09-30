import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MyEventCard from '@/components/events/MyEventCard';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type {
  EventWithRegistrations,
  MyEventCardProps,
  RegistrationStatus,
} from '@/constants/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import SimpleTopNavigation from '@/components/header/topHeaderMyEvents';
import { getEventsCreatedByUser, getJoinedEventsForUser } from '@/services/event';
import { getCurrentUserId } from '@/services/user';

type TabType = 'created' | 'joined';

const formatEventDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatEventTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const mapJoinedRegistrationStatus = (
  status?: RegistrationStatus,
): MyEventCardProps['status'] => {
  if (!status) return 'pending approval';

  if (status === 'approved') {
    return 'registered';
  }

  return 'pending approval';
};

const toCreatedEventCard = (event: EventWithRegistrations): MyEventCardProps => ({
  id: event.id,
  title: event.title,
  date: formatEventDate(event.date_time),
  time: formatEventTime(event.date_time),
  location: event.location,
  capacity: event.capacity,
  attendees: event.current_attendees,
  price: event.is_paid ? 'Paid' : 'Free',
  image: event.image_url,
  category: event.category,
  isCreated: true,
  status: event.status,
});

const toJoinedEventCard = (
  event: EventWithRegistrations,
): MyEventCardProps | null => {
  if (!event.user_registration) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    date: formatEventDate(event.date_time),
    time: formatEventTime(event.date_time),
    location: event.location,
    capacity: event.capacity,
    attendees: event.current_attendees,
    price: event.is_paid ? 'Paid' : 'Free',
    image: event.image_url,
    category: event.category,
    isCreated: false,
    status: mapJoinedRegistrationStatus(event.user_registration.status),
  };
};

export default function MyEventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabType>('created');
  const [createdEvents, setCreatedEvents] = useState<MyEventCardProps[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<MyEventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

const loadEvents = useCallback(async () => {
  try {
    console.log('Loading events started...');
    setError(null);

    let resolvedUserId = userId;
    if (!resolvedUserId) {
      console.log('Getting current user ID...');
      resolvedUserId = await getCurrentUserId();
      console.log('Got user ID:', resolvedUserId);

      if (!isMountedRef.current) return;

      if (!resolvedUserId) {
        console.log('No user ID found');
        setError('Please sign in to manage your events.');
        setCreatedEvents([]);
        setJoinedEvents([]);
        return;
      }

      setUserId(resolvedUserId);
    }

    console.log('Fetching events for user:', resolvedUserId);
    const [created, joined] = await Promise.all([
      getEventsCreatedByUser(resolvedUserId),
      getJoinedEventsForUser(resolvedUserId),
    ]);
    
    console.log('Created events:', created.length);
    console.log('Joined events:', joined.length);

    if (!isMountedRef.current) return;

    setCreatedEvents(created.map(toCreatedEventCard));
    setJoinedEvents(
      joined
        .map(toJoinedEventCard)
        .filter((event): event is MyEventCardProps => event !== null),
    );
  } catch (err) {
    console.error('Failed to load user events:', err);
    if (!isMountedRef.current) return;
    setError('Unable to load your events right now.');
  }
}, [userId]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      await loadEvents();
      if (isMountedRef.current) {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [loadEvents]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    if (isMountedRef.current) {
      setRefreshing(false);
    }
  }, [loadEvents]);

  const currentEvents = useMemo(
    () => (activeTab === 'created' ? createdEvents : joinedEvents),
    [activeTab, createdEvents, joinedEvents],
  );

  const TabButton = ({ 
    title, 
    isActive, 
    onPress 
  }: { 
    title: string; 
    isActive: boolean; 
    onPress: () => void; 
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
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <SimpleTopNavigation />
      
      {/* Tab Header */}
      <View style={styles.tabContainer}>
        <TabButton
          title="My Created Events"
          isActive={activeTab === 'created'}
          onPress={() => setActiveTab('created')}
        />
        <TabButton
          title="Events I'm Joining"
          isActive={activeTab === 'joined'}
          onPress={() => setActiveTab('joined')}
        />
      </View>

      <FlatList
        data={currentEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.secondary }]}>
              {activeTab === 'created' 
                ? `${currentEvents.length} Created Events` 
                : `${currentEvents.length} Joined Events`
              }
            </Text>
            {error && !loading && currentEvents.length > 0 && (
              <Text style={styles.errorMessage}>
                {error}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={[styles.emptyText, { color: palette.text }]}>
                  Loading your events...
                </Text>
                <Text style={[styles.emptyDescription, { color: palette.muted }]}>
                  Checking for the latest updates
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.emptyText, { color: palette.text }]}>
                  {error
                    ? error
                    : activeTab === 'created'
                      ? "You haven't created any events yet"
                      : "You haven't joined any events yet"}
                </Text>
                {!error && (
                  <Text style={[styles.emptyDescription, { color: palette.muted }]}>
                    {activeTab === 'created'
                      ? 'Tap the plus button to host your first event.'
                      : 'Explore events and register to see them here.'}
                  </Text>
                )}
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MyEventCard {...item} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  listContent: {
    paddingBottom: 120,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  errorMessage: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});

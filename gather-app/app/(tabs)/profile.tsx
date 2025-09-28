import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStorage } from '@/utils/async';
import { router } from 'expo-router';
import { 
  getCurrentUserProfile, 
  getUserStats, 
  getUserUpcomingEvents,
  deleteUserAccount,
  UserProfile, 
  UserStats, 
  UserRegistrationWithEvent 
} from '@/services/user';
import { signOut } from '@/services/auth';
import { supabase } from '@/services/supabase';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ eventsHosting: 0, joinedEvents: 0, peopleConnected: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<UserRegistrationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 const fetchUserData = async () => {
  try {
    // First check if user is logged in according to AsyncStorage
    const isUserLoggedIn = await AuthStorage.isLoggedIn(); // Changed this line
    const storedUserInfo = await AuthStorage.getUserInfo();
       console.log('AsyncStorage - isLoggedIn:', isUserLoggedIn);
    console.log('AsyncStorage - userInfo:', storedUserInfo);
    
    if (!isUserLoggedIn) {
      router.replace('/auth/login');
      return;
    }

     const { data: { user } } = await supabase.auth.getUser();
    console.log('Supabase auth user:', user?.id, user?.email);
    
    

    // Wait a moment for Supabase to restore session
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userProfile = await getCurrentUserProfile();
    
    if (!userProfile) {
      // Only redirect to login if both AsyncStorage says logged out AND no profile
      const stillLoggedIn = await AuthStorage.isLoggedIn(); // And this line
      if (!stillLoggedIn) {
        router.replace('/auth/login');
        return;
      }
      
      // Profile doesn't exist but user should be logged in - handle gracefully
      Alert.alert('Profile Error', 'Unable to load your profile. Please try again.');
      return;
    }

    setProfile(userProfile);

    const [userStats, userEvents] = await Promise.all([
      getUserStats(userProfile.id),
      getUserUpcomingEvents(userProfile.id)
    ]);

    setStats(userStats);
    setUpcomingEvents(userEvents);
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Check AsyncStorage before redirecting on error
    const isUserLoggedIn = await AuthStorage.isLoggedIn(); // And this line
    if (!isUserLoggedIn) {
      router.replace('/auth/login');
    } else {
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const getStatusPillStyle = (statusType: string, isHosting: boolean) => {
    if (isHosting) {
      return { backgroundColor: palette.primary };
    }
    return { backgroundColor: palette.accent };
  };

  const formatEventDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `${month} ${day} • ${time}`;
  };

  const getStatusText = (registration: UserRegistrationWithEvent) => {
    const isHosting = registration.event.created_by === profile?.id;
    return isHosting ? 'Hosting' : 'Registered';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMemberSinceText = (createdAt: string) => {
    const date = new Date(createdAt);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `Joined ${month} ${year}`;
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              await AuthStorage.clearAuthData();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, events, and connections will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure you want to delete your account? This cannot be undone.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const success = await deleteUserAccount();
                      if (success) {
                        await AuthStorage.clearAuthData();
                        router.replace('/auth/login');
                      } else {
                        Alert.alert('Error', 'Failed to delete account. Please try again.');
                      }
                    } catch (error) {
                      console.error('Account deletion failed:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={[styles.loadingText, { color: palette.muted }]}>Loading your profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.background }]}>
        <Text style={[styles.errorText, { color: palette.muted }]}>Failed to load profile</Text>
      </View>
    );
  }

  const statsData = [
    { label: 'Events Hosting', value: stats.eventsHosting },
    { label: 'Joined Events', value: stats.joinedEvents },
    { label: 'People Connected', value: stats.peopleConnected },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={palette.primary}
        />
      }
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Profile Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
          <View style={[styles.avatar, { backgroundColor: palette.primary }]}>
            <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
          </View>

          <View style={[styles.profileContent, { backgroundColor: palette.surface }]}>
            <Text style={[styles.name, { color: palette.text }]}>{profile.name}</Text>
            <Text style={[styles.email, { color: palette.muted }]}>{profile.email}</Text>
            
            <View style={[styles.metaContainer, { backgroundColor: palette.surface }]}>
              {profile.location && (
                <View style={[styles.metaRow, { backgroundColor: palette.surface }]}>
                  <Feather name="map-pin" size={14} color={palette.muted} />
                  <Text style={[styles.metaText, { color: palette.muted }]}>{profile.location}</Text>
                </View>
              )}
              <View style={[styles.metaRow, { backgroundColor: palette.surface }]}>
                <Feather name="calendar" size={14} color={palette.muted} />
                <Text style={[styles.metaText, { color: palette.muted }]}>{getMemberSinceText(profile.created_at)}</Text>
              </View>
            </View>
            
            {profile.bio && (
              <Text style={[styles.bio, { color: palette.text }]}>{profile.bio}</Text>
            )}
          </View>
        </View>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Interests</Text>
            <View style={styles.chipContainer}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={[styles.chip, { backgroundColor: palette.surface, borderColor: palette.muted + '40' }]}>
                  <Text style={[styles.chipText, { color: palette.text }]}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Your Impact</Text>
          <View style={styles.statsRow}>
            {statsData.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: palette.surface, borderColor: palette.muted + '30' }]}>
                <Text style={[styles.statValue, { color: palette.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: palette.muted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Plans */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Upcoming Plans</Text>
            <View style={styles.upcomingPlansContainer}>
              {upcomingEvents.slice(0, 3).map((registration) => {
                const isHosting = registration.event.created_by === profile.id;
                return (
                  <View
                    key={registration.id}
                    style={[
                      styles.eventCard,
                      { backgroundColor: palette.surface, borderColor: palette.muted + '30' }
                    ]}
                  >
                    <View style={[styles.eventContent, { backgroundColor: palette.surface }]}>
                      <View style={[styles.eventHeader, { backgroundColor: palette.surface }]}>
                        <Text style={[styles.eventTitle, { color: palette.text }]} numberOfLines={2}>
                          {registration.event.title}
                        </Text>
                        <View style={[styles.statusPill, getStatusPillStyle(registration.status, isHosting)]}>
                          <Text style={styles.statusText}>{getStatusText(registration)}</Text>
                        </View>
                      </View>
                      
                      <View style={[styles.eventMetaContainer, { backgroundColor: palette.surface }]}>
                        <View style={[styles.metaRow, { backgroundColor: palette.surface }]}>
                          <Feather name="calendar" size={14} color={palette.secondary} />
                          <Text style={[styles.eventMeta, { color: palette.muted }]}>
                            {formatEventDate(registration.event.date_time)}
                          </Text>
                        </View>
                        <View style={[styles.metaRow, { backgroundColor: palette.surface }]}>
                          <Feather name="map-pin" size={14} color={palette.secondary} />
                          <Text style={[styles.eventMeta, { color: palette.muted }]} numberOfLines={1}>
                            {registration.event.location}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Account</Text>
          
          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.actionButton,
              styles.logoutButton,
              { 
                backgroundColor: palette.surface,
                borderColor: palette.muted + '40',
                opacity: pressed ? 0.7 : 1
              }
            ]}
          >
            <Feather name="log-out" size={20} color={palette.secondary} />
            <Text style={[styles.actionButtonText, { color: palette.text }]}>Logout</Text>
          </Pressable>

          {/* Delete Account Button */}
          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              { 
                backgroundColor: '#FEF2F2',
                borderColor: '#FCA5A5',
                opacity: pressed ? 0.7 : 1
              }
            ]}
          >
            <Feather name="trash-2" size={20} color="#DC2626" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
    gap: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 32,
    color: '#fff',
  },
  profileContent: {
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    textAlign: 'center',
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  bio: {
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  section: {
    gap: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 0,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  profileHeaderCard: {
    borderRadius: 0,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 30,
  },
  upcomingPlansContainer: {
    gap: 16,
  },
  eventCard: {
    borderRadius: 0,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  eventContent: {
    gap: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eventTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    flex: 1,
    lineHeight: 24,
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  eventMetaContainer: {
    gap: 8,
  },
  eventMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 0,
    gap: 12,
    marginBottom: 12,
  },
  logoutButton: {
    // Styles handled dynamically in component
  },
  deleteButton: {
    // Delete-specific styles handled in component
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#DC2626',
  },
});
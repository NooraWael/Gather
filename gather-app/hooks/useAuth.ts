import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { AuthStorage } from '@/utils/async';

export function useAuthCheck() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await AuthStorage.isLoggedIn();
      setIsAuthenticated(loggedIn);
      
      // Check if we're in a protected route
      const inAuthGroup = segments[0] === 'auth';
      const inProtectedRoute = segments[0] === '(tabs)' || segments[0] === 'event';
      
      if (!loggedIn && inProtectedRoute) {
        // User is not logged in but trying to access protected route
        router.replace('/auth/login');
      } else if (loggedIn && inAuthGroup) {
        // User is logged in but on auth screen
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, assume not authenticated
      setIsAuthenticated(false);
      router.replace('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    checkAuthStatus, // Expose for manual refresh
  };
}
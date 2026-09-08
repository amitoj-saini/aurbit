import { Redirect, Stack } from 'expo-router';
import Loader from '@/components/ui/loader';
import { useAuth } from '@/context/auth-context';

export default function Layout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
        headerShown: false,
        animation: "slide_from_left"
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="myaccount"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="manageusers"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}

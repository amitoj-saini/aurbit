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
        animation: "none"
      }}>
      <Stack.Screen name="aurbit" />
      <Stack.Screen name="settings" />
    </Stack>
      
  );
}

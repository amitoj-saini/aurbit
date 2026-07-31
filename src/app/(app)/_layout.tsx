import { Stack } from 'expo-router';

export default function Layout() {
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

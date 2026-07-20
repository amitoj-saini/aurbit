import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
        headerShown: false,
      }}>
      <Stack.Screen name="setup" />
      <Stack.Screen name="initialize" />
    </Stack>
  );
}

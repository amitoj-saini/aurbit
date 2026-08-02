import { Stack } from 'expo-router';

export default function Layout() {
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
    </Stack>
  );
}

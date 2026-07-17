import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="setup"
        options={{
          headerBackVisible: false,
          headerShown: false,
        }}
      />
    </Stack>
  );
}

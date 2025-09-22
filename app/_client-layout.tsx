import { Stack } from "expo-router";

export default function ClientLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />

      <Stack.Screen name="sign-up/verify-email" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up/create-account" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/verification-success" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/personal-info" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/confirm-bvn" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/verify-identity" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/confirm-address" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/take-selfie" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/take-a-selfie-camera" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/contribution-scheme" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />
      <Stack.Screen name="sign-up/onboarding" options={{
        headerShown: false,
        gestureEnabled: false,
        headerBackVisible: false,
      }} />

      <Stack.Screen name="incomplete-kyc/confirm-address-kyc" options={{ headerShown: false }} />
      <Stack.Screen name="incomplete-kyc/verify-identity-kyc" options={{ headerShown: false }} />

      <Stack.Screen name="sign-in/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />

      <Stack.Screen name="payment-setup/card-info" options={{ headerShown: false }} />
      <Stack.Screen name="payment-setup/payment-method" options={{ headerShown: false }} />
      <Stack.Screen name="payment-setup/confirm-beneficiary" options={{ headerShown: false }} />
      <Stack.Screen name="payment-setup/withdraw-setup" options={{ headerShown: false }} />

      <Stack.Screen name="loan-setup/loan-application" options={{ headerShown: false }} />
      <Stack.Screen name="loan-setup/loan-application-success" options={{ headerShown: false }} />

      <Stack.Screen name="withdrawal-setup/withdrawal-application-success" options={{ headerShown: false }} />

      <Stack.Screen name="profile/profile-setting" options={{ headerShown: false }} />
      <Stack.Screen name="profile/update-password-setting" options={{ headerShown: false }} />
      <Stack.Screen name="profile/verify-card-otp" options={{ headerShown: false }} />
      <Stack.Screen name="profile/update-card-info" options={{ headerShown: false }} />
      <Stack.Screen name="profile/payment-setting" options={{ headerShown: false }} />
      <Stack.Screen name="profile/notification" options={{ headerShown: false }} />
      <Stack.Screen name="profile/verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="profile/setting-success" options={{ headerShown: false }} />

      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

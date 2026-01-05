import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const rawData = await AsyncStorage.getItem("data");
        const seenOnboarding = await AsyncStorage.getItem("seenOnboarding");
        const parsedData = rawData ? JSON.parse(rawData) : null;

        const now = Date.now();
        const FIVE_MIN = 15 * 60 * 1000;
        if (parsedData?.accessToken) {
          if (now - (parsedData.loginTime || 0) > FIVE_MIN) {
            await AsyncStorage.removeItem("data");
            router.replace("/sign-in/login");
            return;
          }
          if (parsedData.onboardingStatus === "InProgress") {
            router.replace("/sign-in/welcome-onboarding");
          }
          if (parsedData.isKycComplete) {
            router.replace("/(tabs)/dashboard");
          } else {
            router.replace("/sign-up/personal-info");
          }
        } else if (seenOnboarding === "user-onboarded-success") {
          router.replace("/sign-in/login");
        } else {
          router.replace("/sign-up/onboarding");
        }
      } catch (error) {
        console.error("Navigation error:", error);
        router.replace("/sign-up/onboarding");
      }
    };
    init();
  }, [router]);

  return null;
}

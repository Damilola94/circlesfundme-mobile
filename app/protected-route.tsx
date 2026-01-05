import Loader from "@/components/ui/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const rawData = await AsyncStorage.getItem("data");
        const seenOnboarding = await AsyncStorage.getItem("seenOnboarding");
        const parsedData = rawData ? JSON.parse(rawData) : null;

        const now = Date.now();
        const FIFTEEN_MIN = 15 * 60 * 1000;

        if (parsedData?.accessToken) {
          if (parsedData.loginTime && now - parsedData.loginTime > FIFTEEN_MIN) {
            await AsyncStorage.removeItem("data");
            router.replace("/sign-in/login");
            return;
          }
          if (parsedData.onboardingStatus === "InProgress") {
            router.replace("/sign-in/welcome-onboarding");
            return;
          }
          if (!parsedData.isKycComplete) {
            router.replace("/sign-up/personal-info");
            return;
          }
          return;
        }
        if (seenOnboarding === "user-onboarded-success") {
          router.replace("/sign-in/login");
          return;
        }
        router.replace("/sign-up/onboarding");
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/sign-up/onboarding");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <Loader message="Loading..." />;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
}

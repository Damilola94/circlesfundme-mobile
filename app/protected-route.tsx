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
console.log(seenOnboarding, "seenOnboarding - protected route");

        const now = Date.now();
        const FIFTEEN_MIN = 15 * 60 * 1000;

        if (parsedData?.accessToken) {
          // ✅ Expired session
          if (now - (parsedData.loginTime || 0) > FIFTEEN_MIN) {
            await AsyncStorage.removeItem("data");
            router.replace("/sign-in/login");
            return;
          }

          // ✅ Redirect based on KYC status
          if (parsedData.isKycComplete) {
            // let user access protected children
          } else {
            router.replace("/sign-up/personal-info");
            return;
          }
        } else if (seenOnboarding === "user-onboarded-success") {
          // ✅ User finished onboarding but no session
          router.replace("/sign-in/login");
          return;
        } else {
          // ✅ New user
          router.replace("/sign-up/onboarding");
          return;
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/sign-up/onboarding");
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <Loader message="Loading..." />;
  }

  // ✅ Only render children if user is logged in & KYC complete
  return <View style={{ flex: 1 }}>{children}</View>;
}

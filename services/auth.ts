import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/sign-in/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return logout;
}

import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
// import "react-native-reanimated";

import SplashProvider from "@/providers/SplashProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import ClientLayout from "./_client-layout";

const queryClient = new QueryClient({});

export default function RootLayout() {
  const [loaded] = useFonts({
    OutfitBlack: require("../assets/fonts/OutfitBlack.ttf"),
    OutfitBold: require("../assets/fonts/OutfitBold.ttf"),
    OutfitExtraBold: require("../assets/fonts/OutfitExtraBold.ttf"),
    OutfitExtraLight: require("../assets/fonts/OutfitExtraLight.ttf"),
    OutfitLight: require("../assets/fonts/OutfitLight1.ttf"),
    OutfitMedium: require("../assets/fonts/OutfitMedium.ttf"),
    OutfitRegular: require("../assets/fonts/OutfitRegular.ttf"),
    OutfitSemiBold: require("../assets/fonts/OutfitSemiBold.ttf"),
    OutfitVariable: require("../assets/fonts/OutfitVariableFont_wght1.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SplashProvider>
        <ClientLayout />
        <Toast />
        <StatusBar style="dark" />
      </SplashProvider>
    </QueryClientProvider>
  );
}

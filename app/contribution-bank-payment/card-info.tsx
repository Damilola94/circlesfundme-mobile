import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import handleFetch from "@/services/api/handleFetch";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function CardInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { url } = useLocalSearchParams();

  const handleCancelAndCompareWallet = async () => {
    const previousWallet = queryClient.getQueryData<any>([
      "financials-my-wallets",
    ]);

    await queryClient.invalidateQueries({
      queryKey: ["financials-my-wallets"],
    });

    const res = await handleFetch({
      endpoint: "financials/my-wallets",
      auth: true,
    });

    const latestWallet = res;

    if (!latestWallet?.data || !previousWallet?.data) {
      router.back();
      return;
    }

    const getContributionBalance = (walletRes: any) =>
      walletRes?.data?.find((item: any) => item.title === "Your contribution")
        ?.balance ?? "";

    const prevBalance = getContributionBalance(previousWallet);
    const newBalance = getContributionBalance(latestWallet);

    queryClient.setQueryData(["financials-my-wallets"], latestWallet);

    if (prevBalance !== newBalance) {
      router.push("/(tabs)/dashboard");
      queryClient.invalidateQueries({ queryKey: ["financials-my-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
    } else {
      router.back();
      queryClient.invalidateQueries({ queryKey: ["financials-my-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url: currentUrl } = navState;
    if (currentUrl.includes("success") || currentUrl.includes("callback")) {
      router.push("/(tabs)/dashboard");
    }
  };

  return (
    <View style={[styles.container, { marginTop: insets.top || 40 }]}>
      <TouchableOpacity
        onPress={handleCancelAndCompareWallet}
        style={styles.closeButton}
      >
        <AntDesign name="close-circle" size={24} color="#333" />
      </TouchableOpacity>
      <WebView
        source={{ uri: url as string }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    marginLeft: "auto",
    marginBottom: 10,
    padding: 10,
  },
});

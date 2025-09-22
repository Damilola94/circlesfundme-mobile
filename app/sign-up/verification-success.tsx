import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/ui/Buttton";

export default function VerificationSuccess() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();

  const loginMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "auth/login",
        method: "POST",
        body: { email, password },
      }),
    onSuccess: async (response) => {
      try {
        const { data } = response || {};
        if (!data?.accessToken) throw new Error("Invalid token response");
        const sessionData = {
          ...data,
          loginTime: Date.now(),
          isKycComplete: false,
        };
        await AsyncStorage.setItem("data", JSON.stringify(sessionData));
        await AsyncStorage.setItem("seenOnboarding", "user-onboarded-success");
        router.replace("/sign-up/personal-info");
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Storage Error",
          text2: (err as Error)?.message || "Could not save login data",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleContinue = () => {
    loginMutation.mutate();
  };

  return (
    <View style={{ flex: 1 }}>
      {loginMutation.isPending && <Loader />}
      <View style={[styles.container, { marginTop: insets.top || 40 }]}>
        <View style={{ alignItems: "center" }}>
          <Ionicons
            name="checkmark-circle-outline"
            size={200}
            color={Colors.dark.primary}
          />
          <Text style={styles.title}>Verification Successful</Text>
          <Text style={styles.subtitle}>Now Let’s Set You Up.</Text>
        </View>

        <View style={{ marginBottom: resHeight(10) }} />

        <Button
          title="Proceed to Onboarding"
          onPress={handleContinue}
          iconRight={
            <FontAwesome6 name="arrow-right-long" size={24} color="white" />
          }
          disabled={loginMutation.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  image: { width: 150, height: 150, marginBottom: 30 },
  title: {
    fontSize: resFont(25),
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "OutfitMedium",
  },
  subtitle: {
    textAlign: "left",
    fontSize: resFont(12),
    marginTop: 10,
    color: Colors.dark.textLight,
    marginBottom: resHeight(5),
    fontFamily: "OutfitRegular",
  },
});

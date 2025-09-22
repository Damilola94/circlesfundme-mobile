/* eslint-disable import/no-unresolved */
import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function ForgetPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [emailOrPhone, setEmailOrPhone] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: (payload: { emailOrPhone: string }) =>
      handleFetch({
        endpoint: "auth/forgot-password",
        method: "POST",
        body: { email: payload.emailOrPhone },
      }),
    onSuccess: (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Request Failed",
          text2: res?.message || "Please try again later",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Reset Link Sent",
        text2: "Follow the instructions sent to your email or phone",
      });
      router.replace({
        pathname: "/auth/reset-password",
        params: {
          emailOrPhone,
        },
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error?.message || "Please check your input",
      });
    },
  });

  const handleContinue = () => {
    if (!emailOrPhone) {
      Toast.show({
        type: "error",
        text1: "Email or phone number is required",
      });
      return;
    }

    forgotPasswordMutation.mutate({ emailOrPhone });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        {forgotPasswordMutation.isPending && <Loader />}
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <Text style={styles.headerText}>Forgot Password</Text>
          <Text style={styles.subText}>
            Reset your password to regain access
          </Text>

          <Input
            label="Email or Phone Number"
            value={emailOrPhone}
            placeholder="Enter your email or phone number"
            onChangeText={setEmailOrPhone}
          />

          <View style={{ marginVertical: resHeight(3) }} />

          <Button
            title={
              forgotPasswordMutation.isPending ? "Processing..." : "Continue"
            }
            onPress={handleContinue}
            disabled={forgotPasswordMutation.isPending}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerText: {
    fontSize: resFont(30),
    fontWeight: "500",
    textAlign: "left",
    fontFamily: "OutfitMedium",
  },
  subText: {
    fontSize: resFont(12),
    color: Colors.dark.textLight,
    marginTop: 5,
    fontFamily: "OutfitRegular",
    marginBottom: resHeight(4),
  },
});

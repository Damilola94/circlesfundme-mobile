import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import Loader from "@/components/ui/Loader";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function ResetPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { emailOrPhone } = useLocalSearchParams<{
    emailOrPhone: string;
  }>();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPasswordMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "auth/reset-password",
        method: "POST",
        body,
      }),
    onSuccess: async (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Reset Failed",
          text2: res?.message || "Unable to reset password",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Password Reset Successful",
        text2: "You can now log in",
      });
      router.replace("/sign-in/login");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleReset = () => {
    if (!otp || !newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "All fields are required" });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "Password must be at least 6 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
      });
      return;
    }
    const payload = {
      email: emailOrPhone,
      otp,
      newPassword,
    };
    resetPasswordMutation.mutate(payload);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        {resetPasswordMutation.isPending && <Loader />}
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <Text style={styles.headerText}>Reset Password</Text>
          <Input
            label="OTP"
            value={otp}
            placeholder="Enter the OTP sent to your email/phone"
            onChangeText={setOtp}
            keyboardType="number-pad"
            secureTextEntry
          />

          <Input
            label="New Password"
            value={newPassword}
            placeholder="Enter New Password"
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            placeholder="Confirm New Password"
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={{ marginVertical: resHeight(3) }} />

          <Button
            title={
              resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"
            }
            onPress={handleReset}
            disabled={resetPasswordMutation.isPending}
          />

          <View style={styles.groupText}>
            <Text style={styles.footerText}>Back to </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in/login")}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerText: {
    fontSize: resFont(30),
    fontFamily: "OutfitMedium",
    textAlign: "left",
    marginBottom: resHeight(3),
  },
  footerText: {
    textAlign: "center",
    fontSize: resFont(12),
    color: Colors.dark.background,
    fontFamily: "OutfitRegular",
  },
  footerLink: {
    color: Colors.dark.primary,
    fontWeight: "500",
    fontFamily: "OutfitBold",
  },
  groupText: {
    flexDirection: "row",
    marginTop: resHeight(4),
    justifyContent: "center",
  },
});

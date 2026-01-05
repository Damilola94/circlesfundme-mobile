import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight, resWidth } from "@/utils/utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import Button from "../../components/ui/Buttton";
import OTPInput from "../../components/ui/OTPInput";

export default function VerifyEmail() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const insets = useSafeAreaInsets();
  const { email, password, confirmPassword } = useLocalSearchParams<{
    email: string;
    password: string;
    confirmPassword: string;
  }>();

  const verifyMutation = useMutation({
    mutationFn: (otp: string) =>
      handleFetch({
        endpoint: "accounts/create-new",
        method: "POST",
        body: {
          email,
          password,
          confirmPassword,
          otp,
        },
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Email verified successfully",
      });
      router.replace({
        pathname: "/sign-up/verification-success",
        params: {
          email,
          password,
          confirmPassword,
        },
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "auth/resend-otp",
        method: "POST",
        body: { email },
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "OTP resent successfully",
      });
      setTimer(30);
      setCanResend(false);
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to resend OTP",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleVerify = () => {
    const trimmedOtp = otp?.trim();
    if (!trimmedOtp) {
      Toast.show({ type: "error", text1: "Please enter the OTP" });
      return;
    }
    if (trimmedOtp.length !== 6) {
      Toast.show({ type: "error", text1: "OTP must be exactly 6 digits" });
      return;
    }
    if (!/^\d{6}$/.test(trimmedOtp)) {
      Toast.show({ type: "error", text1: "OTP must contain only numbers" });
      return;
    }
    verifyMutation.mutate(trimmedOtp);
  };

  useEffect(() => {
    let countdown: ReturnType<typeof setInterval>;
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        {verifyMutation.isPending && <Loader />}
        {resendOtpMutation.isPending && <Loader />}
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <Text style={styles.verifyEmailText}>Verify Email Address</Text>
          <Text style={styles.verifyEmailSubText}>
            Kindly enter the 6-digit verification code sent to{" "}
            <Text style={{ fontWeight: "600", fontFamily: "OutfitBold" }}> {email}.</Text>
          </Text>
          <OTPInput value={otp} setValue={setOtp} />
          <View style={{ marginBottom: resHeight(10) }} />
          <Button
            title={verifyMutation.isPending ? "Verifying..." : "Verify"}
            onPress={handleVerify}
            disabled={verifyMutation.isPending}
          />
          <View style={styles.groupText}>
            <Text style={styles.resend}>Didn’t get an OTP? </Text>
            {canResend ? (
              <TouchableOpacity onPress={() => resendOtpMutation.mutate()}>
                <Text style={[styles.resend, { color: Colors.dark.primary }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.resend, { color: Colors.dark.primary }]}>
                Resend in {timer}s
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  verifyEmailText: {
    textAlign: "left",
    fontSize: resFont(30),
    fontWeight: "500",
    fontFamily: "OutfitMedium",
  },
  backButton: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    padding: resWidth(2.5),
    width: 40,
    height: 40,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: resHeight(2),
  },
  verifyEmailSubText: {
    textAlign: "left",
    fontSize: resFont(12),
    marginTop: 10,
    color: Colors.dark.textLight,
    marginBottom: resHeight(5),
    fontFamily: "OutfitRegular",
  },

  headerRow: {
    flexDirection: "row",
    fontFamily: "OutfitRegular",
    alignItems: "center",
    marginBottom: resHeight(2),
  },
  groupText: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: resHeight(2),
  },
  resend: {
    fontSize: resFont(12),
    fontFamily: "OutfitRegular",
    color: Colors.dark.textLight,
  },
});

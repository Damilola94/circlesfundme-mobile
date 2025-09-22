 
import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight, resWidth } from "@/utils/utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const { withdrawalSettingId, accountNumber, bankCode, email } =
    useLocalSearchParams<{
      withdrawalSettingId: string;
      accountNumber: string;
      bankCode: string;
      email: string;
    }>();
  const [otp, setOtp] = useState("");
  const insets = useSafeAreaInsets();
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData(["users-me"]) as {
    data?: {
      email: string;
    };
  };

  const updateWithdrawalMutation = useMutation({
    mutationFn: (payload: {
      withdrawalSettingId: string;
      accountNumber: string;
      bankCode: string;
      otp: string;
    }) =>
      handleFetch({
        endpoint: "users/update-withdrawal-setting",
        method: "PUT",
        auth: true,
        body: payload,
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Withdrawal setting updated",
      });
      router.push("/profile/setting-success");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to verify OTP",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleVerify = () => {
    if (!otp || otp.length < 6) {
      Toast.show({
        type: "error",
        text1: "Please enter a valid OTP",
      });
      return;
    }

    updateWithdrawalMutation.mutate({
      withdrawalSettingId,
      accountNumber,
      bankCode,
      otp,
    });
  };

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
        {updateWithdrawalMutation.isPending && <Loader />}
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
          <Text style={styles.verifyEmailText}>OTP Verification</Text>
          <Text style={styles.verifyEmailSubText}>
            Kindly enter the 6-digit verification code sent to{" "}
            <Text style={{ fontFamily: "OutfitSemiBold" }}>
              {userData.data?.email}
            </Text>{" "}
            to save this change
          </Text>
          <Text style={styles.subtitle}></Text>
          <OTPInput value={otp} setValue={setOtp} />
          <View style={{ marginBottom: resHeight(10) }} />
          <Button title="Verify" onPress={handleVerify} />
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
  title: { fontSize: 22, fontWeight: "500", marginBottom: 10 },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "OutfitRegular",
  },
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
  resend: { marginTop: 20, textAlign: "center", fontFamily: "OutfitRegular" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: resHeight(2),
  },
  groupText: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: resHeight(2),
  },
});

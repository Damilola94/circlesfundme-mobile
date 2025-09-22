import Button from "@/components/ui/Buttton";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resHeight } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function VerifyCardOtpScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const insets = useSafeAreaInsets();

  const verifyOtpMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "users/update-linked-card",
        method: "POST",
        body: { otp },
        auth: true,
      }),
    onSuccess: (res: any) => {
      if (res?.statusCode === "200" || res?.status === 200) {
        Toast.show({
          type: "success",
          text1: "OTP Verified",
          text2: "Your OTP has been successfully verified",
        });
        router.push({
          pathname: "/profile/update-card-info",
          params: {
            url: res?.data?.authorizationUrl,
            reference: res?.data?.reference,
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: res?.message || "Please try again later",
        });
      }
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.message || "Something went wrong",
      });
    },
  });

  return (
    <View style={{ flex: 1 }}>
      {verifyOtpMutation.isPending && <Loader />}
      <View style={[styles.container, { marginTop: insets.top || 40 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Card Settings</Text>
        </View>
        <Input
          label="OTP"
          placeholder="Enter the OTP sent to your email"
          value={otp}
          onChangeText={setOtp}
          secureTextEntry
          keyboardType="numeric"
        />
        <View style={{ marginTop: resHeight(4) }}>
          <Button title="Verify" onPress={() => verifyOtpMutation.mutate()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    position: "relative",
    marginBottom: resHeight(3),
  },
  backButton: {
    position: "absolute",
    left: 0,
    backgroundColor: Colors.dark.text,
    borderRadius: 20,
    width: 40,
    height: 40,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "OutfitMedium",
    color: "#000",
  },
});

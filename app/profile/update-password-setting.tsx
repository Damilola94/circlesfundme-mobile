
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resHeight } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function UpdatePassword() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [otp, setOTP] = useState("");
  const [nPassword, setNPassword] = useState("");
  const [password, setPassword] = useState("");
  const [cNpassword, setCNPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: (payload: {
      otp: string;
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) =>
      handleFetch({
        endpoint: "users/change-password",
        method: "POST",
        body: payload,
        auth: true,
      }),
    onSuccess: (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Password Update Failed",
          text2: res?.message || "Please try again later",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Password Updated",
        text2: "Your password has been changed successfully",
      });

      router.push("/(tabs)/profile");
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error?.message || "Please try again later",
      });
    },
  });

  const handleSubmit = () => {
    if (!otp || !password || !nPassword || !cNpassword) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
      });
      return;
    }

    if (nPassword !== cNpassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
      });
      return;
    }

    changePasswordMutation.mutate({
      otp,
      currentPassword: password,
      newPassword: nPassword,
      confirmNewPassword: cNpassword,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{ flex: 1 }}>
      {changePasswordMutation.isPending && <Loader
        message="Updating Password..."
      />}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { marginTop: insets.top || 40 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrow-left" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Update Password</Text>
        </View>
        <Input
          label="OTP"
          value={otp}
          placeholder="Enter the OTP sent to your mail"
          keyboardType="phone-pad"
          onChangeText={setOTP}
          secureTextEntry
        />
        <Input
          label="Current Password"
          value={password}
          placeholder="Enter Your New Password"
          onChangeText={setPassword}
          secureTextEntry
        />
        <Input
          label="New Password"
          value={nPassword}
          placeholder="Enter Your New Password"
          onChangeText={setNPassword}
          secureTextEntry
        />
        <Input
          label="Confirm New Password"
          value={cNpassword}
          placeholder="Enter Your New Password"
          onChangeText={setCNPassword}
          secureTextEntry
        />

        <View style={{ marginBottom: resHeight(5) }} />

        <Button title="Continue" onPress={handleSubmit} />
        <View style={{ marginBottom: resHeight(5) }} />
      </ScrollView>
    </View>
    </TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
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

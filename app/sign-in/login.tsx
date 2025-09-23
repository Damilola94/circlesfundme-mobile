import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
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
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "auth/login",
        method: "POST",
        body,
      }),
    onSuccess: async (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: res?.message || "Invalid credentials",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Login Successful",
      });

      if (res?.data?.accessToken) {
        const payload = {
          ...res.data,
          loginTime: Date.now(),
          isKycComplete: true,
        };
        await AsyncStorage.setItem("data", JSON.stringify(payload));
      }

      router.replace("/(tabs)/dashboard");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleLogin = () => {
    if (!emailOrPhone || !password) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
      });
      return;
    }

    const payload = {
      email: emailOrPhone,
      password: password.trim(),
    };

    loginMutation.mutate(payload);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        {loginMutation.isPending && <Loader />}
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <Text style={styles.headerText}>Log In</Text>
          <Text style={styles.subText}>Welcome back to Circlesfundme</Text>

          <Input
            label="Email Address or Phone Number"
            value={emailOrPhone}
            placeholder="Enter Your Email Address or Phone Number"
            onChangeText={setEmailOrPhone}
          />

          <Input
            label="Password"
            value={password}
            placeholder="Enter Your Password"
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => router.push("/auth/forgot-password")}
            style={{ alignSelf: "flex-end" }}
          >
            <Text style={styles.forgotText}>Forgotten Password?</Text>
          </TouchableOpacity>

          <View style={{ marginVertical: resHeight(3) }} />

          <Button
            title={loginMutation.isPending ? "Logging in..." : "Log In"}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          />

          <View style={styles.groupText}>
            <Text style={styles.footerText}>Don’t have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/sign-up/create-account")}
            >
              <Text style={[styles.footerLink]}>Create Account</Text>
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
  },
  subText: {
    fontSize: resFont(12),
    color: Colors.dark.textLight,
    marginTop: 5,
    fontFamily: "OutfitRegular",
    marginBottom: resHeight(4),
  },
  forgotText: {
    color: Colors.dark.primary,
    fontSize: resFont(11),
    textAlign: "right",
    marginTop: 5,
    fontFamily: "OutfitRegular",
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
    fontFamily: "OutfitMedium",
  },
  groupText: {
    flexDirection: "row",
    marginTop: resHeight(4),
    justifyContent: "center",
  },
});

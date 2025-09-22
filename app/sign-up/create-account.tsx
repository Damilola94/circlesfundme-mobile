
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function CreateAccount() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  const validatePassword = (value: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(value);
  };
  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };


  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      setIsPasswordInvalid(!validatePassword(value));
    }, 800);
    setDebounceTimeout(timeout);
  };

  const createAccountMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "accounts/send-onboarding-otp",
        method: "POST",
        body,
      }),
    onSuccess: async (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Account creation failed",
          text2: res?.message || "Try again",
        });
        return;
      }
      Toast.show({
        type: "success",
        text1: "OTP Sent Successfully",
      });
      router.replace({
        pathname: "/sign-up/verify-email",
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
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleSubmit = () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid email address",
        text2: "Please enter a valid email format (e.g. example@mail.com)",
      });
      return;
    }

    if (isPasswordInvalid) {
      Toast.show({
        type: "error",
        text1: "Invalid password format",
        text2:
          "Password must include uppercase, lowercase, number and special character.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
      });
      return;
    }

    const body = { email, password };
    createAccountMutation.mutate(body);
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        {createAccountMutation.isPending && <Loader />}
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <Text style={styles.createAccText}>Create Account</Text>
          <Text style={styles.createAccSubText}>
            Join the Circle. Start saving, growing, and accessing funds the
            smart way
          </Text>

          <Input
            label="Email Address or Phone Number"
            value={email}
            placeholder="Enter Your Email or Phone"
            onChangeText={setEmail}
          />

          <Input
            label="Password"
            value={password}
            placeholder="Enter Your Password"
            onChangeText={handlePasswordChange}
            secureTextEntry
            isInvalid={isPasswordInvalid}
            errorMessage={
              isPasswordInvalid
                ? "Password must include uppercase, lowercase, number and special character."
                : ""
            }
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            placeholder="Re-enter Password"
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={{ marginBottom: resHeight(7) }} />
          <Button
            title={
              createAccountMutation.isPending
                ? "Creating Account..."
                : "Create Account"
            }
            onPress={handleSubmit}
            disabled={createAccountMutation.isPending}
          />

          <View style={styles.groupText}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/sign-in/login")}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: resHeight(10) }} />

          <View style={styles.groupPolicyText}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{" "}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://www.circlesfundme.com/terms-and-condition")
              }
            >
              <Text style={styles.footerLink}>
                Terms & Conditions and Cooperative Agreement
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  createAccText: {
    textAlign: "left",
    fontSize: resFont(30),
    fontFamily: "OutfitMedium",
  },
  createAccSubText: {
    textAlign: "left",
    fontSize: resFont(12),
    marginTop: 10,
    color: Colors.dark.textLight,
    marginBottom: resHeight(5),
    fontFamily: "OutfitRegular",
  },
  termsText: { textAlign: "center", fontFamily: "OutfitRegular" },
  footerText: {
    textAlign: "center",
    fontSize: resFont(12),
    color: Colors.dark.background,
    fontFamily: "OutfitMedium",
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
  groupPolicyText: {
    marginTop: resHeight(4),
    alignItems: "center",
  },
});

import {
  AntDesign,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProfileOptionCard from "@/components/profile/ProfileOptionCard";
import Button from "@/components/ui/Buttton";
import { Colors } from "@/constants/Colors";
import { PROFILE_IMG } from "@/constants/Image";
import handleFetch from "@/services/api/handleFetch";
import { useUserData } from "@/utils/cached";
import { resFont, resHeight } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

type ModalType = "logout" | "deactivate" | null;

export default function ProfileScreen() {
  const userData = useUserData();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const sendOtpMutation = useMutation({
    mutationFn: (navigateTo: string) =>
      handleFetch({
        endpoint: "accounts/send-onboarding-otp",
        method: "POST",
        body: { email: userData?.data?.email },
      }).then((res) => ({ res, navigateTo })),

    onSuccess: ({ res, navigateTo }) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "OTP Failed",
          text2: res?.message || "Please try again later",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "Follow the instructions sent to your email",
      });

      router.push(navigateTo as any);
    },

    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error?.message || "Please try again later",
      });
    },
  });


  const deactivateAccountMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "users/deactivate-account",
        method: "POST",
      }),

    onSuccess: async (res) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Deactivation Failed",
          text2: res?.message || "Please try again later",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Account Deactivated",
        text2: "Your account has been successfully deactivated",
      });

      await AsyncStorage.removeItem("data");
      setActiveModal(null);
      router.replace("/sign-in/login");
    },

    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: error?.message || "Please try again later",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("data");
      setActiveModal(null);
      router.replace("/sign-in/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderConfirmationModal = () => {
    if (!activeModal) return null;

    const isDeactivate = activeModal === "deactivate";

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Modal transparent visible>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setActiveModal(null)}
                >
                  <AntDesign name="close-circle" size={14} color="black" />
                </TouchableOpacity>

                <MaterialIcons
                  name={isDeactivate ? "warning-amber" : "help-outline"}
                  size={100}
                  color={isDeactivate ? "#C60808" : "#004C42"}
                />

                <Text style={styles.modalTitle}>
                  {isDeactivate
                    ? "Deactivate Account?"
                    : "Log out of your account?"}
                </Text>

                <Text style={styles.modalSubTitle}>
                  {isDeactivate
                    ? "This action will disable your account and you will no longer have access to your data."
                    : "You can log back in anytime."}
                </Text>
                <View style={styles.buttonContainer}>
                  <Button title="Cancel" onPress={() => setActiveModal(null)} />
                  <Button
                    title={isDeactivate ? "Deactivate" : "Log Out"}
                    style={{ backgroundColor: "#C60808" }}
                    disabled={
                      isDeactivate && deactivateAccountMutation.isPending
                    }
                    onPress={() =>
                      isDeactivate
                        ? deactivateAccountMutation.mutate()
                        : handleLogout()
                    }
                  />
                </View>
              </View>
            </View>
          </Modal>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top || 40 }]}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: userData?.data?.profilePictureUrl?.trim()
                  ? userData.data.profilePictureUrl
                  : PROFILE_IMG,
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {userData?.data
                ? `${userData.data.firstName} ${userData.data.lastName}`
                : "Guest User"}
            </Text>
          </View>

          <ProfileOptionCard
            title="Profile Settings"
            subTitle={
              userData?.data?.onboardingStatus === "Completed"
                ? ""
                : "INCOMPLETE"
            }
            onPress={() => router.push("/profile/profile-setting")}
            icon={<Ionicons name="person-outline" size={20} color="#00C281" />}
          />

          <ProfileOptionCard
            title="Update Password"
            onPress={() =>
              sendOtpMutation.mutate("/profile/update-password-setting")
            }
            icon={<Ionicons name="lock-closed-outline" size={20} color="#00C281" />}
          />

          <ProfileOptionCard
            title="Update Card Settings"
            onPress={() => {
              if (!userData?.data?.isPaymentSetupComplete) {
                Toast.show({
                  type: "error",
                  text1: "No Payment Card",
                  text2: "You have not set up any payment card yet.",
                });
                return;
              }
              sendOtpMutation.mutate("/profile/verify-card-otp");
            }}
            icon={<MaterialIcons name="credit-card" size={20} color="#00C281" />}
          />

          <ProfileOptionCard
            title="Payment Settings"
            onPress={() => router.push("/profile/payment-setting")}
            icon={<Ionicons name="card-outline" size={20} color="#00C281" />}
          />

          <ProfileOptionCard
            title="Notifications"
            onPress={() => router.push("/profile/notification")}
            icon={
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#00C281"
              />
            }
          />
          <ProfileOptionCard
            title="Deactivate Account"
            onPress={() => setActiveModal("deactivate")}
            icon={
              <MaterialIcons
                name="dangerous"
                size={20}
                color="#D01D1D"
              />
            }
            isLogout
          />
          <ProfileOptionCard
            title="Log Out"
            onPress={() => setActiveModal("logout")}
            icon={<Ionicons name="log-out-outline" size={20} color="#D01D1D" />}
            isLogout
          />
          {renderConfirmationModal()}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  container: {
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: resHeight(15),
  },
  title: {
    fontSize: resFont(22),
    fontFamily: "OutfitBold",
    marginBottom: resHeight(2),
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: resHeight(9),
    height: resHeight(9),
    borderRadius: resHeight(4.5),
    marginBottom: resHeight(3),
  },
  name: {
    fontSize: resFont(16),
    fontFamily: "OutfitMedium",
    color: "#1A1A1A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: resHeight(3),
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  modalTitle: {
    fontSize: resFont(20),
    fontFamily: "OutfitMedium",
    textAlign: "center",
    marginTop: 20,
  },
  modalSubTitle: {
    fontSize: resFont(13),
    color: Colors.dark.textLight,
    textAlign: "center",
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
});

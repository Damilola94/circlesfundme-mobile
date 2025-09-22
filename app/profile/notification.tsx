 
import Button from "@/components/ui/Buttton";
import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const router = useRouter();
  const userData = queryClient.getQueryData(["users-me"]) as {
    data?: {
      allowEmailNotifications: boolean;
      allowPushNotifications: boolean;
    };
  };
  const [pushEnabled, setPushEnabled] = useState(
    userData?.data?.allowPushNotifications ?? false
  );
  const [emailEnabled, setEmailEnabled] = useState(
    userData?.data?.allowEmailNotifications ?? false
  );

  useEffect(() => {
    if (userData?.data) {
      setPushEnabled(userData.data.allowPushNotifications);
      setEmailEnabled(userData.data.allowEmailNotifications);
    }
  }, [userData]);

  const updateUserMutation = useMutation({
    mutationFn: (payload: any) =>
      handleFetch({
        endpoint: "users/update",
        method: "PUT",
        body: payload,
        auth: true,
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Notification preferences updated",
      });
      router.push("/(tabs)/profile");
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: err?.message || "Try again later",
      });
    },
  });

  const handleSubmit = () => {
    if (!userData?.data) return;

    const fullPayload = {
      ...userData.data,
      allowPushNotifications: pushEnabled,
      allowEmailNotifications: emailEnabled,
    };
    updateUserMutation.mutate(fullPayload);
  };

  return (
    <View style={{ flex: 1 }}>
      {updateUserMutation.isPending && <Loader 
      message="Updating Notification Settings..."
      />}
      <View style={[styles.container, { marginTop: insets.top || 40 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Notification</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Push Notification</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: "#E0E0E0", true: Colors.dark.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Email</Text>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: "#E0E0E0", true: Colors.dark.primary }}
            thumbColor="#fff"
          />
        </View>
        <View style={{ marginBottom: resHeight(10) }} />
        <Button
          title={updateUserMutation.isPending ? "Saving..." : "Save"}
          onPress={handleSubmit}
          disabled={updateUserMutation.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  title: {
    fontSize: resFont(16),
    fontFamily: "OutfitMedium",
    color: "#1A1A1A",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: resHeight(2.5),
    borderBottomWidth: 0.5,
    borderColor: "#E5E5E5",
  },
  optionLabel: {
    fontSize: resFont(14),
    color: "#1A1A1A",
    fontFamily: "OutfitRegular",
  },
  saveButton: {
    backgroundColor: "#1A1A1A",
    marginTop: resHeight(6),
    paddingVertical: resHeight(2.5),
    alignItems: "center",
    borderRadius: 30,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: resFont(14),
    fontWeight: "500",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import handleFetch from "@/services/api/handleFetch";
import { uploadDocument } from "@/utils/uploadDocument";
import { resFont, resHeight } from "@/utils/utils";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function ConfirmAddress() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ governmentIssuedIDUrl?: string }>();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userAddress, setUserAddress] = useState("");
  const { file: utilityBill, pickFile, error } = useDocumentPicker({
    allowedTypes: ["application/pdf", "image/png", "image/jpeg"],
    maxSizeMB: 10,
  });

  const updateUserMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "users/update",
        method: "PUT",
        auth: true,
        body,
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Profile updated",
      });
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
      router.push("/profile");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleSubmit = async () => {
    if (!userAddress || !utilityBill) {
      alert("Please provide your house address and upload a recent utility bill.");
      return;
    }

    try {
      setLoading(true);
      const uploadedUrl = await uploadDocument(utilityBill);
      console.log(uploadedUrl);
      updateUserMutation.mutate({
        address: userAddress,
        utilityBillUrl: uploadedUrl,
        governmentIssuedIDUrl: params.governmentIssuedIDUrl,
      });
    } catch (err: any) {
      alert(err.message || "Failed to upload utility bill");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipped = () => {
    updateUserMutation.mutate({
      address: userAddress || "",
      governmentIssuedIDUrl: params.governmentIssuedIDUrl || "",
    });
    router.push("/profile");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { marginTop: insets.top || 40 }]}>
        {loading && (<Loader message="Uploading Utility Bill..." />)}
        <ProgressStepsBar totalSteps={2} currentStep={2} />

        <Text style={styles.title}>Confirm Your Address</Text>
        <Text style={styles.subtitle}>
          This helps us keep your account secure and unlocks access to funding.
        </Text>

        <Input
          label="House Address"
          value={userAddress}
          onChangeText={setUserAddress}
          placeholder="Enter Valid Address"
        />

        <Text style={styles.orText}>AND</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
          <Ionicons name="cloud-upload-outline" size={32} color="#00A86B" />
          <Text style={styles.uploadTitle}>Upload a recent utility bill</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {utilityBill && (
          <Text style={styles.selectedFileText}>
            Selected: {utilityBill.name}
          </Text>
        )}

        <View style={styles.fileInfo}>
          <Text style={styles.fileText}>PDF, PNG, JPEG</Text>
          <Text style={styles.fileText}>5mb max size</Text>
        </View>

        <View style={{ marginBottom: resHeight(8) }} />

        <Button title="Continue" onPress={handleSubmit} />
        <View style={{ marginBottom: resHeight(3) }} />
        <Button
          title="Skip for Now"
          onPress={handleSkipped}
          style={{ backgroundColor: "transparent", paddingVertical: 0 }}
          textStyle={{ color: Colors.dark.primary, fontSize: resFont(12) }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: resFont(30),
    fontWeight: "500",
    marginTop: resHeight(4),
    fontFamily: "OutfitMedium",
  },
  subtitle: {
    fontSize: resFont(12),
    marginTop: 10,
    marginBottom: resHeight(4),
    color: Colors.dark.textLight,
    fontFamily: "OutfitRegular",
  },
  orText: {
    textAlign: "center",
    fontSize: resFont(12),
    marginVertical: resHeight(2),
    color: "#999",
    fontFamily: "OutfitRegular",
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#00A86B",
    borderStyle: "dashed",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F7FDF9",
  },
  uploadTitle: {
    color: "#00A86B",
    fontWeight: "600",
    fontSize: resFont(14),
    marginTop: 10,
    fontFamily: "OutfitMedium",
  },
  fileInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  fileText: {
    fontSize: resFont(11),
    color: "#999",
    fontFamily: "OutfitMedium",
  },
  errorText: {
    color: "red",
    fontSize: resFont(11),
    marginTop: 5,
  },
  selectedFileText: {
    marginTop: 5,
    fontSize: resFont(12),
    fontStyle: "italic",
    color: "#333",
  },
});

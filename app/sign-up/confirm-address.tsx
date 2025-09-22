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

import Loader from "@/components/ui/Loader";
import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { uploadDocument } from "@/utils/uploadDocument";
import { resFont, resHeight } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function ConfirmAddress() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userAddress, setUserAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    fullName,
    phone,
    dob,
    gender,
    documentUrl,
    documentName,
    documentType,
  } = useLocalSearchParams<{
    fullName: string;
    phone: string;
    dob: string;
    gender: string;
    documentUrl: string;
    documentName: string;
    documentType: string;
  }>();

  const {
    file: utilityBill,
    pickFile,
    error,
  } = useDocumentPicker({
    allowedTypes: ["application/pdf", "image/png", "image/jpeg"],
    maxSizeMB: 10,
  });

  const handleSubmit = async () => {
    if (!userAddress || !utilityBill) {
      alert(
        "Please provide your house address and upload a recent utility bill."
      );
      return;
    }
    if (utilityBill.size && utilityBill.size > 5 * 1024 * 1024) {
      alert("The utility bill file is too large. Please upload a file smaller than 5MB.");
      return;
    }

    try {
      setLoading(true);

      const uploadedUrl = await uploadDocument({
        uri: utilityBill.uri,
        name: utilityBill.name,
        type: utilityBill.mimeType || "",
      });

      console.log(uploadedUrl, "uploadedUrl - utility");

      router.replace({
        pathname: "/sign-up/confirm-bvn",
        params: {
          fullName,
          phone,
          dob,
          gender,
          documentUrl,
          documentName,
          documentType,
          userAddress,
          utilityBillUrl: uploadedUrl,
        },
      });
    } catch (err: any) {
      alert(err.message || "Utility bill upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipped = () => {
    router.replace({
      pathname: "/sign-up/confirm-bvn",
      params: {
        fullName,
        phone,
        dob,
        gender,
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { marginTop: insets.top || 40 }]}>
        {loading && (<Loader message="Uploading Utility Bill..." />)}
        <ProgressStepsBar currentStep={3} />
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

        <Button title={loading ? "Uploading..." : "Continue"} onPress={handleSubmit} disabled={loading} />
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
  container: {
    flex: 1,
    padding: 20,
  },
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

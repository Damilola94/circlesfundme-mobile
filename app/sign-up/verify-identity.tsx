import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Loader from "@/components/ui/Loader";
import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { uploadDocument } from "@/utils/uploadDocument";
import { resFont, resHeight } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Buttton";

export default function VerifyIdentity() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fullName, phone, dob, gender } = useLocalSearchParams<{
    fullName: string;
    phone: string;
    dob: string;
    gender: string;
  }>();

  const { file: document, pickFile, error } = useDocumentPicker();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!document) {
      alert("Please upload a valid government-issued ID.");
      return;
    }
    if (document.size && document.size > 5 * 1024 * 1024) {
      alert("The file size is too large. Please upload a file smaller than 5MB.");
      return;
    }

    try {
      setLoading(true);

      const uploadedUrl = await uploadDocument({
        uri: document.uri,
        name: document.name,
        type: document.mimeType || "",
      });
      router.replace({
        pathname: "/sign-up/confirm-address",
        params: {
          fullName,
          phone,
          dob,
          gender,
          documentUrl: uploadedUrl, 
        },
      });
    } catch (err: any) {
      alert(err.message || "Upload failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipped = () => {
    router.replace({
      pathname: "/sign-up/confirm-address",
      params: {
        fullName,
        phone,
        dob,
        gender,
      },
    });
  };

  return (
    <View style={[styles.container, { marginTop: insets.top || 40 }]}>
      {loading && (<Loader message="Uploading ID..." />)}
      <ProgressStepsBar currentStep={2} />

      <Text style={styles.createAccText}>Verify Your Identity</Text>
      <Text style={styles.createAccSubText}>
        This helps us keep your account secure and unlocks access to funding.
      </Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
        <Ionicons name="cloud-upload-outline" size={32} color="#00A86B" />
        <Text style={styles.uploadTitle}>Upload a Government-Issued ID</Text>
        <Text style={styles.uploadSubtitle}>
          (e.g., National ID, Driver’s License, Voter’s Card, Passport)
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {document && (
        <Text style={styles.selectedFileText}>Selected: {document.name}</Text>
      )}

      <View style={styles.fileInfo}>
        <Text style={styles.fileText}>PDF files only</Text>
        <Text style={styles.fileText}>5mb max size</Text>
      </View>

      <View style={{ marginBottom: resHeight(10) }} />

      <Button title={loading ? "Uploading..." : "Continue"} onPress={handleSubmit} disabled={loading} />
      <View style={{ marginBottom: resHeight(3) }} />
      <Button
        title="Skip for Now"
        onPress={handleSkipped}
        style={{ backgroundColor: "transparent", paddingVertical: 0 }}
        textStyle={{ color: Colors.dark.primary, fontSize: resFont(12) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  createAccText: {
    textAlign: "left",
    fontWeight: "500",
    fontSize: resFont(30),
    marginTop: resHeight(5),
    fontFamily: "OutfitMedium",
  },
  createAccSubText: {
    textAlign: "left",
    fontSize: resFont(12),
    marginTop: 10,
    color: Colors.dark.textLight,
    marginBottom: resHeight(4),
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
  uploadSubtitle: {
    textAlign: "center",
    fontSize: resFont(12),
    color: "#555",
    marginTop: 5,
    fontFamily: "OutfitRegular",
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

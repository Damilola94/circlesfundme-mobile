import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function ConfirmAddress() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bvn, setBVN] = useState("");
  const {
    fullName,
    phone,
    dob,
    gender,
    documentUrl,
    documentName,
    documentType,
    userAddress,
    utilityBillUrl,
    utilityBillName,
    utilityBillType,
  } = useLocalSearchParams<{
    fullName: string;
    phone: string;
    dob: string;
    gender: string;
    documentUrl: string;
    documentName: string;
    documentType: string;
    userAddress: string;
    utilityBillUrl: string;
    utilityBillName: string;
    utilityBillType: string;
  }>();

  const handleSubmit = () => {
    
    if (!bvn) {
      alert("Please provide your BVN");
      return;
    }
    if (bvn.length !== 11) {
      alert("BVN must be exactly 11 digits");
      return;
    }
  
    router.replace({
      pathname: "/sign-up/take-selfie",
      params: {
        fullName,
        phone,
        dob,
        gender,
        documentUrl,
        documentName,
        documentType,
        userAddress,
        utilityBillUrl,
        utilityBillName,
        utilityBillType,
        bvn,
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { marginTop: insets.top || 40 }]}>
        <ProgressStepsBar currentStep={4} />

        <Text style={styles.title}>Confirm Your BVN</Text>
        <Text style={styles.subtitle}>
          This helps us keep your account secure and unlocks access to funding.
        </Text>

        <Input
          label="BVN"
          value={bvn}
          onChangeText={setBVN}
          keyboardType="phone-pad"
          placeholder="Enter Your BVN"
        />

        <View style={{ marginBottom: resHeight(8) }} />

        <Button title="Continue" onPress={handleSubmit} />
        <View style={{ marginBottom: resHeight(3) }} />
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

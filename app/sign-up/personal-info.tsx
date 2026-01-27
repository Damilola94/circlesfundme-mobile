import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import SelectInput from "@/components/ui/SelectInput";
import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function PersonalInfo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = () => {
    if (!fullName || !phone || !dob || !gender) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
      });
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      Toast.show({
        type: "error",
        text1: "Full Name Required",
        text2: "Please enter both your first and last name.",
      });
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    const isValidNigerianPhone = /^0[789][01]\d{8}$/.test(phoneDigits);

    if (!isValidNigerianPhone) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2:
          "Enter a valid Nigerian phone number (e.g. 0803..., 0901..., 0706...).",
      });
      return;
    }

    const age = moment().diff(moment(dob, "DD/MM/YYYY"), "years");
    if (age < 18) {
      Toast.show({
        type: "error",
        text1: "Invalid Age",
        text2: "You must be at least 18 years old to continue.",
      });
      return;
    }
    const selectedGender = gender === "Not Specified" ? "NotSet" : gender;
    router.replace({
      pathname: "/sign-up/verify-identity",
      params: {
        fullName: fullName.trim(),
        phone,
        dob,
        gender: selectedGender,
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { marginTop: insets.top || 40 },
      ]}
    >
      <ProgressStepsBar currentStep={1} />
      <Text
        style={styles.createAccText}
        onPress={() => router.push("/sign-in/login")}
      >
        Let’s Get to Know You
      </Text>
      <Text style={styles.createAccSubText}>
        Just a few quick details to get you started.
      </Text>
      <Input
        label="Full Name"
        placeholder="Enter Your Full name"
        value={fullName}
        onChangeText={setFullName}
      />
      <Input
        label="Phone Number"
        placeholder="Enter Your Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Input
        label="Date of Birth"
        value={dob}
        onChangeText={setDob}
        placeholder="DD/MM/YYYY"
        type="date"
        onPressDate={() => setShowPicker(true)}
      />
      <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        onConfirm={(date) => {
          setDob(moment(date).format("DD/MM/YYYY"));
          setShowPicker(false);
        }}
        onCancel={() => setShowPicker(false)}
      />
      <SelectInput
        label="Gender"
        value={gender}
        onSelect={setGender}
        placeholder="Select Gender"
        options={["Male", "Female", "Not Specified"]}
      />
      <View style={{ marginBottom: resHeight(5) }} />
      <Button title="Continue" onPress={handleSubmit} />
      <View style={styles.groupText}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace("/sign-in/login")}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  createAccText: {
    textAlign: "left",
    fontWeight: "500",
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
});

import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../components/ui/Buttton";

export default function VerificationSuccess() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push("/(tabs)/dashboard");
  };

  return (
    <View style={[styles.container, { marginTop: insets.top || 40 }]}>
      <View
        style={{
          alignItems: "center",
        }}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={200}
          color={Colors.dark.primary}
        />
        <Text style={styles.title}>Changes Saved</Text>
      </View>
      <View style={{ marginBottom: resHeight(10) }} />
      <Button title="Back to Dashboard" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  image: { width: 150, height: 150, marginBottom: 30 },
  title: {
    fontSize: resFont(25),
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "left",
    fontSize: resFont(12),
    marginTop: 10,
    color: Colors.dark.textLight,
    marginBottom: resHeight(5),
  },
});

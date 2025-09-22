import { Colors } from "@/constants/Colors";
import { resHeight } from "@/utils/utils";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SetupNotice() {
  return (
    <View style={styles.notice}>
      <Text style={styles.text}>You haven’t setup paymentssssssss yet</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Complete Setup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    backgroundColor: Colors.dark.background,
    padding: resHeight(5),
    borderRadius: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  text: {
    color: "#00A86B",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#00A86B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

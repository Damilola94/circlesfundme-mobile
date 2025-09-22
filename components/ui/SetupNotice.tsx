import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "./Buttton";

interface SetIncompleteProps {
  title?: string;
  onPress: () => void;
  buttonText?: string;
}

export default function SetupNotice({ title,  onPress, buttonText}: SetIncompleteProps) {
  return (
    <View style={styles.notice}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AntDesign
          name="exclamation-circle"
          size={20}
          color={Colors.dark.text}
        />
        <Text style={styles.text}>{title}</Text>
      </View>
      <Button
        style={{
          backgroundColor: Colors.dark.text,
          paddingVertical: resHeight(1),
          paddingHorizontal: resHeight(1),
        }}
        title={buttonText}
        onPress={onPress}
        textStyle={{ color: Colors.dark.background, fontSize: resFont(9) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    marginTop: 20,
    backgroundColor: Colors.dark.primary,
    padding: resHeight(1.5),
    borderRadius: resHeight(3),
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: {
    color: Colors.dark.text,
    fontSize: resFont(10),
    fontFamily: "Outfit",
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

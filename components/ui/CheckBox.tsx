import { Colors } from "@/constants/Colors";
import { resFont } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

const CustomCheckbox: React.FC<Props> = ({ label, checked, onToggle }) => {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.container}>
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked && <AntDesign name="check" size={14} color="#fff" />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

export default CustomCheckbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#333",
    backgroundColor: "#fff",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: Colors.dark.background,
  },
  label: {
    
    fontSize: resFont(10),
    color: "#333",
    fontFamily: "OutfitRegular",
  },
});

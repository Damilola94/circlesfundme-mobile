import { Colors } from "@/constants/Colors";
import { resFont, resHeight, resWidth } from "@/utils/utils";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  textStyle?: TextStyle;
  variant?: "default" | "text";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  iconLeft,
  iconRight,
  variant,
  textStyle,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === "text" && styles.textOnlyButton,
      disabled && styles.disabledButton,
      style,
    ]}
    onPress={disabled ? undefined : onPress}
    activeOpacity={disabled ? 1 : 0.7}
    disabled={disabled}
  >
    <View style={styles.content}>
      {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
      <Text
        style={[
          styles.text,
          variant === "text" && styles.textOnly,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </Text>
      {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.dark.background,
    padding: resHeight(2.5),
    borderRadius: resWidth(10),
    alignItems: "center",
  },
  textOnlyButton: {
    backgroundColor: "transparent",
    elevation: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textOnly: {
    color: Colors.dark.primary,
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconRight: {
    marginLeft: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  text: {
    color: Colors.dark.text,
    fontWeight: "600",
    fontFamily: "OutfitMedium",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledText: {
    color: "#999",
  },
});

export default Button;

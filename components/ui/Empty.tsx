import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
};

const EmptyState = ({
  icon = "database-search-outline",
  iconSize = 72,
  iconColor = "#ccc",
  title = "No Data Found",
  subtitle = "There's nothing here yet.",
  containerStyle,
  titleStyle,
  subtitleStyle,
}: Props) => (
  <View style={[styles.container, containerStyle]}>
    <MaterialCommunityIcons
      name={icon}
      size={iconSize}
      color={iconColor}
      style={styles.icon}
    />
    <Text style={[styles.title, titleStyle]}>{title}</Text>
    <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "OutfitSemiBold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "OutfitRegular",
  },
});

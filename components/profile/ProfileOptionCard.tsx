import { resFont, resHeight } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons"; // or your preferred icon set
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileOptionCardProps {
  title: string;
  subTitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  isLogout?: boolean;
}

export default function ProfileOptionCard({
  title,
  icon,
  subTitle,
  onPress,
  isLogout,
}: ProfileOptionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, isLogout && styles.logoutBackground]}>
        {icon}
      </View>
      <Text style={[styles.title, isLogout && { color: "#D01D1D" }]}>
        {title}
      </Text>
      {subTitle && (
        <Text style={[styles.title, subTitle && { color: "#D01D1D" }]}>
          {subTitle ? subTitle : ""}
        </Text>
      )}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isLogout ? "#D01D1D" : "#999"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: resHeight(1.8),
    marginBottom: 12,
    ...Platform.select({
      android: {},
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
    }),
  },
  iconContainer: {
    width: resHeight(5),
    height: resHeight(5),
    borderRadius: resHeight(2.5),
    backgroundColor: "#e0f9f1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoutBackground: {
    backgroundColor: "#fde9e9",
  },
  title: {
    flex: 1,
    fontSize: resFont(14),
    fontWeight: "500",
    color: "#1A1A1A",
    fontFamily: "OutfitMedium",
  },
});

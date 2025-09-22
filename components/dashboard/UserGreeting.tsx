import { Colors } from "@/constants/Colors";
import { PROFILE_IMG } from "@/constants/Image";
import { getGreeting, resFont, resHeight } from "@/utils/utils";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  name: string;
  avatarUrl: string;
};

export default function UserGreeting({ name, avatarUrl }: Props) {
  const firstName = name ?? "User";
  const greeting = getGreeting();

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: avatarUrl?.trim() ? avatarUrl : PROFILE_IMG,
        }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{firstName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: resHeight(6),
    height: resHeight(6),
    borderRadius: resHeight(3),
    marginRight: 12,
  },
  greeting: {
    fontSize: resFont(12),
    color: Colors.dark.textLight,
    fontFamily: "OutfitRegular",
  },
  name: {
    fontSize: resFont(14),
    fontWeight: "600",
    color: Colors.dark.background,
    fontFamily: "OutfitBold",
  },
});

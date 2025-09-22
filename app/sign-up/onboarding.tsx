import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../../components/ui/Buttton";

export default function Onboarding() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/onboarding/onboarding.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.9)"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.topRightIcon}>
        <Image
          source={require("../../assets/images/logo-appicon.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.bottomContent}>
        <Text style={styles.title}>
          Fund your future,{"\n"}one circle at a time
        </Text>
        <Text style={styles.subtitle}>
          Build your credit, access funding, and achieve your goals.
        </Text>

        <Button
          title="Create Account"
          onPress={async () => {
            await AsyncStorage.setItem("seenOnboarding", "user-onboarded-success");
            router.replace("/sign-up/create-account");
          }}
          style={{ backgroundColor: Colors.dark.secondary }}
        />
        <View style={{ marginBottom: resHeight(3) }} />
        <Button
          title="Sign In"
          onPress={async () => {
            await AsyncStorage.setItem("seenOnboarding", "user-onboarded-success");
            router.replace("/sign-in/login");
          }}
          style={{ backgroundColor: "transparent", paddingVertical: 0 }}
          textStyle={{ color: Colors.dark.secondary, fontSize: resFont(14) }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: resHeight(5),
    paddingHorizontal: 20,
  },
  topRightIcon: {
    alignItems: "flex-end",
    marginTop: resHeight(2),
  },
  logo: {
    width: 80,
    height: 80,
  },
  bottomContent: {
    paddingBottom: resHeight(5),
  },
  title: {
    color: "#fff",
    fontSize: resFont(24),
    fontWeight: "bold",
    marginBottom: resHeight(2),
    fontFamily: "OutfitBold",
  },
  subtitle: {
    color: "#eee",
    fontSize: resFont(12),
    marginBottom: resHeight(4),
    fontFamily: "OutfitMedium",
  },
  signInText: {
    color: Colors.dark.primary,
    fontSize: resFont(12),
    textAlign: "center",
  },
});

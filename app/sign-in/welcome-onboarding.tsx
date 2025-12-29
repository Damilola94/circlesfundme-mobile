import Button from "@/components/ui/Buttton";
import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video } from "expo-av";

export default function WelcomeOnboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>
        <Video
          source={require("../../assets/images/onboarding.mp4")}
          style={styles.video}
          isLooping
          shouldPlay
          isMuted
        />

        <Text style={styles.title}>Welcome to CirclesFundMe</Text>

        <Text style={styles.subTitle}>You’re almost there!</Text>

        <Text style={styles.subTitle}>
          Your onboarding isn’t completed yet.{" "}
        </Text>

        <Text style={styles.subTitle}>Complete it to unlock all features.</Text>
        <Button
          title="Complete Onboarding"
          onPress={() => router.replace("/sign-up/personal-info")}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: resHeight(40),
    marginBottom: resHeight(4),
  },
  title: {
    fontSize: resFont(22),
    fontFamily: "OutfitMedium",
    marginBottom: resHeight(1),
    textAlign: "center",
  },
  subTitle: {
    fontSize: resFont(13),
    color: Colors.dark.textLight,
    textAlign: "center",
    marginBottom: resHeight(1),
    lineHeight: 20,
  },
  button: {
    width: "100%",
    marginTop: resHeight(5),
  },
});

import { resFont } from "@/utils/utils";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type LoaderProps = {
  size?: number | "small" | "large";
  color?: string;
  message?: string;
};

const Loader = ({
  message = "Loading...",
  size = "large",
  color = "#069E6B",
}: LoaderProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      <Text
        style={{
          fontSize: resFont(10),
          fontFamily: "OutfitMedium",
          color: "#069E6B",
        }}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});

export default Loader;

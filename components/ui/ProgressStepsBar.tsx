/* eslint-disable react-hooks/exhaustive-deps */
import { resHeight } from "@/utils/utils";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface ProgressStepsBarProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressStepsBar: React.FC<ProgressStepsBarProps> = ({
  currentStep,
  totalSteps = 6,
}) => {
  const animatedValues = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    animatedValues.forEach((animValue, index) => {
      Animated.timing(animValue, {
        toValue: index < currentStep ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();
    });
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {animatedValues.map((animValue, index) => {
        const backgroundColor = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["#E0E0E0", "#00A86B"],
        });

        return (
          <Animated.View
            key={index}
            style={[styles.step, { backgroundColor }]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 5,
    marginBottom: resHeight(3),
  },
  step: {
    flex: 1,
    height: resHeight(1),
    borderRadius: 5,
  },
});

export default ProgressStepsBar;

import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../ui/Buttton";

interface ContributionCardProps {
  onPressApply?: () => void;
  amount?: string;
  scheme?: string;
  nextTranDate?: null | string;
  action?: string;
}

export default function ContributionCard({
  onPressApply,
  amount,
  scheme,
  nextTranDate,
}: ContributionCardProps) {

  const handleSubmit = () => {
    if (onPressApply) {
      onPressApply();
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: "#005B41" }]}>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.label}>Your Contribution</Text>
          <Text
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: Colors.dark.text,
              padding: resHeight(1),
              borderRadius: resHeight(3),
              fontSize: resFont(10),
              fontFamily: "OutfitMedium",
            }}
          >
            {scheme}
          </Text>
        </View>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Button
          style={{
            backgroundColor: Colors.dark.text,
            paddingVertical: resHeight(1.5),
          }}
          title="Withdraw"
          onPress={handleSubmit}
          textStyle={{ color: Colors.dark.background }}
        />
        <View>
          <Text style={styles.subText}>Next Due</Text>
          <Text style={styles.date}>
            {nextTranDate ? nextTranDate : "No due date"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    height: resHeight(22),
    justifyContent: "space-between",
  },
  label: { color: "#fff", fontSize: resFont(12), fontFamily: "OutfitRegular" },
  amount: {
    color: "#fff",
    fontSize: resFont(25),
    fontFamily: "OutfitBold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subText: {
    color: "#ccc",
    fontSize: resFont(10),
    fontFamily: "OutfitRegular",
  },
  date: {
    color: "#fff",
    fontSize: resFont(12),
    marginTop: resHeight(0.5),
    fontFamily: "OutfitRegular",
  },
});

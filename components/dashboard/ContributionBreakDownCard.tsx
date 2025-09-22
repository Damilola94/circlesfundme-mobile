import { Colors } from "@/constants/Colors";
import { formatAmount, resFont, resHeight } from "@/utils/utils";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

interface ContributionBreakDownCardProps {
  onPressApply?: () => void;
  amount?: number;
  installmentDesc?: string;
  preInstallmentDesc?: string;
}

export default function ContributionCard({
  amount = 0,
  installmentDesc = "0 of 52",
  preInstallmentDesc = "0 of 0",
}: ContributionBreakDownCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contributions made</Text>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Subscription amount</Text>
        <Text style={styles.value}> {formatAmount(amount)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Pre Loan Installments</Text>
        <Text style={styles.value}>{preInstallmentDesc}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Post Loan Installments</Text>
        <Text style={styles.value}>{installmentDesc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginTop: resHeight(2),
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
    }),
  },
  header: {
    fontSize: resFont(14),
    fontWeight: "600",
    color: Colors.dark.background,
    marginBottom: resHeight(1.5),
    fontFamily: "OutfitMedium",
  },
  divider: {
    height: 1,
    backgroundColor: "#CCCCCC",
    marginBottom: resHeight(1.5),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: resHeight(1),
  },
  label: {
    fontSize: resFont(13),
    color: "#999",
    fontFamily: "OutfitRegular",
  },
  value: {
    fontSize: resFont(13),
    color: "#1A1A1A",
    fontWeight: "700",
    fontFamily: "OutfitMedium",
  },
});

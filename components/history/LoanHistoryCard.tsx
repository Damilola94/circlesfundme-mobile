// components/dashboard/LoanHistoryCard.tsx
import { Colors } from "@/constants/Colors";
import { resFont } from "@/utils/utils";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";

interface LoanHistoryCardProps {
  amount: number;
  amountRepaid?: number;
  dateRange?: string;
  dateApplied?: string;
  status: string;
  progress?: number;
  repaymentCount?: number;
  totalRepaymentCount?: number;
}

const LoanHistoryCard: React.FC<LoanHistoryCardProps> = ({
  amount,
  amountRepaid,
  dateRange,
  dateApplied,
  status,
  repaymentCount = 0,
  totalRepaymentCount = 0,
  progress = 0,
}) => {
  if (status === "Pending" || status === "Waitlist" || status === "Approved") {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>Loan Amount</Text>
            <Text style={styles.amount}>₦{amount}</Text>
          </View>
          <Text style={styles.date}>{dateApplied}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[
              styles.status,
              status === "Pending" && { color: "#FFA500" },
              status === "Waitlist" && { color: "#888" },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Amount Repaid</Text>
          <Text style={styles.amount}>₦{amountRepaid}</Text>
        </View>
        <Text style={styles.date}>{dateRange || "N/A"}</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.repaymentCount}>
          {repaymentCount}/{totalRepaymentCount}
        </Text>
        <Text style={styles.percent}>{progress}%</Text>
      </View>

      <ProgressBar
        progress={progress / 100}
        color={Colors.dark.primary}
        style={styles.progressBar}
      />
    </View>

  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#888",
    fontSize: resFont(11),
    fontFamily: "OutfitRegular",
  },
  amount: {
    fontFamily: "OutfitMedium",
    fontSize: resFont(16),
    marginTop: 4,
  },
  date: {
    fontSize: resFont(11),
    color: "#888",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  status: {
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
    color: Colors.dark.primary,
  },
  percent: {
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: "#eee",
  },
  repaymentCount: {
    fontSize: resFont(12),
    color: "#555",
    marginHorizontal: 8,
    fontFamily: "OutfitMedium",
  },
});

export default LoanHistoryCard;

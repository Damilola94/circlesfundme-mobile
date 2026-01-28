import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/Colors";
import { resFont } from "@/utils/utils";

interface LoanHistoryCardProps {
  amount: number;
  amountRepaid?: number;
  dateRange?: string;
  dateApplied?: string;
  status: "Pending" | "Waitlist" | "Approved" | "Active" | "Completed";
  progress?: number;
  repaymentCount?: number;
  totalRepaymentCount?: number;
}

const LoanHistoryCard: React.FC<LoanHistoryCardProps> = ({
  amount,
  amountRepaid = 0,
  dateRange,
  dateApplied,
  status,
  repaymentCount = 0,
  totalRepaymentCount = 0,
  progress = 0,
}) => {
  const router = useRouter();

  const isNonClickable =
    status === "Pending" || status === "Waitlist" || status === "Approved";

  const isClickable =
    status === "Active" || status === "Completed";

  const statusColor = {
    Pending: "#FFA500",
    Waitlist: "#999",
    Approved: Colors.dark.primary,
    Active: Colors.dark.primary,
    Completed: "#2E7D32",
  }[status];

  if (isNonClickable) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>Loan Amount</Text>
            <Text style={styles.amount}>
              ₦{amount?.toLocaleString()}
            </Text>
          </View>
          <Text style={styles?.date}>{dateApplied || "—"}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>
    );
  }

  const LoanContent = (
    <>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Amount Repaid</Text>
          <Text style={styles.amount}>
            ₦{amountRepaid.toLocaleString()}
          </Text>
        </View>
        <Text style={styles.date}>{dateRange || "—"}</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={[styles.status, { color: statusColor }]}>
          {status}
        </Text>

        <Text style={styles.repaymentCount}>
          {repaymentCount}/{totalRepaymentCount}
        </Text>

        <Text style={styles.percent}>{progress}%</Text>
      </View>

      <ProgressBar
        progress={Math.min(progress / 100, 1)}
        color={Colors.dark.primary}
        style={styles.progressBar}
      />
    </>
  );

  if (isClickable) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push("/loan-bank-payment/payment-method")
        }
      >
        <View style={styles.card}>{LoanContent}</View>
      </TouchableOpacity>
    );
  }

  return null;
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
    borderWidth: 1,
    borderColor: "#F2F2F2",
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
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  status: {
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
  },
  percent: {
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
  },
  repaymentCount: {
    fontSize: resFont(12),
    color: "#555",
    fontFamily: "OutfitMedium",
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: "#eee",
  },
});

export default LoanHistoryCard;

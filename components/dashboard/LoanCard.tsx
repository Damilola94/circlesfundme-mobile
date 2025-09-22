import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "../ui/Buttton";

interface LoanCardProps {
  onPressApply?: () => void;
  onWaitListPress?: () => void;
  loanStatus?: "Apply for Loan" | "Active" | "Pending" | "Waitlist" | null;
  amount?: string;
  scheme?: string;
  nextTranDate?: null | string;
}

export default function LoanCard({
  onPressApply,
  onWaitListPress,
  loanStatus,
  amount,
  scheme,
  nextTranDate,
}: LoanCardProps) {
  
  const handleSubmit = () => {
    if (onPressApply) {
      onPressApply();
    }
  };

  const getStatusConfig = () => {
    switch (loanStatus) {
      case "Active":
        return {
          color: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.2)",
          text: "Active",
          icon: "●",
        };
      case "Pending":
        return {
          color: "#ffc107",
          backgroundColor: "rgba(255, 193, 7, 0.2)",
          text: "Pending",
          icon: "●",
        };
      case "Waitlist":
        return {
          color: Colors.dark.text,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          text: "Waitlisted",
          icon: "●",
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();
  const hasLoanStatus = ["Active", "Pending", "Waitlist"].includes(
    loanStatus as string
  );

  return (
    <View style={[styles.card, hasLoanStatus && styles.statusCard]}>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.label}>Maximum Loan Eligible</Text>
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
        {hasLoanStatus && statusConfig ? (
          <View style={styles.statusContainer}>
            <View style={styles.statusWaitlisted}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.backgroundColor },
                ]}
              >
                <Text
                  style={[styles.statusIcon, { color: statusConfig.color }]}
                >
                  {statusConfig.icon}
                </Text>
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {statusConfig.text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onWaitListPress && onWaitListPress()}
              >
                <AntDesign name="exclamation-circle" size={15} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.nextDueContainer}>
              <Text style={styles.subText}>Next Due</Text>
              <Text style={styles.date}>
                {nextTranDate
                  ? nextTranDate
                  : "No due date"}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
            <Button
              style={{
                backgroundColor: Colors.dark.text,
                paddingVertical: resHeight(1.5),
              }}
              title="Apply for Loan"
              onPress={handleSubmit}
              textStyle={{ color: Colors.dark.background }}
            />
            <View>
              <Text style={styles.subText}>Next Due</Text>
              <Text style={styles.date}>
                {nextTranDate
                  ? nextTranDate : "No due date"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 20,
    padding: 20,
    height: resHeight(22),
    justifyContent: "space-between",
  },
  statusCard: {},
  label: {
    color: "#fff",
    fontSize: resFont(12),
    fontFamily: "OutfitRegular",
  },
  amount: {
    color: "#fff",
    fontSize: resFont(25),
    fontFamily: "OutfitBold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: resHeight(2),
    paddingVertical: resHeight(1),
    borderRadius: resHeight(3),
  },
  statusWaitlisted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusIcon: {
    fontSize: resFont(12),
    marginRight: resHeight(0.5),
    fontFamily: "OutfitBold",
  },
  statusText: {
    fontSize: resFont(12),
    fontWeight: "600",
    fontFamily: "OutfitRegular",
  },
  nextDueContainer: {
    alignItems: "flex-end",
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

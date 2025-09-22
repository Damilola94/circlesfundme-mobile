import ExportIcons from "@/assets/icons/ExportIcons";
import ImportIcons from "@/assets/icons/ImportIcons";
import { resFont, resHeight } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface NotificationCardProps {
  title: string;
  time: string;
  amount?: string | null;
}

export default function NotificationCard({
  title,
  time,
  amount,
}: NotificationCardProps) {
  const isCredit = amount?.includes("+");
  const isDebit = amount?.includes("-");
  const isNeutral = !amount;

  const getBackgroundColor = () => {
    if (isCredit) return "#e0f9f1";
    if (isDebit) return "#fde9e9";
    return "#E6BB1D0D";
  };
  const getIcon = () => {
    if (isCredit) return <ImportIcons />;
    if (isDebit) return <ExportIcons />;
    return <AntDesign name="exclamation-circle" size={24} color="#E6BB1D" />;
  };

  const getAmountColor = () => {
    if (isCredit) return "#00C281";
    if (isDebit) return "#D01D1D";
    return "#E6BB1D";
  };

  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getBackgroundColor() },
          ]}
        >
          {getIcon()}
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      {amount && (
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {amount}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: resHeight(1.5),
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: resHeight(5),
    height: resHeight(5),
    borderRadius: resHeight(2.5),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: resFont(11),
    color: "#1A1A1A",
    fontFamily: "OutfitMedium",
  },
  time: {
    fontSize: resFont(11),
    color: "#999",
    marginTop: 2,
    fontFamily: "OutfitRegular",
  },
  amount: {
    fontSize: resFont(12),
    fontWeight: "bold",
    marginLeft: 8,
    fontFamily: "OutfitMedium",
  },
  neutralIcon: {
    fontSize: resFont(16),
    fontWeight: "bold",
    color: "#999",
  },
});

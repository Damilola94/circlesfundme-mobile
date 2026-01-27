/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import Button from "@/components/ui/Buttton";
import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";

type LoanRepayment = {
  id: string;
  amount: number;
  charges: number;
  amountIncludingCharges: number;
  dueDate: string;
  status: string;
};

export default function BulkRepaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loanId } = useLocalSearchParams<{ loanId: string }>();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["loan-repayments", loanId],
    queryFn: () =>
      handleFetch({
        endpoint: "loanapplications",
        extra: "my-loan-repayments",
        pQuery: {
          pageSize: 1000,
          status: "Unpaid",
        },
        auth: true,
      }),
  });

  const repayments: LoanRepayment[] = data?.data || [];

  const allSelected =
    repayments.length > 0 && selectedIds.length === repayments.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : repayments.map((r) => r.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalAmount = useMemo(() => {
    return repayments
      .filter((r) => selectedIds.includes(r.id))
      .reduce((sum, r) => sum + r.amountIncludingCharges, 0);
  }, [selectedIds, repayments]);

  const payMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "financials",
        extra: "bulk-loan-repayment",
        method: "POST",
        auth: true,
        body: {
          amount: totalAmount,
          paymentMethod: "bank_transfer",
        },
      }),
    onSuccess: (res: any) => {
      if (!res?.isSuccess) {
        Toast.show({
          type: "error",
          text1: "Payment failed",
          text2: res?.message || "Try again",
        });
        return;
      }
      router.push({
        pathname: "/loan-bank-payment/card-info",
        params: {
          url: res?.data?.authorizationUrl,
          reference: res?.data?.reference,
        },
      });
    },
    onError: (e: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e?.message || "Something went wrong",
      });
    },
  });

  if (isLoading) {
    return <Loader message="Loading loan repayments..." />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { marginTop: insets.top || 40 },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <AntDesign name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bulk Loan Repayment</Text>
        </View>

        {/* Select All */}
        {repayments.length > 0 && (
          <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll}>
            <Ionicons
              name={allSelected ? "checkbox" : "checkbox-outline"}
              size={22}
              color={Colors.dark.primary}
            />
            <Text style={styles.selectAllText}>Select all</Text>

            {selectedIds.length > 0 && (
              <Text style={styles.totalSelected}>
                ₦{totalAmount.toLocaleString()} ({selectedIds.length})
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Repayment List */}
        {repayments.map((item) => {
          const selected = selectedIds.includes(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, selected && styles.selectedCard]}
              onPress={() => toggleSelectOne(item.id)}
            >
              <Ionicons
                name={selected ? "checkbox" : "checkbox-outline"}
                size={22}
                color={Colors.dark.primary}
              />

              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.leftAmount}>
                    ₦{item.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.chargeText}>
                    Charges: ₦{item.charges.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.rightBlock}>
                  <Text style={styles.totalAmount}>
                    ₦{item.amountIncludingCharges.toLocaleString()}
                  </Text>
                  <Text style={styles.dueDate}>
                    Due: {moment(item.dueDate).format("DD/MM/YYYY")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {repayments.length === 0 && (
          <Text style={styles.emptyText}>
            No unpaid loan repayments 🎉
          </Text>
        )}

        <View style={{ marginVertical: resHeight(2) }} />

        <Button
          title={`Pay ₦${totalAmount?.toLocaleString()}`}
          disabled={selectedIds?.length === 0 || payMutation?.isPending}
          onPress={() => payMutation?.mutate()}
        />
        <View style={{ marginVertical: resHeight(2) }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { padding: 20 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    position: "relative",
    marginBottom: resHeight(3),
  },

  backButton: {
    position: "absolute",
    left: 0,
    backgroundColor: Colors.dark.text,
    borderRadius: 20,
    width: 40,
    height: 40,
    padding: 8,
  },

  headerTitle: {
    fontSize: resFont(16),
    fontWeight: "bold",
  },

  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: resHeight(2),
  },

  selectAllText: {
    marginLeft: 8,
    fontSize: resFont(14),
    fontWeight: "500",
  },

  totalSelected: {
    marginLeft: "auto",
    fontSize: resFont(14),
    fontWeight: "bold",
    color: Colors.dark.primary,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: resHeight(2),
    backgroundColor: "#F6F6F6",
    borderRadius: resHeight(1),
    marginBottom: resHeight(2),
  },

  selectedCard: {
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },

  cardContent: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftAmount: {
    fontSize: resFont(14),
    fontWeight: "600",
  },

  chargeText: {
    fontSize: resFont(11),
    color: "#777",
    marginTop: 2,
  },

  rightBlock: {
    alignItems: "flex-end",
  },

  totalAmount: {
    fontSize: resFont(15),
    fontWeight: "bold",
    color: Colors.dark.primary,
  },

  dueDate: {
    fontSize: resFont(11),
    color: "#666",
    marginTop: 2,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: resFont(14),
  },
});

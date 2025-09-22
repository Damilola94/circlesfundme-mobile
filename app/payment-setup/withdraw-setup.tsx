 
import Button from "@/components/ui/Buttton";
import Input from "@/components/ui/Input";
import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import SelectInput from "@/components/ui/SelectInput";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Loader from "@/components/ui/Loader";
import Toast from "react-native-toast-message";

interface Bank {
  bankName: string;
}

interface BanksResponse {
  data: Bank[];
}

export default function WithdrawScreen() {
  const { data: banksData } = useQuery({
    queryKey: ["banks"],
    queryFn: () => handleFetch({ endpoint: "financials/banks", auth: true }),
  });

  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("");
  const insets = useSafeAreaInsets();
  const [bank, setBank] = useState("");

  const bankOptions: string[] =
    (banksData as BanksResponse)?.data?.map((bank: Bank) => bank.bankName) ||
    [];

  const selectedBankCode = banksData?.data?.find(
    (item: { bankName: string; bankCode: string }) =>
      item.bankName.toLowerCase().includes(bank.toLowerCase())
  )?.bankCode;

  const {
    data: accountNameData,
    refetch: refetchAccountName,
    isFetching: isFetchingName,
  } = useQuery({
    queryKey: ["account-name-enquiry", accountNumber, selectedBankCode],
    enabled: false,
    queryFn: () =>
      handleFetch({
        endpoint: "financials/account-name-enquiry",
        auth: true,
        method: "GET",
        pQuery: {
          AccountNumber: accountNumber,
          BankCode: selectedBankCode,
        },
      }),
  });

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBankCode) {
      refetchAccountName();
    }
  }, [accountNumber, refetchAccountName, selectedBankCode]);

  const createWithdrawalMutation = useMutation({
    mutationFn: (body: { accountNumber: string; bankCode: string }) =>
      handleFetch({
        endpoint: "users/create-withdrawal-setting",
        method: "POST",
        auth: true,
        body,
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Withdrawal account saved successfully",
      });
      router.push("/(tabs)/dashboard");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleSubmit = () => {
    if (!accountNumber || accountNumber.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid account number",
      });
      return;
    }

    if (!selectedBankCode) {
      Toast.show({
        type: "error",
        text1: "Please select a valid bank",
      });
      return;
    }

    createWithdrawalMutation.mutate({
      accountNumber,
      bankCode: selectedBankCode,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={insets.top || 40}
    >
      {createWithdrawalMutation.isPending && <Loader />}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <AntDesign name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Withdrawal Account</Text>
          </View>

          <ProgressStepsBar currentStep={2} totalSteps={2} />
          <Text style={styles.title}>Withdrawal</Text>

          <Input
            label="Account Number"
            placeholder="0000000000"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            maxLength={10}
          />
          <SelectInput
            label="Bank"
            value={bank}
            onSelect={setBank}
            placeholder="Select Bank"
            options={bankOptions}
            hasSearch
            fixedHeight
          />
          {accountNameData?.data && (
            <Text style={styles.accountNumber}>
              {isFetchingName
                ? "Fetching account name..."
                : accountNameData?.data || ""}
            </Text>
          )}
          <View style={{ marginBottom: resHeight(10) }} />
          <Button
            title={
              createWithdrawalMutation.isPending ? "Submitting..." : "Continue"
            }
            onPress={handleSubmit}
            disabled={createWithdrawalMutation.isPending}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: resFont(22),
    fontWeight: "bold",
    marginVertical: 20,
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  accountNumber: {
    backgroundColor: "rgba(112, 231, 65, 0.2)",
    color: Colors.dark.primary,
    padding: resHeight(2.5),
    borderRadius: resHeight(3),
    fontSize: resFont(10),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: resHeight(2),
  },
});


import Button from "@/components/ui/Buttton";
import EmptyState from "@/components/ui/Empty";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import SelectInput from "@/components/ui/SelectInput";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";

import { resFont, resHeight } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import Toast from "react-native-toast-message";

interface Bank {
  bankName: string;
}

interface BanksResponse {
  data: Bank[];
}

export default function PaymentSettingScreen() {
  const { data: banksData } = useQuery({
    queryKey: ["banks"],
    queryFn: () => handleFetch({ endpoint: "financials/banks", auth: true }),
  });
  const queryClient = useQueryClient();

  const userData = queryClient.getQueryData(["users-me"]) as {
    data?: {
      email: string;
      withdrawalSetting: {
        id: string;
        accountNumber: string;
        accountName: string;
        bankCode: string;
      };
    };
  };
  const setting = userData?.data?.withdrawalSetting;

  const hasWithdrawalSetting =
    setting &&
    (setting.accountNumber || setting.accountName || setting.bankCode);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [accountNumber, setAccountNumber] = useState("");
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

  useEffect(() => {
    const setting = userData?.data?.withdrawalSetting;
    if (setting) {
      const bankName = banksData?.data?.find(
        (b: any) => b.bankCode === setting.bankCode
      )?.bankName;

      setBank(bankName || "");
      setAccountNumber(setting.accountNumber || "");
    }
  }, [userData, banksData]);

  const finalAccountName =
    accountNameData?.data ||
    userData?.data?.withdrawalSetting?.accountName ||
    "";

  const sendOtpMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "accounts/send-onboarding-otp",
        method: "POST",
        body: { email: userData?.data?.email },
      }),
    onSuccess: () => {
      router.push({
        pathname: "/profile/verify-otp",
        params: {
          withdrawalSettingId: userData?.data?.withdrawalSetting?.id,
          accountNumber,
          email: userData?.data?.email,
          bankCode: selectedBankCode,
        },
      });
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to send OTP",
        text2: err?.message || "Try again later",
      });
    },
  });

  const handleSubmit = () => {
    if (accountNumber.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Account Number must be 10 digits",
      });
      return;
    }
    if (!selectedBankCode || !userData?.data?.email) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
      });
      return;
    }
    sendOtpMutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={insets.top || 40}
    >
      {sendOtpMutation.isPending && <Loader />}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <AntDesign name="arrow-left" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Payment Settings</Text>
          </View>

          {!hasWithdrawalSetting ? (
            <EmptyState
              subtitle=""

              title="No account detail is set up"
            />
          ) : (
            <View>
              <Input
                label="Account Number"
                placeholder="0000000000"
                value={accountNumber}
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={setAccountNumber}
              />
              <SelectInput
                label="Select Bank"
                value={bank}
                onSelect={setBank}
                placeholder="Select Bank"
                options={bankOptions}
                hasSearch
                fixedHeight
              />
              {finalAccountName && (
                <Text style={styles.accountNumber}>
                  {isFetchingName
                    ? "Fetching account name..."
                    : finalAccountName || ""}
                </Text>
              )}
              <View style={{ marginBottom: resHeight(10) }} />
              <Button title="Update"
                disabled={isFetchingName || sendOtpMutation.isPending}
                onPress={handleSubmit} />
            </View>
          )}
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
    fontFamily: "OutfitMedium",
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

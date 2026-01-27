import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
// import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { formatAmount, resFont, resHeight, resWidth } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
// import { AntDesign, Ionicons } from "@expo/vector-icons";
import Loader from "@/components/ui/Loader";
import SelectInput from "@/components/ui/SelectInput";
import handleFetch from "@/services/api/handleFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/ui/Buttton";

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
interface LoanInfo {
  data: {
    eligibleLoan: number;
    serviceCharge: number;
    totalRepayment: number;
    postLoanWeeklyContribution: number;
  };
  scheme: string;
}

export default function LoanApplication() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loanData } = useLocalSearchParams();
  const [remittanceWeekDay, setRemittanceWeekDay] = useState("");
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData(["users-me"]) as {
    data?: {
      withdrawalSetting: {
        accountNumber: string;
        accountName: string;
        bankCode: string;
      };
    };
  };

  const banksData = queryClient.getQueryData(["banks"]) as {
    data?: {
      bankCode: string;
      bankName: string;
    }[];
  };

  const selectedBankName = banksData?.data?.find(
    (item) =>
      item.bankCode.toLowerCase() ===
      userData?.data?.withdrawalSetting?.bankCode.toLowerCase()
  )?.bankName;

  const [loanInfo, setLoanInfo] = useState<LoanInfo | null>(null);
  const [loanStep, setLoanStep] = useState<"loanProceed" | null>(null);

  useEffect(() => {
    if (loanData) {
      try {
        const parsed = JSON.parse(
          Array.isArray(loanData) ? loanData[0] : loanData
        );
        setLoanInfo(parsed);

        if (parsed.scheme === "Auto Finance Contribution") {
        }
      } catch (error) {
        console.error("Error parsing loanData:", error);
      }
    }
  }, [loanData]);

  // const {
  //   file: utilityBill,
  //   pickFile,
  //   error,
  // } = useDocumentPicker({
  //   allowedTypes: ["application/pdf", "image/png", "image/jpeg"],
  //   maxSizeMB: 10,
  // });

  const handleSubmit = () => {
    if (!remittanceWeekDay) {
      alert("Please select a remittance day for your loan repayment.");
      return;
    }
    setLoanStep("loanProceed");
  };

  const loanMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "loanapplications",
        extra: "create",
        auth: true,
        method: "POST",
        body: {
          WeekDay: String(remittanceWeekDay || ""),
        },
      }),
    onSuccess: async (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Loan Application Failed",
          text2: res?.message || "Something went wrong",
        });
        return;
      }
      Toast.show({
        type: "success",
        text1: "Loan Application Submitted",
      });
      setLoanStep(null)
      router.push("/loan-setup/loan-application-success");
    },
    onError: (error: any) => {
      setLoanStep(null)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleContinue = () => {
    loanMutation.mutate();
  };

  const renderLoanModal = () => {
    switch (loanStep) {
      case "loanProceed":
        return (
          <Modal transparent visible>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { height: "80%" }]}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setLoanStep(null)}
                >
                  <AntDesign name="close-circle" size={12} color="black" />
                </TouchableOpacity>

                <ScrollView
                  style={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.amountCard}>
                    <Text style={styles.cardLabel}>Eligible Loan Amount</Text>
                    <Text style={styles.cardAmount}>
                      {formatAmount(loanInfo?.data?.eligibleLoan)}
                    </Text>
                  </View>

                  <View style={styles.amountCard}>
                    <Text style={styles.cardLabel}>Total Amount Repayable</Text>
                    <Text style={styles.cardAmount}>
                      {formatAmount(loanInfo?.data?.totalRepayment)}
                    </Text>
                  </View>

                  <View style={styles.dividerLine} />

                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        Subscription Scheme:
                      </Text>
                      <Text style={styles.detailValue}>{loanInfo?.scheme}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Repayment Term:</Text>
                      <Text style={styles.detailValue}>
                        {loanInfo?.scheme === "Weekly Contribution Scheme"
                          ? "52 Weeks" :
                          loanInfo?.scheme === "Daily Contribution Scheme"
                            ? "365 Weeks"
                            : loanInfo?.scheme === "Auto Finance Contribution"
                              ? "208 Weeks"
                              : "12 Months"}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        {loanInfo?.scheme === "Auto Finance Contribution"
                          ? "Post Loan Weekly Contribution:"
                          : "Service Charge:"}
                      </Text>
                      <Text style={styles.detailValue}>
                        {formatAmount(
                          loanInfo?.scheme === "Auto Finance Contribution"
                            ? loanInfo?.data?.postLoanWeeklyContribution
                            : loanInfo?.data?.serviceCharge
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dividerLine} />

                  <View style={styles.bankDetailsSection}>
                    <View style={[styles.detailRow, { paddingVertical: 0 }]}>
                      <Text style={styles.bankDetailsLabel}>
                        Recipient Bank Details
                      </Text>
                      <Text style={styles.accountNumber}>
                        {userData.data?.withdrawalSetting?.accountNumber}
                      </Text>
                    </View>

                    <View style={styles.bankInfo}>
                      <Text style={styles.accountName}
                      >
                        {userData.data?.withdrawalSetting?.accountName}
                      </Text>
                      <Text style={styles.bankName}>{selectedBankName}</Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Confirm Loan Application"
                    disabled={loanMutation.isPending}
                    onPress={() => handleContinue()}
                  />
                </View>
              </View>
            </View>
          </Modal>
        );

      default:
        return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>

        {loanMutation.isPending && <Loader />}
        <View style={[styles.container, { marginTop: insets.top || 40 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <AntDesign name="arrow-left" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Loan Application</Text>
          </View>
          <SelectInput
            label="Remittance Day"
            value={remittanceWeekDay}
            style={{ marginBottom: resHeight(1) }}
            onSelect={setRemittanceWeekDay}
            placeholder="Choose a day to remit your loan repayment"
            options={WEEK_DAYS}
          />

          {/* <Text style={styles.label}>Upload Bank Statement</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
          <Ionicons name="cloud-upload-outline" size={32} color="#00A86B" />
          <Text style={styles.uploadTitle}>Upload Bank Statement</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {utilityBill && (
          <Text style={styles.selectedFileText}>
            Selected: {utilityBill.name}
          </Text>
        )}

        <View style={styles.fileInfo}>
          <Text style={styles.fileText}>
            Your bank Statement must cover the last 3 months
          </Text>
        </View> */}

          <View style={{ marginBottom: resHeight(2) }} />

          <Button title="Proceed" onPress={handleSubmit} />
          {renderLoanModal()}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: resFont(30),
    fontWeight: "500",
    marginTop: resHeight(4),
  },
  subtitle: {
    fontSize: resFont(12),
    marginTop: 10,
    marginBottom: resHeight(4),
    color: Colors.dark.textLight,
  },
  label: {
    marginVertical: resHeight(2),
    fontWeight: "500",
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
    color: Colors.dark.background,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#00A86B",
    borderStyle: "dashed",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F7FDF9",
  },
  uploadTitle: {
    color: "#00A86B",
    fontWeight: "600",
    fontSize: resFont(14),
    marginTop: 10,
    fontFamily: "OutfitRegular",
  },
  fileInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  fileText: {
    fontSize: resFont(11),
    color: "#999",
    fontFamily: "OutfitRegular",
  },
  errorText: {
    color: "red",
    fontSize: resFont(11),
    marginTop: 5,
  },
  selectedFileText: {
    marginTop: 5,
    fontSize: resFont(12),
    fontStyle: "italic",
    color: "#333",
  },
  loanDetailsContainer: {
    padding: resHeight(0.5),
  },
  loanLabel: {
    fontSize: resFont(12),
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  loanAmount: {
    fontSize: resFont(36),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
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
    fontSize: resFont(14),
    fontWeight: "bold",
    color: "#000",
  },
  detailsGrid: {
    marginBottom: resHeight(7),
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginVertical: resHeight(2),
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: resFont(12),
    color: "#666",
    lineHeight: 18,
    textAlign: "left",
    marginBottom: resHeight(5),
  },
  linkText: {
    color: Colors.dark.primary,
  },
  closeIcon: {
    fontSize: resFont(18),
    color: "#333",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    position: "relative",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  amountCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: resFont(12),
    color: "#666",
    fontFamily: "OutfitRegular",
    flex: 1,
  },
  cardAmount: {
    fontSize: resFont(16),
    fontWeight: "bold",
    color: "#000",
    fontFamily: "OutfitBold",
    textAlign: "right",
  },
  detailsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: resFont(12),
    color: "#666",
    fontFamily: "OutfitRegular",
    flex: 1,
  },
  detailValue: {
    fontSize: resFont(12),
    color: "#000",
    fontFamily: "OutfitMedium",
    fontWeight: "500",
    textAlign: "right",
  },
  bankDetailsSection: {
    marginTop: 20,
  },
  bankDetailsLabel: {
    fontSize: resFont(12),
    color: "#666",
    marginBottom: 8,
    fontFamily: "OutfitRegular",
  },
  bankInfo: {
    alignItems: "flex-end",
  },
  accountNumber: {
    fontSize: resFont(14),
    fontWeight: "bold",
    fontFamily: "OutfitBold",
    color: "#000",
    marginBottom: 4,
  },
  accountName: {
    fontSize: resFont(12),
    color: "#000",
    marginBottom: 4,
    fontFamily: "OutfitMedium",
    width: resWidth(40),
    textAlign: "right",
  },
  bankName: {
    fontSize: resFont(12),
    color: "#666",
    fontFamily: "OutfitRegular",
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
});

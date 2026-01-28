/* eslint-disable react/jsx-key */
/* eslint-disable import/no-duplicates */
"use client";

import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContributionsCard from "@/components/dashboard/ContributionBreakDownCard";
import ContributionCard from "@/components/dashboard/ContributionCard";
import LoanCard from "@/components/dashboard/LoanCard";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import UserGreeting from "@/components/dashboard/UserGreeting";
import Button from "@/components/ui/Buttton";
import CustomCheckbox from "@/components/ui/CheckBox";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import SetupNotice from "@/components/ui/SetupNotice";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import {
  formatAmount,
  formatAmountWithThresholds,
  resFont,
  resHeight,
} from "@/utils/utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

interface WalletItem {
  title: string;
  balance: string;
  scheme: string;
}

const DashboardScreen = () => {
  const { data: userData } = useQuery({
    queryKey: ["users-me"],
    queryFn: () => handleFetch({ endpoint: "users/me", auth: true }),
  });

  const { data: walletData } = useQuery({
    queryKey: ["financials-my-wallets"],
    queryFn: () =>
      handleFetch({ endpoint: "financials/my-wallets", auth: true }),
  });

  const { data: banksData } = useQuery({
    queryKey: ["banks"],
    queryFn: () => handleFetch({ endpoint: "financials/banks", auth: true }),
  });

  const { data: loanData } = useQuery({
    queryKey: ["has-active-loan"],
    queryFn: () =>
      handleFetch({ endpoint: "financials/has-active-loan", auth: true }),
  });

  const { data: eligibleLoanData } = useQuery({
    queryKey: ["users-my-eligible-loan"],
    queryFn: () =>
      handleFetch({ endpoint: "users/my-eligible-loan", auth: true }),
  });

  const maxLoan = walletData?.data?.find(
    (item: WalletItem) => item.title === "Maximum Loan Eligible"
  );

  const activeLoanStatus = loanData?.data?.hasActiveLoan
    ? loanData?.data?.status
    : maxLoan?.action;
  const contribution = walletData?.data?.find(
    (item: WalletItem) => item.title === "Your contribution"
  );

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loanStep, setLoanStep] = useState<
    "notEligible" | "paymentIncomplete" | "loanApplication" | null
  >(null);
  const [waitlist, setWaitlist] = useState<
    "Active" | "Pending" | "Waitlist" | "Apply for Loan" | null
  >(null);
  const [withdrawal, setWithdrawal] = useState<
    "withdrawal" | "withdrawalFailed" | null
  >(null);
  const [withdrawalMsg, setWithdrawalMsg] = useState<string>("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [deductChargeFromBalance, setDeductChargeFromBalance] = useState(true);
  const queryClient = useQueryClient();

  const loanStepValidation =
    userData?.data?.onboardingStatus === "Completed"
      ? userData?.data?.isPaymentSetupComplete
        ? "loanApplication"
        : "paymentIncomplete"
      : "notEligible";

  const selectedBankName = banksData?.data?.find((item: { bankCode: string }) =>
    item?.bankCode
      ?.toLowerCase()
      ?.includes(userData?.data?.withdrawalSetting?.bankCode?.toLowerCase())
  )?.bankName;

  const data = [
    <LoanCard
      onPressApply={() => setLoanStep(loanStepValidation)}
      onWaitListPress={() => setWaitlist(activeLoanStatus)}
      loanStatus={activeLoanStatus ?? ""}
      amount={maxLoan?.balance ?? "₦ 0"}
      scheme={maxLoan?.scheme ?? ""}
      nextTranDate={maxLoan?.nextTranDate ?? ""}
    />,
    <ContributionCard
      onPressApply={() => setWithdrawal("withdrawal")}
      action={contribution?.action ?? ""}
      amount={contribution?.balance ?? "₦ 0"}
      scheme={contribution?.scheme ?? ""}
      nextTranDate={contribution?.nextTranDate ?? ""}
    />,
  ];

  const handleContinue = () => {
    setLoanStep(null);
    router.push({
      pathname: "/loan-setup/loan-application",
      params: {
        loanData: JSON.stringify({
          ...eligibleLoanData,
          scheme: maxLoan?.scheme,
        }),
      },
    });
  };

  const withdrawalMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "financials/withdraw",
        method: "POST",
        body,
        auth: true,
      }),
    onSuccess: async (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Withdrawal Failed",
          text2: res?.message || "Unable to process withdrawal",
        });
        setWithdrawal("withdrawalFailed");
        setWithdrawalMsg(res?.message || "Unable to process withdrawal");
        return;
      }
      Toast.show({
        type: "success",
        text1: "Withdrawal Successful",
      });
      setWithdrawal(null);
      await queryClient.invalidateQueries({
        queryKey: ["financials-my-wallets"],
      });
      router.push("/withdrawal-setup/withdrawal-application-success");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
      setWithdrawal("withdrawalFailed");
      setWithdrawalMsg(error?.message || "Something went wrong");
    },
  });

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount.replace(/[^0-9.]/g, ""));
    const balanceStr = contribution?.balance?.toString() || "0";
    const currentBalance = parseFloat(balanceStr.replace(/[^0-9.]/g, ""));

    if (!amount || amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Enter a valid amount",
      });
      return;
    }

    if (currentBalance < amount) {
      Toast.show({
        type: "error",
        text1: "Insufficient balance",
        text2: `You only have ₦${currentBalance.toLocaleString()} available.`,
      });
      return;
    }

    withdrawalMutation.mutate({
      amount,
      deductChargeFromBalance,
    });
  };

  const renderWaitListedModal = () => {
    if (!waitlist) return null;

    let title = "";
    let subtitle = "";
    let iconColor = "#666666";

    switch (waitlist) {
      case "Waitlist":
        title = "Your loan application has been waitlisted";
        subtitle =
          "This means your application has been approved but is waiting to be funded.";
        break;

      case "Active":
        title = "Your loan is now active";
        subtitle =
          "Congratulations! Your loan has been funded and is now active.";
        iconColor = Colors.dark.primary;
        break;

      case "Pending":
        title = "Your loan application is under review";
        subtitle =
          "We’re currently reviewing your loan application. You’ll be notified once a decision has been made.";
        iconColor = "#FFA500";
        break;

      default:
        return null;
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Modal transparent visible>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalCard,
                  {
                    height: height * 0.3,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setWaitlist(null)}
                >
                  <AntDesign name="close-circle" size={12} color="black" />
                </TouchableOpacity>
                <AntDesign
                  name="exclamation-circle"
                  size={80}
                  color={iconColor}
                />
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalSubTitle}>{subtitle}</Text>
              </View>
            </View>
          </Modal>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  const Detail = ({
    label,
    value,
    valueText,
  }: {
    label: string;
    value?: string;
    valueText?: string;
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {value && (
        <Text style={styles.detailValue}>{formatAmount(value || "0")}</Text>
      )}
      {valueText && <Text style={styles.detailValue}>{valueText}</Text>}
    </View>
  );

  const schemeText = (scheme: string | undefined) => {
    if (scheme?.includes("Daily")) return "Daily";
    if (scheme?.includes("Weekly")) return "Weekly";
    if (scheme?.includes("Monthly")) return "Monthly";
    if (scheme?.includes("Auto")) return "Auto Finance";
    return scheme ?? "—";
  };

  const renderLoanModal = () => {
    switch (loanStep) {
      case "notEligible":
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Modal transparent visible>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalCard}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setLoanStep(null)}
                    >
                      <AntDesign name="close-circle" size={12} color="black" />
                    </TouchableOpacity>
                    <AntDesign
                      name="exclamation-circle"
                      size={100}
                      color={"#D01D1D"}
                    />
                    <Text style={styles.modalTitle}>
                      You&apos;re not yet eligible for a Loan
                    </Text>
                    <Text style={styles.modalSubTitle}>
                      To qualify for a loan, you need to complete your
                      onboarding.
                    </Text>
                  </View>
                </View>
              </Modal>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );
      case "paymentIncomplete":
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Modal transparent visible>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalCard}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setLoanStep(null)}
                    >
                      <AntDesign name="close-circle" size={12} color="black" />
                    </TouchableOpacity>
                    <AntDesign
                      name="exclamation-circle"
                      size={100}
                      color={"#D01D1D"}
                    />
                    <Text style={styles.modalTitle}>
                      You’re yet to complete payment setup
                    </Text>
                    <Text style={styles.modalSubTitle}>
                      To access loan, you need to complete your payment setup.{" "}
                    </Text>
                  </View>
                </View>
              </Modal>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );
      case "loanApplication":
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Modal transparent visible={!!loanStep}>
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.modalCard,
                      {
                        height:
                          maxLoan?.scheme === "Auto Finance Contribution"
                            ? height * 0.9
                            : height * 0.8,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setLoanStep(null)}
                    >
                      <AntDesign name="close-circle" size={12} color="black" />
                    </TouchableOpacity>

                    <View style={styles.loanDetailsContainer}>
                      {maxLoan?.scheme === "Auto Finance Contribution" ? (
                        <View>
                          <Text style={styles.loanLabel}>Vehicle Cost</Text>
                          <Text style={styles.loanAmount}>
                            {formatAmountWithThresholds(
                              eligibleLoanData?.data?.costOfVehicle
                            )}
                          </Text>
                          <View style={styles.dividerLine} />
                          <View style={styles.detailsGrid}>
                            <Detail
                              label="Total Asset Value"
                              value={eligibleLoanData?.data?.totalAssetValue}
                            />
                            <Detail
                              label="Down Payment (10%)"
                              value={eligibleLoanData?.data?.downPayment}
                            />
                            <Detail
                              label="Loan Management Fee"
                              value={eligibleLoanData?.data?.loanManagementFee}
                            />
                            <Detail
                              label="Processing Fee"
                              value={eligibleLoanData?.data?.processingFee}
                            />
                            <Detail
                              label="Total Minimum Contribution (Your 10% Equity)"
                              value={userData?.data?.contributionAmount}
                            />
                            <Detail
                              label="Post-loan Weekly Contribution"
                              value={
                                eligibleLoanData?.data
                                  ?.postLoanWeeklyContribution
                              }
                            />
                            <Detail
                              label="Eligible Loan"
                              value={eligibleLoanData?.data?.eligibleLoan}
                            />
                            <Detail
                              label="Total Repayment"
                              value={eligibleLoanData?.data?.totalRepayment}
                            />
                          </View>
                          <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                              By clicking &apos;Proceed&apos;, you agree to the
                              <Text style={styles.linkText}>
                                loan terms
                              </Text>{" "}
                              and
                              <Text style={styles.linkText}>
                                repayment schedule
                              </Text>
                            </Text>
                          </View>
                          <Button title="Proceed" onPress={handleContinue} />
                        </View>
                      ) : (
                        <View>
                          <Text style={styles.loanLabel}>
                            Maximum Loan Eligible
                          </Text>
                          <Text style={styles.loanAmount}>
                            {formatAmount(eligibleLoanData?.data?.eligibleLoan)}
                          </Text>

                          <View style={styles.dividerLine} />

                          <View style={styles.detailsGrid}>
                            <Detail
                              label="Subscription Scheme"
                              valueText={schemeText(maxLoan?.scheme)}
                            />
                            <Detail
                              label="Principal Loan"
                              value={eligibleLoanData?.data?.principalLoan}
                            />
                            <Detail
                              label="Loan Management Fee"
                              value={eligibleLoanData?.data?.loanManagementFee}
                            />
                            <Detail
                              label="Repayment Term"
                              valueText={
                                maxLoan?.scheme === "Daily Contribution"
                                  ? "365 Days"
                                  : maxLoan?.scheme === "Weekly Contribution"
                                    ? "52 Weeks"
                                    : "12 Months"
                              }
                            />
                            <Detail
                              label="Post-Loan Service Charge"
                              value={
                                eligibleLoanData?.data?.postLoanServiceCharge
                              }
                            />
                            <Detail
                              label="Total Repayment"
                              value={eligibleLoanData?.data?.totalRepayment}
                            />
                          </View>

                          <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                              By clicking &apos;Proceed&apos;, you agree to the{" "}
                              <Text style={styles.linkText}>loan terms</Text>{" "}
                              and{" "}
                              <Text style={styles.linkText}>
                                repayment schedule
                              </Text>
                            </Text>
                          </View>

                          <Button title="Proceed" onPress={handleContinue} />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Modal>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );
      default:
        return null;
    }
  };

  const renderContributionModal = () => {
    switch (withdrawal) {
      case "withdrawalFailed":
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Modal transparent visible>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalCard}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setWithdrawal(null)}
                    >
                      <AntDesign name="close-circle" size={12} color="black" />
                    </TouchableOpacity>
                    <AntDesign
                      name="exclamation-circle"
                      size={100}
                      color={"#D01D1D"}
                    />
                    <Text style={styles.modalTitle}>Withdrawal Declined</Text>
                    <Text style={styles.modalSubTitle}>{withdrawalMsg}</Text>
                  </View>
                </View>
              </Modal>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );

      case "withdrawal":
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Modal transparent visible>
                {withdrawalMutation.isPending && <Loader />}
                <View style={styles.modalOverlayCont}>
                  <View style={styles.modalCardCont}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setWithdrawal(null)}
                    >
                      <AntDesign name="close-circle" size={12} color="black" />
                    </TouchableOpacity>

                    <View style={styles.modalContent}>
                      <View style={styles.iconContainer}>
                        <AntDesign
                          name="question-circle"
                          size={80}
                          color={Colors.dark.primary}
                        />
                      </View>

                      <View style={styles.textContainer}>
                        <Text style={styles.modalTitleCont}>
                          Do you wish to withdraw your contribution?
                        </Text>
                        <Text style={styles.modalSubTitleCont}>
                          Note that you will be charged ₦500 for the transaction
                        </Text>
                      </View>

                      <Input
                        label="How much do you want to withdraw?"
                        placeholder="Enter Amount"
                        value={withdrawalAmount}
                        containerStyle={{ width: "100%" }}
                        valueType="money"
                        returnKeyType="done"
                        onChangeText={setWithdrawalAmount}
                        keyboardType="phone-pad"
                      />

                      <CustomCheckbox
                        label="Deduct ₦500 charge from wallet balance"
                        checked={deductChargeFromBalance}
                        onToggle={() =>
                          setDeductChargeFromBalance((prev) => !prev)
                        }
                      />
                      <View style={styles.dividerLine} />

                      <View
                        style={[
                          styles.bankDetailsSection,
                          { alignItems: "center" },
                        ]}
                      >
                        <Text style={styles.bankDetailsLabel}>
                          Recipient Bank Details
                        </Text>
                        <Text style={styles.accountNumber}>
                          {userData?.data?.withdrawalSetting?.accountNumber ||
                            "N/A"}
                        </Text>
                        <Text style={styles.bankName}>
                          {selectedBankName || "N/A"}
                        </Text>
                        <Text
                          style={styles.accountName}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {userData?.data?.withdrawalSetting?.accountName ||
                            "N/A"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.buttonContainer}>
                      <Button title="Proceed" onPress={handleWithdrawal} />
                    </View>
                  </View>
                </View>
              </Modal>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        );

      default:
        return null;
    }
  };

  const onPressedPaymentSetup = () => {
    router.push("/payment-setup/payment-method");
  };

  const onPressedBankPaymentSetup = () => {
    router.push("/contribution-bank-payment/payment-method");
  };

  return (
    <View style={[styles.container, { marginTop: insets.top || 40 }]}>
      {userData?.data && (
        <UserGreeting
          name={`${userData.data.firstName} ${userData.data.lastName}`}
          avatarUrl={userData.data.profilePictureUrl}
        />
      )}
      <Carousel
        loop
        width={width * 0.9}
        height={resHeight(25)}
        autoPlay={false}
        mode="horizontal-stack"
        modeConfig={{ snapDirection: "left", stackInterval: 20 }}
        pagingEnabled
        data={data}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>{item}</View>
        )}
      />
      <View style={styles.indicatorContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.activeDot]}
          />
        ))}
      </View>
      {activeIndex === 0 && !userData?.data?.isPaymentSetupComplete ? (
        <SetupNotice
          title="You haven’t setup payments yet"
          buttonText="Complete Setup"
          onPress={onPressedPaymentSetup}
        />
      ) : activeIndex !== 0 ? (
        <View>
          <SetupNotice
            title="You can clear your contributions balance"
            buttonText="Clear All Now"
            onPress={onPressedBankPaymentSetup}
          />
          <ContributionsCard
            amount={userData?.data?.contributionAmount}
            installmentDesc={userData?.data?.installmentDesc}
            preInstallmentDesc={userData?.data?.preInstallmentDesc}
          />
        </View>
      ) : null}
      <RecentActivityList />
      {renderLoanModal()}
      {renderWaitListedModal()}
      {renderContributionModal()}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  cardWrapper: { width: "100%" },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.primary,
    width: 20,
    height: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    height: "40%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: resHeight(3),
    alignItems: "center",
    justifyContent: "center",
  },
  alert: {
    fontSize: 48,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: resFont(18),
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  modalSubTitle: {
    color: Colors.dark.textLight,
    fontSize: resFont(12),
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
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
    fontSize: resFont(30),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  detailsGrid: {
    marginBottom: resHeight(3),
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: resHeight(2),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: resHeight(2),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: resFont(12),
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: resFont(12),
    color: "#000",
    fontWeight: "500",
    textAlign: "right",
  },
  termsContainer: {
    marginBottom: resHeight(1),
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
  modalOverlayCont: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCardCont: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    height: "75%",
    position: "relative",
  },
  modalContent: {
    padding: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitleCont: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
    fontFamily: "OutfitSemiBold",
  },
  modalSubTitleCont: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "OutfitRegular",
  },
  bankDetailsSection: {
    width: "100%",
    marginBottom: 24,
  },
  bankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bankDetailsLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    fontFamily: "OutfitRegular",
    marginBottom: resHeight(1),
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "OutfitSemiBold",
  },
  bankInfo: {
    alignItems: "flex-end",
    fontFamily: "OutfitSemiBold",
  },
  accountName: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    fontFamily: "OutfitSemiBold",
    marginBottom: 4,
  },
  bankName: {
    fontSize: 14,
    color: "#666",
    fontFamily: "OutfitSemiBold",
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 25,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  proceedButton: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 25,
    paddingVertical: 14,
  },
});

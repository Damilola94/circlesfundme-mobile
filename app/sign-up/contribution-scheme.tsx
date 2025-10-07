"use client";

/* eslint-disable react/display-name */
/* eslint-disable react-hooks/exhaustive-deps */
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import SelectInput from "@/components/ui/SelectInput";
import { Colors } from "@/constants/Colors";
import useDebounce from "@/hooks/useDebounce";
import handleFetch from "@/services/api/handleFetch";
import { monthDayOptions } from "@/utils/dayMonth";
import { formatAmount, resFont, resHeight, toNumber } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/ui/Buttton";

const CONTRIBUTION_SCHEMES = [
  "Daily Contribution Scheme",
  "Weekly Contribution Scheme",
  "Monthly Contribution Scheme",
  "Auto Financing",
  "Tricycle Financing",
];
const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const REMITTANCE_TYPES = ["Weekly", "Monthly"];
const REMITTANCE_TYPES_TRICYLCE = ["Daily", "Weekly", "Monthly"];
const MONTH_DAY_LABELS = monthDayOptions.map((opt) => opt.label);

export default function ContributionScheme() {
  const params = useLocalSearchParams<{
    fullName: string;
    phone: string;
    dob: string;
    gender: string;
    bvn: string;
    documentUrl: string;
    documentName: string;
    documentType: string;
    utilityBillUrl: string;
    utilityBillName: string;
    utilityBillType: string;
    userAddress: string;
    selfieUrl: string;
    selfieName: string;
    selfieType: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [scheme, setScheme] = useState("");
  const [remittanceWeekDay, setRemittanceWeekDay] = useState("");
  const [remittanceMonthDay, setRemittanceMonthDay] = useState("");
  const [remittanceDayValue, setRemittanceDayValue] = useState<string>("");
  const [remittanceType, setRemittanceType] = useState<string>("");
  const [income, setIncome] = useState("");
  const [contribution, setContribution] = useState("");
  const [assetCost, setAssetCost] = useState("");
  const [error, setError] = useState("");
  const [additionalWeeklyContribution, setAdditionalWeeklyContribution] =
    useState("");
  const [isAdditionalContributionInvalid, setIsAdditionalContributionInvalid] =
    useState(false);

  const incomeValue = useMemo(() => {
    if (!income) return 0;
    return Number.parseFloat(income.replace(/,/g, "")) || 0;
  }, [income]);

  const contributionValue = useMemo(() => {
    if (!contribution) return 0;
    return Number.parseFloat(contribution.replace(/,/g, "")) || 0;
  }, [contribution]);

  const [vehicleBreakdown, setVehicleBreakdown] = useState({
    costOfVehicle: "",
    extraEngine: "",
    extraTyre: "",
    insurance: "",
    processingFee: "",
    downPayment: "",
    loanManagementFee: "",
    eligibleLoan: "",
    preLoanServiceCharge: "",
    baseContributionAmount: 0,
    totalRepayment: 0,
    postLoanWeeklyContribution: "",
  });

  const [regularBreakdown, setRegularBreakdown] = useState({
    principalLoan: "",
    loanManagementFee: "",
    eligibleLoan: "",
    preLoanServiceCharge: "",
    postLoanServiceCharge: "",
    totalRepayment: "",
    repaymentTerm: "",
  });

  const debouncedAssetCost = useDebounce(assetCost, 1000);
  const debouncedContributionValue = useDebounce(contributionValue, 1000);
  const debouncedAdditionalContribution = useDebounce(
    additionalWeeklyContribution,
    1000
  );

  const isAssetFinance = scheme === "Auto Financing";
  const isTricycleFinance = scheme === "Tricycle Financing";
  const shouldRenderDetails = !!debouncedAssetCost.trim();
  const shouldRenderRegularDetails =
    scheme === "Daily Contribution Scheme" ||
    scheme === "Weekly Contribution Scheme" ||
    scheme === "Monthly Contribution Scheme";
  const maxPercentage = scheme === "Weekly Contribution Scheme" ? 0.2 : 0.3;
  const isValidContribution = contributionValue <= maxPercentage * incomeValue;

  const { data: schemesData, isLoading: schemesLoading } = useQuery({
    queryKey: ["contribution-schemes"],
    queryFn: () => handleFetch({ endpoint: "contributionschemes/mini" }),
    gcTime: 15 * 60 * 1000,
  });

  const selectedSchemeId = useMemo(() => {
    if (!schemesData?.data || !scheme) return null;
    return schemesData.data.find((item: { name: string; id: string }) =>
      item.name.toLowerCase().includes(scheme.toLowerCase())
    )?.id;
  }, [schemesData, scheme]);

  const extraContribution = toNumber(additionalWeeklyContribution);
  const totalWeeklyContribution =
    extraContribution + toNumber(vehicleBreakdown.preLoanServiceCharge);

  const breakdownMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: isAssetFinance
          ? "contributionschemes/auto-finance-breakdown"
          : "contributionschemes/tricycle-finance-breakdown",
        method: "POST",
        body,
      }),
    onSuccess: (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Failed to fetch breakdown",
          text2: res?.message || "Try again later",
        });
        return;
      }
      const breakdown = res?.data;
      if (breakdown) {
        setVehicleBreakdown({
          costOfVehicle: breakdown.costOfVehicle || "",
          extraEngine: breakdown.extraEngine || "",
          extraTyre: breakdown.extraTyre || "",
          insurance: breakdown.insurance || "",
          processingFee: breakdown.processingFee || "",
          downPayment: breakdown.downPayment || "",
          loanManagementFee: breakdown.loanManagementFee || "",
          eligibleLoan: breakdown.eligibleLoan || "",
          preLoanServiceCharge: breakdown.preLoanServiceCharge || "",
          baseContributionAmount: breakdown.baseContributionAmount || 0,
          totalRepayment: breakdown.totalRepayment || 0,
          postLoanWeeklyContribution:
            breakdown.postLoanWeeklyContribution || "",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Breakdown Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const regularBreakdownMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "contributionschemes/regular-finance-breakdown",
        method: "POST",
        body,
      }),
    onSuccess: (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Failed to fetch breakdown",
          text2: res?.message || "Try again later",
        });
        return;
      }
      const breakdown = res?.data;
      if (breakdown) {
        setRegularBreakdown({
          principalLoan: breakdown.principalLoan || "",
          loanManagementFee: breakdown.loanManagementFee || "",
          eligibleLoan: breakdown.eligibleLoan || "",
          postLoanServiceCharge: breakdown.postLoanServiceCharge || "",
          preLoanServiceCharge: breakdown.preLoanServiceCharge || "",
          totalRepayment: breakdown.totalRepayment || "",
          repaymentTerm: breakdown.repaymentTerm || "",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Breakdown Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const submitUserDetailsMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "accounts/complete-onboarding",
        method: "POST",
        body,
        multipart: true,
        auth: true,
      }),
    onSuccess: async (res: {
      statusCode: string;
      status: number;
      message: any;
    }) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Submission Failed",
          text2: res?.message || "Invalid data",
        });
        return;
      }
      Toast.show({
        type: "success",
        text1: "Details Submitted",
      });
      const stored = await AsyncStorage.getItem("data");
      let session = stored ? JSON.parse(stored) : {};
      session.isKycComplete = true;
      await AsyncStorage.setItem("data", JSON.stringify(session));
      router.replace("/(tabs)/dashboard");
    },
    onError: (error: { message: any }) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  useEffect(() => {
    if (!shouldRenderDetails) return;
    const cost = Number.parseFloat(
      debouncedAssetCost?.replace(/,/g, "") || "0"
    );
    if (isNaN(cost) || cost <= 0) return;
    breakdownMutation.mutate({ costOfVehicle: cost });
  }, [debouncedAssetCost, shouldRenderDetails]);

  useEffect(() => {
    if (
      !shouldRenderRegularDetails ||
      debouncedContributionValue <= 0 ||
      !selectedSchemeId
    )
      return;
    regularBreakdownMutation.mutate({
      contributionSchemeId: selectedSchemeId,
      amount: debouncedContributionValue,
    });
  }, [
    debouncedContributionValue,
    selectedSchemeId,
    shouldRenderRegularDetails,
  ]);

  useEffect(() => {
    if (!debouncedAdditionalContribution.trim()) {
      setIsAdditionalContributionInvalid(false);
      return;
    }
    const base = toNumber(vehicleBreakdown.baseContributionAmount || 0);
    const userAmount = toNumber(debouncedAdditionalContribution);
    setIsAdditionalContributionInvalid(userAmount < base);
  }, [
    debouncedAdditionalContribution,
    vehicleBreakdown.baseContributionAmount,
  ]);

  useEffect(() => {
    if (
      scheme ||
      income ||
      contribution ||
      assetCost ||
      debouncedAdditionalContribution ||
      remittanceType ||
      remittanceWeekDay ||
      remittanceMonthDay
    ) {
      setError("");
    }
  }, [
    scheme,
    income,
    contribution,
    assetCost,
    debouncedAdditionalContribution,
    remittanceWeekDay,
    remittanceMonthDay,
  ]);

  const handleRemittanceDaySelect = useCallback((selectedLabel: string) => {
    setRemittanceMonthDay(selectedLabel);
    const selected = monthDayOptions.find((opt) => opt.label === selectedLabel);
    setRemittanceDayValue(selected?.value || "");
  }, []);

  const handleContinue = useCallback(async () => {
    if (!scheme) {
      setError("Please select a contribution scheme.");
      return;
    }

    if (isAssetFinance) {
      if (!assetCost) {
        setError("Please enter the cost of the vehicle.");
        return;
      }
      if (!remittanceType) {
        setError("Please select a remitance type.");
        return;
      }
      if (!debouncedAdditionalContribution.trim()) {
        setError("Please enter your contribution toward the 10% equity.");
        return;
      }
      if (remittanceType === "Weekly" && !remittanceWeekDay) {
        setError("Please select your weekly remittance day.");
        return;
      }
      if (remittanceType === "Monthly" && !remittanceMonthDay) {
        setError("Please select your monthly remittance day.");
        return;
      }
    } else if (isTricycleFinance) {
      if (!assetCost) {
        setError("Please enter the cost of the vehicle.");
        return;
      }
      if (!debouncedAdditionalContribution.trim()) {
        setError("Please enter your contribution toward the 10% equity.");
        return;
      }
      if (!remittanceType) {
        setError("Please select a remitance type.");
        return;
      }
      if (remittanceType === "Weekly" && !remittanceWeekDay) {
        setError("Please select your weekly remittance day.");
        return;
      }
      if (remittanceType === "Monthly" && !remittanceMonthDay) {
        setError("Please select your monthly remittance day.");
        return;
      }
    } else {
      if (!income || !contribution) {
        setError("Please fill in your income and preferred contribution.");
        return;
      }
      if (
        (scheme === "Weekly Contribution Scheme" && !remittanceWeekDay) ||
        (scheme === "Monthly Contribution Scheme" && !remittanceMonthDay)
      ) {
        setError("Please select your remittance day.");
        return;
      }
    }

    if (!isValidContribution && contribution) {
      const maxPercent =
        scheme === "Weekly Contribution Scheme" ||
        scheme === "Daily Contribution Scheme"
          ? "20%"
          : "30%";
      setError(`You cannot contribute more than ${maxPercent} of your income.`);
      return;
    }

    const intlPhone = params.phone?.replace(/^0/, "+234");
    const cost = Number(assetCost?.replace(/,/g, ""));
    const [day, month, year] = params.dob.split("/");
    const isoDob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    const payload = {
      FullName: String(params.fullName || ""),
      PhoneNumber: String(intlPhone || ""),
      DateOfBirth: String(isoDob || ""),
      Gender: String(params.gender || ""),
      Address: String(params.userAddress || ""),
      BVN: String(params.bvn || ""),
      ContributionSchemeId: String(selectedSchemeId || ""),
      Income: String(income || ""),
      CostOfVehicle: String(cost || ""),
      ContributionAmount: String(
        debouncedAdditionalContribution || contribution || ""
      ),
      WeekDay: String(remittanceWeekDay || ""),
      MonthDay: String(remittanceDayValue) || null,
      GovernmentIssuedIDUrl: params.documentUrl,
      UtilityBillUrl: params.utilityBillUrl,
      SelfieUrl: params.selfieUrl,
    };

    submitUserDetailsMutation.mutate(payload);
  }, [
    scheme,
    isAssetFinance,
    isTricycleFinance,
    assetCost,
    debouncedAdditionalContribution,
    remittanceType,
    remittanceWeekDay,
    remittanceMonthDay,
    income,
    contribution,
    isValidContribution,
    params,
    selectedSchemeId,
    remittanceDayValue,
    submitUserDetailsMutation,
  ]);

  if (schemesLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Loader message="Loading..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {submitUserDetailsMutation.isPending && (
        <Loader message="Submitting Details" />
      )}
      {regularBreakdownMutation.isPending && (
        <Loader message="Fetching Regular Breakdown..." />
      )}
      {breakdownMutation.isPending && (
        <Loader message="Fetching Auto Breakdown..." />
      )}
      <KeyboardAvoidingView
        style={[styles.keyboardContainer, { marginTop: insets.top || 40 }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ProgressStepsBar currentStep={5} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
        >
          <Text style={styles.title}>Contribution Scheme</Text>
          <Text style={styles.subtitle}>
            Select how you want to contribute and grow your funds.
          </Text>

          <SelectInput
            label="Contribution Scheme"
            value={scheme}
            onSelect={setScheme}
            placeholder="Select Your preferred scheme"
            options={CONTRIBUTION_SCHEMES}
          />

          {isAssetFinance && (
            <View>
              <Input
                label="What is the cost of the vehicle?"
                placeholder="Enter Amount"
                value={assetCost}
                valueType="money"
                onChangeText={setAssetCost}
                keyboardType="phone-pad"
              />
              {shouldRenderDetails && (
                <VehicleBreakdownDetails
                  vehicleBreakdown={vehicleBreakdown}
                  remittanceType={remittanceType}
                  setRemittanceType={setRemittanceType}
                  remittanceWeekDay={remittanceWeekDay}
                  setRemittanceWeekDay={setRemittanceWeekDay}
                  remittanceMonthDay={remittanceMonthDay}
                  handleRemittanceDaySelect={handleRemittanceDaySelect}
                  additionalWeeklyContribution={additionalWeeklyContribution}
                  setAdditionalWeeklyContribution={
                    setAdditionalWeeklyContribution
                  }
                  isAdditionalContributionInvalid={
                    isAdditionalContributionInvalid
                  }
                  totalWeeklyContribution={totalWeeklyContribution}
                />
              )}
            </View>
          )}

          {isTricycleFinance && (
            <View>
              <Input
                label="What is the cost of the Tricycle?"
                placeholder="Enter Amount"
                value={assetCost}
                valueType="money"
                onChangeText={setAssetCost}
                keyboardType="phone-pad"
              />
              {shouldRenderDetails && (
                <TricylceBreakdownDetails
                  vehicleBreakdown={vehicleBreakdown}
                  remittanceType={remittanceType}
                  setRemittanceType={setRemittanceType}
                  remittanceWeekDay={remittanceWeekDay}
                  setRemittanceWeekDay={setRemittanceWeekDay}
                  remittanceMonthDay={remittanceMonthDay}
                  handleRemittanceDaySelect={handleRemittanceDaySelect}
                  additionalWeeklyContribution={additionalWeeklyContribution}
                  setAdditionalWeeklyContribution={
                    setAdditionalWeeklyContribution
                  }
                  isAdditionalContributionInvalid={
                    isAdditionalContributionInvalid
                  }
                  totalWeeklyContribution={totalWeeklyContribution}
                />
              )}
            </View>
          )}

          {shouldRenderRegularDetails && (
            <View>
              <Input
                label={`What's your ${
                  scheme === "Weekly Contribution Scheme"
                    ? "Weekly Sales Revenue"
                    : scheme === "Daily Contribution Scheme"
                    ? "Daily Sales Revenue"
                    : "Monthly Income"
                } (NGN)?`}
                valueType="money"
                placeholder="Enter Amount"
                value={income}
                onChangeText={setIncome}
                keyboardType="phone-pad"
              />

              <Input
                label={`What's your preferred ${
                  scheme === "Weekly Contribution Scheme"
                    ? "weekly"
                    : scheme === "Daily Contribution Scheme"
                    ? "daily"
                    : "monthly"
                } contribution`}
                placeholder="Enter Amount"
                valueType="money"
                value={contribution}
                onChangeText={setContribution}
                keyboardType="phone-pad"
              />
              {isValidContribution && !!contribution && (
                <View>
                  <View style={styles.summaryBox}>
                    <View style={styles.groupText}>
                      <View>
                        <Text style={styles.summaryText}>Principal Loan</Text>
                        <Text style={styles.summarySubText}>
                          {scheme === "Weekly Contribution Scheme"
                            ? "52x of your weekly contribution"
                            : scheme === "Daily Contribution Scheme"
                            ? "365x of your daily contribution"
                            : "12x of your monthly contribution"}
                        </Text>
                      </View>
                      <Text style={styles.boldText}>
                        {regularBreakdown.principalLoan}
                      </Text>
                    </View>

                    <View style={styles.groupText}>
                      <View>
                        <Text style={styles.summaryText}>
                          Loan Mgt. Fee (6%)
                        </Text>
                        <Text style={styles.summarySubText}>
                          Loan Mgt. Fee over 4 years
                        </Text>
                      </View>
                      <Text style={styles.boldText}>
                        {regularBreakdown.loanManagementFee}
                      </Text>
                    </View>

                    <View style={styles.groupText}>
                      <View>
                        <Text style={styles.summaryText}>
                          Repayment Duration
                        </Text>
                      </View>
                      <Text style={styles.boldText}>{`${
                        scheme.includes("Weekly")
                          ? "52 weeks/1 yr"
                          : "12 months/1yr"
                      }`}</Text>
                    </View>

                    <View style={styles.groupText}>
                      <View>
                        <Text style={styles.summaryText}>Eligible Loan</Text>
                        <Text style={styles.summarySubText}>
                          {scheme === "Weekly Contribution Scheme"
                            ? "52x of your weekly contribution"
                            : scheme === "Daily Contribution Scheme"
                            ? "365x of your daily contribution"
                            : "12x of your monthly contribution"}
                        </Text>
                      </View>
                      <Text style={styles.boldText}>
                        {regularBreakdown.eligibleLoan}
                      </Text>
                    </View>

                    <View style={styles.groupText}>
                      <Text style={styles.summaryText}>
                        Pre-Loan Service Charge
                      </Text>
                      <Text style={styles.boldText}>
                        {regularBreakdown.preLoanServiceCharge}
                      </Text>
                    </View>
                    <View style={styles.groupText}>
                      <Text style={styles.summaryText}>
                        Post-Loan Service Charge
                      </Text>
                      <Text style={styles.boldText}>
                        {regularBreakdown.postLoanServiceCharge}
                      </Text>
                    </View>
                    <View style={styles.groupText}>
                      <Text style={styles.summaryText}>Total Repayment</Text>
                      <Text style={styles.boldText}>
                        {regularBreakdown.totalRepayment}
                      </Text>
                    </View>

                    <View style={styles.groupText}>
                      <Text style={styles.summaryText}>Repayment Term</Text>
                      <Text style={styles.boldText}>
                        {regularBreakdown.repaymentTerm}
                      </Text>
                    </View>

                    <View style={{ marginBottom: resHeight(1) }} />
                  </View>
                  {scheme === "Weekly Contribution Scheme" ? (
                    <SelectInput
                      label="Remittance Day"
                      value={remittanceWeekDay}
                      style={{ marginBottom: resHeight(1) }}
                      onSelect={setRemittanceWeekDay}
                      placeholder="Choose contribution day"
                      options={WEEK_DAYS}
                    />
                  ) : scheme === "Monthly Contribution Scheme" ? (
                    <SelectInput
                      label="Remittance Day"
                      value={remittanceMonthDay}
                      style={{ marginBottom: resHeight(1) }}
                      onSelect={handleRemittanceDaySelect}
                      placeholder="Choose contribution day"
                      options={MONTH_DAY_LABELS}
                    />
                  ) : null}
                </View>
              )}
            </View>
          )}

          {!isValidContribution && contribution && (
            <Text style={styles.error}>
              You cannot contribute more than{" "}
              {scheme === "Weekly Contribution Scheme" ? "20%" : "30%"} of your
              income.
            </Text>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginBottom: resHeight(5) }} />
          <Button
            title={
              submitUserDetailsMutation.isPending
                ? "Accepting..."
                : "Accept and Continue"
            }
            onPress={handleContinue}
            disabled={submitUserDetailsMutation.isPending}
          />
          <View style={{ marginBottom: resHeight(10) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const TricylceBreakdownDetails = React.memo(
  ({
    vehicleBreakdown,
    remittanceType,
    setRemittanceType,
    remittanceWeekDay,
    setRemittanceWeekDay,
    remittanceMonthDay,
    handleRemittanceDaySelect,
    additionalWeeklyContribution,
    setAdditionalWeeklyContribution,
    isAdditionalContributionInvalid,
    totalWeeklyContribution,
  }: any) => (
    <View>
      <View style={styles.summaryBox}>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Cost of Vehicle</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.costOfVehicle}</Text>
        </View>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Insurance (6%) over 4 years</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.insurance}</Text>
        </View>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Processing Fee</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.processingFee}</Text>
        </View>
      </View>
      <View style={{ marginVertical: resHeight(1) }} />
      <Input
        label="User Contribution (Down Payment)"
        value={`₦${vehicleBreakdown.downPayment}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="User Contribution (Down Payment)"
        infoContent="10% of total asset value. Paid from user's savings contribution."
      />
      <Input
        label="Eligible Loan (Principal)"
        value={`₦${vehicleBreakdown.eligibleLoan}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Eligible Loan (Principal)"
        infoContent="90% of total asset value."
      />
      <Input
        label="Loan Management Fee over 4 years"
        value={`₦${vehicleBreakdown.loanManagementFee}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Loan Management Fee over 4 years"
        infoContent="Annually: 6% of Asset Value. Total for 4 Years: Annual Loan Management Fee × 4"
      />
      <Input
        label="Pre-Loan Service Charge"
        placeholder="Enter Amount"
        value={`₦${vehicleBreakdown.preLoanServiceCharge}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Loan Management Fee over 4 years"
        infoContent="A monthly server charge as you save up your 10% equity."
      />
      <SelectInput
        label="Remittance Type"
        value={remittanceType}
        onSelect={setRemittanceType}
        placeholder="Choose remittance type for your 10% equity"
        options={REMITTANCE_TYPES_TRICYLCE}
      />
      {remittanceType === "Weekly" ? (
        <SelectInput
          label="Remittance Day"
          value={remittanceWeekDay}
          style={{ marginBottom: resHeight(1) }}
          onSelect={setRemittanceWeekDay}
          placeholder="Choose contribution day"
          options={WEEK_DAYS}
        />
      ) : remittanceType === "Monthly" ? (
        <SelectInput
          label="Remittance Day"
          value={remittanceMonthDay}
          style={{ marginBottom: resHeight(1) }}
          onSelect={handleRemittanceDaySelect}
          placeholder="Choose contribution day"
          options={MONTH_DAY_LABELS}
        />
      ) : null}
      <Input
        label={`Minimum ${
          remittanceType === "Daily" ? "Daily" :
          remittanceType === "Weekly" ? "Weekly" : "Monthly"
        } Contribution`}
        placeholder="Enter Amount"
        valueType="money"
        value={additionalWeeklyContribution}
        onChangeText={setAdditionalWeeklyContribution}
        keyboardType="phone-pad"
        showInfoIcon={true}
        infoTitle={`Minimum ${
          remittanceType === "Weekly" ? "Weekly" : "Monthly"
        } Contribution`}
        infoContent={`Enter any amount from ₦${vehicleBreakdown.baseContributionAmount} and above to save toward your 10% equity down payment.`}
        isInvalid={isAdditionalContributionInvalid}
        errorMessage={
          isAdditionalContributionInvalid
            ? `Amount must be ${formatAmount(
                vehicleBreakdown.baseContributionAmount
              )} or more.`
            : undefined
        }
      />
      <Input
        label={`Total Minimum ${
          remittanceType === "Daily" ? "Daily" :
          remittanceType === "Weekly" ? "Weekly" : "Monthly"
        } Contribution`}
        value={`₦${totalWeeklyContribution.toLocaleString()}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle={`Your ${
          remittanceType === "Weekly" ? "weekly" : "monthly"
        } contribution plus the pre-loan service charge.`}
        infoContent={`Your ${
          remittanceType === "Weekly" ? "weekly" : "monthly"
        } contribution plus the pre-loan service charge.`}
      />
      <Input
        label="Total Repayment"
        placeholder="Enter Amount"
        value={`₦${vehicleBreakdown.totalRepayment}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Total Repayment"
        infoContent="Total Fees = Eligible Loan + Loan Management Fee. Post-Loan Charge (0.05%) = 0.05% of Total Fees * 48. Total repayment = Total Fees + Post-Loan Charges."
      />
      <Input
        label="Post-Loan Weekly Repayment over 4 years"
        placeholder="Enter Amount"
        value={`₦${vehicleBreakdown.postLoanWeeklyContribution}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Post-Loan Weekly Repayment over 4 years"
        infoContent="Total Fees = Eligible Loan + Loan Management Fee. Post-Loan Charge (0.05%) = 0.05% of Total Fees. Total to Repay Over 4 Years: = Total Fees + Post-Loan Charges. Weekly Repayment = Total Repayment ÷ 208 weeks"
      />
    </View>
  )
);

const VehicleBreakdownDetails = React.memo(
  ({
    vehicleBreakdown,
    remittanceType,
    setRemittanceType,
    remittanceWeekDay,
    setRemittanceWeekDay,
    remittanceMonthDay,
    handleRemittanceDaySelect,
    additionalWeeklyContribution,
    setAdditionalWeeklyContribution,
    isAdditionalContributionInvalid,
    totalWeeklyContribution,
  }: any) => (
    <View>
      <View style={styles.summaryBox}>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Cost of Vehicle</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.costOfVehicle}</Text>
        </View>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Extra engine (10%)</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.extraEngine}</Text>
        </View>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Extra Tyres (10%)</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.extraTyre}</Text>
        </View>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Insurance (6%) over 4 years</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.insurance}</Text>
        </View>
        <View style={styles.groupText}>
          <Text style={styles.summaryText}>Processing Fee</Text>
          <Text style={styles.boldText}>₦{vehicleBreakdown.processingFee}</Text>
        </View>
      </View>
      <View style={{ marginVertical: resHeight(1) }} />
      <Input
        label="User Contribution (Down Payment)"
        value={`₦${vehicleBreakdown.downPayment}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="User Contribution (Down Payment)"
        infoContent="10% of total asset value. Paid from user's savings contribution."
      />
      <Input
        label="Eligible Loan (Principal)"
        value={`₦${vehicleBreakdown.eligibleLoan}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Eligible Loan (Principal)"
        infoContent="90% of total asset value."
      />
      <Input
        label="Loan Management Fee over 4 years"
        value={`₦${vehicleBreakdown.loanManagementFee}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Loan Management Fee over 4 years"
        infoContent="Annually: 6% of Asset Value. Total for 4 Years: Annual Loan Management Fee × 4"
      />
      <Input
        label="Pre-Loan Service Charge"
        placeholder="Enter Amount"
        value={`₦${vehicleBreakdown.preLoanServiceCharge}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Loan Management Fee over 4 years"
        infoContent="A monthly server charge as you save up your 10% equity."
      />
      <SelectInput
        label="Remittance Type"
        value={remittanceType}
        onSelect={setRemittanceType}
        placeholder="Choose remittance type for your 10% equity"
        options={REMITTANCE_TYPES}
      />
      {remittanceType === "Weekly" ? (
        <SelectInput
          label="Remittance Day"
          value={remittanceWeekDay}
          style={{ marginBottom: resHeight(1) }}
          onSelect={setRemittanceWeekDay}
          placeholder="Choose contribution day"
          options={WEEK_DAYS}
        />
      ) : remittanceType === "Monthly" ? (
        <SelectInput
          label="Remittance Day"
          value={remittanceMonthDay}
          style={{ marginBottom: resHeight(1) }}
          onSelect={handleRemittanceDaySelect}
          placeholder="Choose contribution day"
          options={MONTH_DAY_LABELS}
        />
      ) : null}
      <Input
        label={`Minimum ${
          remittanceType === "Weekly" ? "Weekly" : "Monthly"
        } Contribution`}
        placeholder="Enter Amount"
        valueType="money"
        value={additionalWeeklyContribution}
        onChangeText={setAdditionalWeeklyContribution}
        keyboardType="phone-pad"
        showInfoIcon={true}
        infoTitle={`Minimum ${
          remittanceType === "Weekly" ? "Weekly" : "Monthly"
        } Contribution`}
        infoContent={`Enter any amount from ₦${vehicleBreakdown.baseContributionAmount} and above to save toward your 10% equity down payment.`}
        isInvalid={isAdditionalContributionInvalid}
        errorMessage={
          isAdditionalContributionInvalid
            ? `Amount must be ${formatAmount(
                vehicleBreakdown.baseContributionAmount
              )} or more.`
            : undefined
        }
      />
      <Input
        label={`Total Minimum ${
          remittanceType === "Weekly" ? "Weekly" : "Monthly"
        } Contribution`}
        value={`₦${totalWeeklyContribution.toLocaleString()}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle={`Your ${
          remittanceType === "Weekly" ? "weekly" : "monthly"
        } contribution plus the pre-loan service charge.`}
        infoContent={`Your ${
          remittanceType === "Weekly" ? "weekly" : "monthly"
        } contribution plus the pre-loan service charge.`}
      />
      <Input
        label="Total Repayment"
        placeholder="Enter Amount"
        value={`₦${vehicleBreakdown.totalRepayment}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Total Repayment"
        infoContent="Total Fees = Eligible Loan + Loan Management Fee. Post-Loan Charge (0.05%) = 0.05% of Total Fees * 48. Total repayment = Total Fees + Post-Loan Charges."
      />
      <Input
        label="Post-Loan Weekly Repayment over 4 years"
        placeholder="Enter Amount"
        value={`₦${vehicleBreakdown.postLoanWeeklyContribution}`}
        keyboardType="phone-pad"
        editable={false}
        showInfoIcon={true}
        infoTitle="Post-Loan Weekly Repayment over 4 years"
        infoContent="Total Fees = Eligible Loan + Loan Management Fee. Post-Loan Charge (0.05%) = 0.05% of Total Fees. Total to Repay Over 4 Years: = Total Fees + Post-Loan Charges. Weekly Repayment = Total Repayment ÷ 208 weeks"
      />
    </View>
  )
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: resFont(30),
    marginTop: resHeight(4),
    fontFamily: "OutfitMedium",
  },
  subtitle: {
    fontSize: resFont(12),
    color: Colors.dark.textLight,
    marginVertical: 10,
    fontFamily: "OutfitRegular",
  },
  error: {
    color: "red",
    fontSize: resFont(11),
    marginTop: 8,
    fontFamily: "OutfitRegular",
  },
  summaryBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    marginTop: 20,
  },
  summaryText: {
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
  },
  summarySubText: {
    fontSize: resFont(10),
    color: Colors.dark.textLight,
    fontFamily: "OutfitRegular",
  },
  boldText: {
    fontWeight: "500",
    fontSize: resFont(12),
  },
  groupText: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
});

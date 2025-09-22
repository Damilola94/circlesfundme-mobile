import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import Loader from "@/components/ui/Loader";
import SelectInput from "@/components/ui/SelectInput";
import SetupNotice from "@/components/ui/SetupNotice";
import { Colors } from "@/constants/Colors";
import { PROFILE_IMG } from "@/constants/Image";
import { useImagePicker } from "@/hooks/useImagePicker";
import handleFetch from "@/services/api/handleFetch";
import { formatAmount, resFont, resHeight } from "@/utils/utils";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/ui/Buttton";
import Input from "../../components/ui/Input";

export default function ProfileSetting() {
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData(["users-me"]) as {
    data?: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      dateOfBirth: string;
      gender: string;
      email: string;
      contributionAmount: string;
      incomeAmount: string;
      profilePictureUrl?: string;
      allowPushNotifications: false;
      allowEmailNotifications: false;
      onboardingStatus?: string;
      contributionScheme?: {
        name?: string;
      };
      autoLoanDetail?: {
        costOfVehicle: number;
        preLoanContributionAmount: number;
        postLoanWeeklyContribution: number;
        totalRepayment: number;
      };
    };
  };
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [scheme, setScheme] = useState("");
  const [income, setIncome] = useState("");
  const [costOfVehicle, setCostOfVehicle] = useState(0);
  const [preLoanContributionAmount, setPreLoanContributionAmount] = useState<
    number | string
  >(0);
  const [postLoanWeeklyContribution, setPostLoanWeeklyContribution] =
    useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);

  const [contribution, setContribution] = useState("");
  const [pSetting, setPSetting] = useState<"pSetting" | null>(null);
  const { image, pickImage, clearImage } = useImagePicker();
  const [error, setError] = useState("");

  useEffect(() => {
    if (userData?.data) {
      const {
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        gender,
        email,
        contributionAmount,
        incomeAmount,
        contributionScheme,
        autoLoanDetail,
      } = userData.data;
      setFullName(`${firstName} ${lastName}`);
      setPhone(phoneNumber || "");
      setDob(dateOfBirth ? moment(dateOfBirth).format("DD/MM/YYYY") : "");
      setGender(gender || "");
      setEmail(email || "");
      setPostLoanWeeklyContribution(
        autoLoanDetail?.postLoanWeeklyContribution || 0
      );
      setPreLoanContributionAmount(
        autoLoanDetail?.preLoanContributionAmount || 0
      );
      setTotalRepayment(autoLoanDetail?.totalRepayment || 0);
      setCostOfVehicle(autoLoanDetail?.costOfVehicle || 0);
      setScheme(contributionScheme?.name || "");
      setContribution(contributionAmount ? String(contributionAmount) : "");
      setIncome(incomeAmount ? String(incomeAmount) : "");
    }
  }, [userData]);

  const renderProfileSettingModal = () => {
    switch (pSetting) {
      case "pSetting":
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
                      onPress={() => {
                        setPSetting("pSetting");
                        router.back();
                      }}
                    >
                      <AntDesign name="close-circle" size={12} color="black" />
                    </TouchableOpacity>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={100}
                      color={Colors.dark.primary}
                    />
                    <Text style={styles.modalTitle}>Update Succesful</Text>
                    <Text style={styles.modalSubTitle}>
                      You have successfully updated your profile.
                    </Text>
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

  const onPressedProfileSetup = () => {
    router.push("/incomplete-kyc/verify-identity-kyc");
  };

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      handleFetch({
        endpoint: "users/change-profile-picture",
        method: "POST",
        body: formData,
        multipart: true,
        auth: true,
      }),
    onSuccess: async (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: res?.message || "Something went wrong",
        });
        return;
      }
      Toast.show({
        type: "success",
        text1: "Profile Picture Updated",
      });
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
      router.back();
      clearImage();
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleUploadProfilePicture = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("profilePicture", {
      uri:
        Platform.OS === "android" && !image.uri.startsWith("file://")
          ? `file://${image.uri}`
          : image.uri,
      type: image.type && image.type.includes("image/")
        ? image.type
        : "image/jpeg",
      name: image.name || "profile.jpg",
    } as any);

    uploadMutation.mutate(formData);
  };


  const updateUserMutation = useMutation({
    mutationFn: (body: any) =>
      handleFetch({
        endpoint: "users/update",
        method: "PUT",
        auth: true,
        body,
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Profile updated",
      });
      queryClient.invalidateQueries({ queryKey: ["users-me"] });
      setPSetting("pSetting");
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const { data: schemesData } = useQuery({
    queryKey: ["contribution-schemes"],
    queryFn: () => handleFetch({ endpoint: "contributionschemes/mini" }),
  });

  const selectedSchemeId = schemesData?.data?.find(
    (item: { name: string; id: string }) =>
      item.name.toLowerCase().includes(scheme.toLowerCase())
  )?.id;

  const maxPercentage = scheme === "Weekly Contribution Scheme" ? 0.2 : 0.3;

  const incomeValue = parseFloat(income.replace(/,/g, ""));
  const contributionValue = parseFloat(contribution.replace(/,/g, ""));

  const isValidContribution = contributionValue <= maxPercentage * incomeValue;
  const isAssetFinance = scheme === "Auto Financing";

  const handleSubmit = () => {
    if (!userData?.data) return;

    if (!isValidContribution) {
      const maxPercent =
        scheme === "Weekly Contribution Scheme" ? "20%" : "30%";
      setError(`You cannot contribute more than ${maxPercent} of your income.`);
      return;
    }

    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ");
    const selectedGender = gender === "Not Specified" ? "NotSet" : gender;

    const payload = {
      firstName,
      lastName,
      phoneNumber: phone,
      dateOfBirth: moment(dob, "DD/MM/YYYY").format("YYYY-MM-DD"),
      gender: selectedGender,
      contributionAmount: contribution,
      incomeAmount: income,
      contributionSchemeId: selectedSchemeId,
      allowPushNotifications: userData.data.allowPushNotifications,
      allowEmailNotifications: userData.data.allowEmailNotifications,
    };
    updateUserMutation.mutate(payload);
  };

  return (
    <View style={{ flex: 1 }}>
      {updateUserMutation.isPending && <Loader />}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { marginTop: insets.top || 40 },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrow-left" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile Settings</Text>
        </View>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{
                uri: userData?.data?.profilePictureUrl?.trim()
                  ? userData.data.profilePictureUrl
                  : PROFILE_IMG,
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>

          {image ? (
            <View>
              <Text style={styles.createAccSubText}>
                Selected image ready to upload
              </Text>
              <Button
                style={{
                  marginTop: resHeight(1),
                  padding: resHeight(1.5),

                }}
                title={uploadMutation.isPending ? "Uploading..." : "Update"}
                onPress={handleUploadProfilePicture}
                disabled={uploadMutation.isPending}
              />
            </View>
          ) : (
            <Text style={styles.createAccSubText}>
              Tap to change profile picture
            </Text>
          )}
        </View>
        {userData?.data?.onboardingStatus === "Completed" ? null : (
          <SetupNotice
            title="You haven’t complete profile yet"
            buttonText="Complete Profile"
            onPress={onPressedProfileSetup}
          />
        )}
        <View style={{ marginBottom: resHeight(2) }} />
        <Input
          label="Full Name"
          placeholder="Enter Your Full name"
          value={fullName}
          onChangeText={setFullName}
        />
        <Input
          label="Email"
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          editable={false}
        />
        <Input
          label="Phone Number"
          placeholder="Enter Your Phone Number"
          value={phone}
          onChangeText={setPhone}
          editable={false}
        />
        <Input
          label="Date of Birth"
          value={dob}
          onChangeText={setDob}
          placeholder="DD/MM/YYYY"
          type="date"
          onPressDate={() => setShowPicker(true)}
        />
        <DateTimePickerModal
          isVisible={showPicker}
          mode="date"
          maximumDate={new Date()}
          onConfirm={(date) => {
            setDob(moment(date).format("DD/MM/YYYY"));
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
        />
        <SelectInput
          label="Gender"
          value={gender}
          onSelect={setGender}
          placeholder="Select Gender"
          options={["Male", "Female", "Not Specified"]}
        />
        <SelectInput
          label="Contribution Scheme"
          value={scheme}
          onSelect={setScheme}
          editable={false}
          placeholder="Select Your preferred scheme"
          options={[
            "Weekly Contribution Scheme",
            "Monthly Contribution Scheme",
            "Asset Finance",
          ]}
        />
        {isAssetFinance ? (
          <View>
            <Input
              label="Cost of the vehicle?"
              placeholder="Enter Amount"
              value={formatAmount(costOfVehicle)}
              editable={false}
              valueType="money"
              keyboardType="phone-pad"
            />
            <Input
              label={`Total Monthly Contribution`}
              value={formatAmount(preLoanContributionAmount)}
              editable={false}
              valueType="money"
              showInfoIcon={true}
              infoTitle="Total Weekly Contribution"
              infoContent={`Your monthly contribution plus the pre-loan service charge.`}
            />
            <Input
              label="Post-Loan Weekly Repayment over 4 years"
              placeholder="Enter Amount"
              value={formatAmount(postLoanWeeklyContribution)}
              editable={false}
              valueType="money"
              showInfoIcon={true}
              infoTitle="Post-Loan Weekly Repayment over 4 years"
              infoContent="Total Fees = Eligible Loan + Loan Management Fee.
                      Post-Loan Charge (0.05%) = 0.05% of Total Fees.
                      Total to Repay Over 4 Years: = Total Fees + Post-Loan Charges.
                      Weekly Repayment = Total Repayment ÷ 208 weeks"
            />
            <Input
              label="Total Repayment"
              placeholder="Enter Amount"
              value={formatAmount(totalRepayment)}
              editable={false}
              valueType="money"
              showInfoIcon={true}
              infoTitle="Total Repayment"
              infoContent="Total Fees = Eligible Loan + Loan Management Fee.
              Post-Loan Charge (0.05%) = 0.05% of Total Fees * 48.
              Total repayment = Total Fees + Post-Loan Charges."
            />
          </View>
        ) : (
          <View>
            <Input
              label={`${scheme === "Weekly Contribution Scheme"
                ? "Weekly Revenue (NGN)?"
                : scheme === "Daily Contribution Scheme"
                  ? "Daily Revenue (NGN)?"
                  : "Monthly income (NGN)?"
                }`}
              placeholder="Enter Amount"
              value={formatAmount(income)}
              editable={false}
              valueType="money"
              onChangeText={setIncome}
              keyboardType="phone-pad"
            />
            <Input
              label={`${scheme === "Weekly Contribution Scheme"
                ? "Weekly"
                : scheme === "Daily Contribution Scheme"
                  ? "Daily"
                  : "Monthly"
                } Contribution (NGN)?`}
              placeholder="Enter Amount"
              value={formatAmount(contribution)}
              editable={false}
              valueType="money"
              onChangeText={setContribution}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ marginBottom: resHeight(5) }} />
        <Button title="Continue" disabled={updateUserMutation.isPending} onPress={handleSubmit} />
        <View style={{ marginBottom: resHeight(10) }} />
        {renderProfileSettingModal()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  createAccText: {
    textAlign: "left",
    fontWeight: "500",
    fontSize: resFont(30),
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: resHeight(10),
    height: resHeight(10),
    borderRadius: resHeight(5),
    marginRight: 12,
  },
  greeting: {
    fontSize: resFont(12),
    color: Colors.dark.textLight,
  },
  createAccSubText: {
    textAlign: "left",
    fontSize: resFont(12),
    fontFamily: "OutfitMedium",
    marginTop: 10,
    color: Colors.dark.background,
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
  error: {
    color: "red",
    fontSize: resFont(11),
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    height: "50%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: resHeight(3),
    alignItems: "center",
    justifyContent: "center",
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
  modalTitle: {
    fontSize: resFont(18),
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginTop: 20,
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  modalSubTitle: {
    color: Colors.dark.textLight,
    fontSize: resFont(12),
    textAlign: "center",
    marginBottom: 20,
  },
});

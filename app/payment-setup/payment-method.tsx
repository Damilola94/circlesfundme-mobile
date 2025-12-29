import Button from "@/components/ui/Buttton";
import Loader from "@/components/ui/Loader";
import ProgressStepsBar from "@/components/ui/ProgressStepsBar";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const options = [
  { label: "Card", icon: "credit-card-outline" },
  { label: "Bank Transfer", icon: "bank-transfer" },
  { label: "Mobile Money", icon: "cellphone" },
] as const;

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("Card");
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData(["users-me"]) as {
    data?: {
      isCardLinked: boolean;
    };
  };
console.log(userData?.data?.isCardLinked);

  // useEffect(() => {
  //   if (!userData?.data?.isCardLinked) {
  //     router.push("/payment-setup/withdraw-setup");
  //     return;
  //   }
  // }, [userData])
  
  const initPaymentMutation = useMutation({
    mutationFn: () =>
      handleFetch({
        endpoint: "financials/make-initial-contribution",
        method: "POST",
        body: {},
        auth: true,
      }),
    onSuccess: (res: any) => {
      if (res?.statusCode !== "200") {
        Toast.show({
          type: "error",
          text1: "Payment initiation failed",
          text2: res?.message || "Try again",
        });
        return;
      }
      router.push({
        pathname: "/payment-setup/card-info",
        params: {
          url: res?.data?.authorizationUrl,
          reference: res?.data?.reference,
        },
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
      });
    },
  });

  const handleContinue = () => {
    if (selected !== "Card") {
      setShowModal(true);
      return;
    }
    if (userData?.data?.isCardLinked) {
      router.push("/payment-setup/withdraw-setup");
      return;
    }
    initPaymentMutation.mutate();
  };

  const renderComingSoonModal = () => {
    if (!showModal) return null;

    return (
      <Modal transparent visible>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { height: "25%" }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <AntDesign name="close-circle" size={12} color="black" />
            </TouchableOpacity>
            <AntDesign
              name="clock-circle"
              size={80}
              color={Colors.dark.secondary}
            />
            <Text style={styles.modalTitle}>Coming Soon</Text>
            <Text style={styles.modalSubTitle}>
              This payment method is not available yet. Please select Card to
              continue.
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {initPaymentMutation.isPending && <Loader message="Loading..." />}
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

          <Text style={styles.headerTitle}>Payment method</Text>
        </View>

        <ProgressStepsBar currentStep={1} totalSteps={2} />
        <Text style={styles.title}>Funding</Text>
        {options.map((opt) => {
          return (
            <TouchableOpacity
              key={opt.label}
              onPress={() => setSelected(opt.label)}
              style={[
                styles.option,
                selected === opt.label && styles.selectedOption,
              ]}
            >
              <MaterialCommunityIcons name={opt.icon} size={20} />
              <Text style={styles.optionText}>{opt.label}</Text>
              {selected === opt.label && (
                <View style={styles.radioOuter}>
                  <View style={styles.radioInner} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ marginVertical: resHeight(5) }} />
        <Button
          title={initPaymentMutation.isPending ? "Loading..." : "Continue"}
          onPress={handleContinue}
        />
        {renderComingSoonModal()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: resFont(22),
    fontWeight: "bold",
    marginVertical: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: resHeight(2),
    backgroundColor: "#F6F6F6",
    borderRadius: resHeight(6),
    marginBottom: resHeight(2),
  },
  optionText: {
    marginLeft: 10,
    fontSize: resFont(14),
    flex: 1,
  },
  selectedOption: {
    borderColor: Colors.dark.primary,
    borderWidth: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    backgroundColor: Colors.dark.tint,
    borderRadius: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: resFont(15),
    fontWeight: "bold",
    marginTop: 20,
    fontFamily: "OutfitMedium",
    textAlign: "center",
  },
  modalSubTitle: {
    fontSize: resFont(12),
    marginTop: 10,
    textAlign: "center",
    fontFamily: "OutfitRegular",
    color: "#666",
  },
});

import Button from "@/components/ui/Buttton";
import Input from "@/components/ui/Input";
import SelectInput from "@/components/ui/SelectInput";
import { resFont, resHeight } from "@/utils/utils";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ConfirmBeneficiaryScreen() {
  // const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("0123456789");
  const [bank, setBank] = useState("Wema bank");

  return (
    <View style={styles.container}>
      <Input
        label="Account Number"
        placeholder="0000000000"
        value={accountNumber}
        onChangeText={setAccountNumber}
        keyboardType="numeric"
      />
      <SelectInput
        label="Bank"
        value={bank}
        onSelect={setBank}
        placeholder="Select Bank"
        options={["Wema bank", "GTBank", "Access Bank"]}
      />

      <View style={styles.beneficiaryBox}>
        <Text style={styles.beneficiaryText}>Ryan Reynolds</Text>
      </View>

      <View style={{ marginBottom: resHeight(5) }} />
      <Button title="Proceed" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  beneficiaryBox: {
    marginTop: 20,
    backgroundColor: "#E6F3EF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  beneficiaryText: {
    fontSize: resFont(14),
    fontWeight: "600",
    color: "#00C281",
  },
});

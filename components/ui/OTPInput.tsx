import { Colors } from "@/constants/Colors";
import { resHeight, resWidth } from "@/utils/utils";
import React, { useRef } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

interface OTPInputProps {
  value: string;
  setValue: (value: string) => void;
  length?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, setValue, length = 6 }) => {
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    const newValue = value.split("");
    newValue[index] = text;
    const updatedValue = newValue.join("");
    setValue(updatedValue);

    if (text && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => {
            inputsRef.current[i] = ref;
          }}
          style={styles.input}
          maxLength={1}
          keyboardType="numeric"
          onChangeText={(text) => handleChangeText(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          secureTextEntry={true}
          value={value[i] || ""}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "space-between" },
  input: {
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    borderRadius: 8,
    backgroundColor: "white",
    padding: 20,
    width: resWidth(13),
    height: resWidth(15),
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    fontFamily: "OutfitRegular",
    elevation: 2,
    marginBottom: resHeight(2),
  },
});

export default OTPInput;

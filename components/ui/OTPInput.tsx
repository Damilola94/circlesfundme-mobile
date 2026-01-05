/* eslint-disable react-hooks/exhaustive-deps */
import { Colors } from "@/constants/Colors";
import { resWidth } from "@/utils/utils";
import React, { useEffect, useRef } from "react";
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View
} from "react-native";

interface OTPInputProps {
  value: string;
  setValue: (value: string) => void;
  length?: number;
  error?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  value,
  setValue,
  length = 6,
  error = false,
}) => {
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (value.length === length) {
      inputsRef.current[length - 1]?.blur();
    }
  }, [value]);

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, "").slice(0, length);
      setValue(pasted);
      pasted.split("").forEach((_, i) => {
        inputsRef.current[i]?.setNativeProps({
          text: "•",
        });
      });
      inputsRef.current[pasted.length - 1]?.focus();
      return;
    }

    if (!/^\d?$/.test(text)) return;

    const newValue = value.split("");
    newValue[index] = text;
    setValue(newValue.join(""));

    if (text && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const newValue = value.split("");

      if (!newValue[index] && index > 0) {
        newValue[index - 1] = "";
        setValue(newValue.join(""));
        inputsRef.current[index - 1]?.focus();
      } else {
        newValue[index] = "";
        setValue(newValue.join(""));
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => {
        const isFilled = Boolean(value[i]);
        return (
          <View
            key={i}
            style={[
              styles.box,
              isFilled && styles.filledBox,
              error && styles.errorBox,
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputsRef.current[i] = ref;
              }}
              style={styles.input}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={Platform.OS === "android" ? length : 1}
              onChangeText={(text) => handleChangeText(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              value={isFilled ? "•" : ""}
              caretHidden
              importantForAutofill="yes"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: resWidth(13),
    height: resWidth(15),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  filledBox: {
    borderColor: Colors.dark.primary,
  },
  errorBox: {
    borderColor: "red",
  },
  input: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "OutfitRegular",
    color: "#000",
  },
});

export default OTPInput;

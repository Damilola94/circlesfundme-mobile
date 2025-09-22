// toastConfig.js
import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green", minHeight: 80 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 16,
        color: "#333",
        flexWrap: "wrap",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "red", minHeight: 80 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 16,
        color: "#333",
        flexWrap: "wrap",
      }}
    />
  ),
};

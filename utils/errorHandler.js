import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../services/auth";

const errorHandler = async (error, auth) => {
  let message = "";

  if (error?.code === "ERR_NETWORK" || error?.code === "ECONNABORTED") {
    console.log(error, "error");
    message = "Network error. Please, check your internet connection.";
  } else if (error?.response) {
    const { response } = error;

    if (response?.status === 401 || response?.status === 403) {
      message =
        response?.data?.detail ||
        response?.data?.title ||
        "You are either not authorized to access this resource or your session has expired. Please login again.";

      if (auth) {
        try {
          await AsyncStorage.setItem("err", message);
        } catch (err) {
          console.warn("Failed to save error to AsyncStorage:", err);
        }
        logout();
      }
    } else if (response.status === 422) {
      message = response?.data?.errors?.[""]?.[0] || "Validation failed.";
    } else if (Array.isArray(response?.data?.errors)) {
      message = response.data.errors.join(", ");
    } else if (Array.isArray(response?.data?.Errors)) {
      message = response.data.Errors.join(", ");
    } else {
      message =
        response.data?.detail ||
        response.data?.error?.message ||
        response.data?.message ||
        response.statusText ||
        "Something went wrong. Please, try again.";
    }
  } else {
    message = "Something went wrong. Please, try again.";
  }

  return message.toString();
};

export default errorHandler;

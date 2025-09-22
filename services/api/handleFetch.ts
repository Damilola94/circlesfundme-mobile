import errorHandler from "@/utils/errorHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from ".";
import endpoints from "./endpoints";

type FetchOptions = {
  endpoint?: string;
  extra?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
  auth?: boolean;
  body?: any;
  pQuery?: Record<string, string | number | boolean | undefined>;
  param?: string;
  multipart?: boolean;
  useRawResponse?: boolean;
  responseType?: string;
  returnErrorData?: boolean;
};

const handleFetch = async <T = any>({
  endpoint = "",
  extra = "",
  method = "GET",
  auth = false,
  body = {},
  pQuery = {},
  param = "",
  multipart = false,
  useRawResponse = false,
  responseType = "",
  returnErrorData = false,
}: FetchOptions = {}): Promise<T> => {
  let url =
    endpoint in endpoints
      ? endpoints[endpoint as keyof typeof endpoints]
      : endpoint;

  if (extra) url += `/${extra}`;
  if (param) url += `/${param}`;

  if (pQuery && Object.keys(pQuery).length > 0) {
    const queryStr = Object.entries(pQuery)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(
        ([key, val]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`
      )
      .join("&");

    url += `?${queryStr}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": multipart ? "multipart/form-data" : "application/json",
  };

  if (auth) {
    try {
      const storedData = await AsyncStorage.getItem("data");
      const data = storedData ? JSON.parse(storedData) : null;
      if (data?.accessToken) {
        headers.Authorization = `Bearer ${data.accessToken}`;        
      }
    } catch (err) {
      console.warn("Failed to retrieve token:", err);
    }
  }

  const config: any = {
    method,
    url,
    headers,
  };

  if (responseType) config.responseType = responseType;

  if (body && method !== "GET" && method !== "HEAD") {
    config.data = body;
  }

  console.log("API request config:", config);

  try {
    const response = await axiosInstance(config);
    if (useRawResponse) {
      return response as T;
    }
    return responseType === "blob"
      ? (response as T)
      : ({
          ...response.data,
          status: response.status,
          method,
        } as T);
  } catch (error: any) {
    if (returnErrorData) {
      return {
        ...error?.response?.data,
      } as T;
    }
    const errorMessage = await errorHandler(error, auth);
    throw new Error(errorMessage);
  }
};

export default handleFetch;

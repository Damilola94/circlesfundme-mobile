import axios from "axios";

import errorHandler from "@/utils/errorHandler";
import { EXPO_PUBLIC_API_URL  } from '../config';
import { memoizedRefreshToken } from "./refreshToken";

export const axiosInstance = axios.create({
  baseURL: EXPO_PUBLIC_API_URL
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    if (
      !!config?.headers?.authorization &&
      (error?.response?.status === 401 || error?.response?.status === 403)
    ) {
      if (!config?.sent) {
        config.sent = true;
        const result = await memoizedRefreshToken();
        if (result?.accessToken) {
          config.headers = {
            ...config.headers,
            authorization: `Bearer ${result.accessToken}`,
          };
        }
        return axiosInstance(config);
      } else {
        throw new Error(errorHandler(error, true));
      }
    }
    return Promise.reject(error);
  }
);

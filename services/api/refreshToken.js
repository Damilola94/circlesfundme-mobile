/* eslint-disable import/no-unresolved */
// src/api/refreshToken.ts

import { logger } from "@/utils/errorHandler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import mem from "mem";
import { logout } from '../auth';
import { API_BASE_URL } from '../config';
import endpoints from './endpoints';

axios.defaults.baseURL = API_BASE_URL;

async function refreshTokenFn() {
  try {
    const storedData = await AsyncStorage.getItem('data');
    const data = storedData ? JSON.parse(storedData) : null;

    const url = `${endpoints.auth}/refresh-token`;
    const headers = {
      'Content-Type': 'application/json',
    };
    const body = {
      expiredToken: data?.accessToken,
      refreshToken: data?.refreshToken,
    };

    const response = await axios({
      url,
      headers,
      method: 'POST',
      data: body,
    });

    logger(response);

    const { data: session } = response.data;

    if (!session?.accessToken) {
      await logout();
      return;
    }

    await AsyncStorage.setItem(
      'data',
      JSON.stringify({ ...data, ...session })
    );

    return session;
  } catch (error) {
    logger('Refresh token failed:', error);
    await logout();
  }
}

export const memoizedRefreshToken = mem(refreshTokenFn, { maxAge: 10000 });

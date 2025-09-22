// providers/SplashProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Splash from 'expo-splash-screen';
import { ReactNode, useEffect, useState } from 'react';

Splash.preventAutoHideAsync(); 

type Props = {
  children: ReactNode;
};

export default function SplashProvider({ children }: Props) {
  const [isAppReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise((res) => setTimeout(res, 500));
        const onboarded = await AsyncStorage.getItem('user-onboarded-success');
        console.log('Has onboarded:', onboarded);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await Splash.hideAsync();
      }
    };
    prepare();
  }, []);

  if (!isAppReady) return null; 
  return children;
}

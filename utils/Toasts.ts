// utils/toast.ts
import Toast from 'react-native-toast-message';

export const showErrorToast = (message: string, title = 'Error') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const showSuccessToast = (message: string, title = 'Success') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

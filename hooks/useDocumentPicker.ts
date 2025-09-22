// hooks/useDocumentPicker.ts
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";

interface UseDocumentPickerReturn {
  file: DocumentPicker.DocumentPickerAsset | null;
  pickFile: () => Promise<void>;
  error: string | null;
  clearFile: () => void;
}

export const useDocumentPicker = (
  options = {
    allowedTypes: ["application/pdf"],
    maxSizeMB: 10,
  }
): UseDocumentPickerReturn => {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: options.allowedTypes,
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const selected = res.assets[0];

      if (selected.size && selected.size > options.maxSizeMB * 1024 * 1024) {
        throw new Error(`File is too large. Max size is ${options.maxSizeMB}MB`);
      }

      setFile(selected);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setFile(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return { file, pickFile, error, clearFile };
};

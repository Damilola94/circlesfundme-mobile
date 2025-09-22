import handleFetch from "@/services/api/handleFetch";
import { Platform } from "react-native";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadDocument = async (file: {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}) => {
  if (!file?.uri) throw new Error("No file to upload");

  if (file.size && file.size > MAX_FILE_SIZE) {
    throw new Error("File size must not exceed 5MB");
  }

  const fileName =
    file.name || file.uri.split("/").pop() || `doc_${Date.now()}.dat`;
  const ext = fileName.split(".").pop()?.toLowerCase();

  let mime =
    file.type ||
    (ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
      ? "image/png"
      : ext === "pdf"
      ? "application/pdf"
      : "application/octet-stream");

  const normalizedUri =
    Platform.OS === "android" && !file.uri.startsWith("file://")
      ? `file://${file.uri}`
      : file.uri;

  const formData = new FormData();
  formData.append("Document", {
    uri: normalizedUri,
    name: fileName,
    type: mime,
  } as any);

  const response = await handleFetch({
    endpoint: "utility/upload-document",
    method: "POST",
    body: formData,
    auth: true,
    multipart: true,
  });

  if (response?.isSuccess && response?.data) {
    return response.data as string;
  }

  throw new Error(response?.message || "Upload failed");
};

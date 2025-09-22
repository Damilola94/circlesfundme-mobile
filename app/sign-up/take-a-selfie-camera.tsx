import PhotoPreviewSection from "@/components/ui/PhotoPreviewSection";
import { Colors } from "@/constants/Colors";
import { uploadDocument } from "@/utils/uploadDocument";
import { AntDesign } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const navigation = useNavigation();

  const {
    fullName,
    phone,
    dob,
    gender,
    bvn,
    documentUrl,
    documentName,
    documentType,
    userAddress,
    utilityBillUrl,
    utilityBillName,
    utilityBillType,
  } = useLocalSearchParams<{
    fullName: string;
    phone: string;
    dob: string;
    gender: string;
    bvn: string;
    documentUrl: string;
    documentName: string;
    documentType: string;
    userAddress: string;
    utilityBillUrl: string;
    utilityBillName: string;
    utilityBillType: string;
  }>();

  if (!permission) {
    return <View />;
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
      });
      setPhoto(photo);
    }
  };

  const handleRetakePhoto = () => setPhoto(null);

  const handleProceed = async () => {
    try {
      setLoading(true);

      const uri = photo.uri;
      const fileName = uri.split("/").pop() || `selfie_${Date.now()}.jpg`;

      const ext = fileName.split(".").pop()?.toLowerCase();
      let fileType = "image/jpeg";
      if (ext === "png") fileType = "image/png";
      else if (ext === "jpg" || ext === "jpeg") fileType = "image/jpeg";
      else if (ext === "heic") fileType = "image/heic";

      const uploadedUrl = await uploadDocument({
        uri,
        name: fileName,
        type: fileType,
      });

      setLoading(false);
      console.log(uploadedUrl, "uploadedUrl - id");
      router.replace({
        pathname: "/sign-up/contribution-scheme",
        params: {
          fullName,
          phone,
          dob,
          gender,
          bvn,
          documentUrl,
          documentName,
          documentType,
          userAddress,
          utilityBillUrl,
          utilityBillName,
          utilityBillType,
          selfieUrl: uploadedUrl,
          selfieType: fileType,
          selfieName: fileName,
        },
      });
    } catch (error: any) {
      setLoading(false);
      console.error("Selfie upload failed:", error.message || error);
      alert("Failed to upload selfie. Please try again.");
    }
  };

  if (photo)
    return (
      <View style={{ flex: 1 }}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Uploading selfie...</Text>
          </View>
        )}
        <PhotoPreviewSection
          photo={photo}
          handleRetakePhoto={handleRetakePhoto}
          handleProceed={handleProceed}
        />
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden />

        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          ref={cameraRef}
        />

        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={44} color={Colors.dark.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name="camera" size={44} color={Colors.dark.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    marginHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    padding: 10,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
});

import PhotoPreviewSection from "@/components/ui/PhotoPreviewSection";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { AntDesign } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import {
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
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
import Toast from "react-native-toast-message";

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>("front");
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();

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

  const verifyBvnSelfieMutation = useMutation({
    mutationFn: (formData: FormData) =>
      handleFetch({
        endpoint: "accounts/verify-bvn-selfie",
        method: "POST",
        body: formData,
        auth:true,
        multipart: true,
      }),

    onSuccess: (res: any) => {
      if (res?.statusCode !== "200" && res?.status !== 200) {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: res?.message || "BVN selfie verification failed",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Verification Successful",
      });

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
        },
      });
    },

    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to verify BVN selfie",
      });
    },

    onSettled: () => {
      setLoading(false);
    },
  });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    const capturedPhoto = await cameraRef.current.takePictureAsync({
      quality: 1,
      base64: true,
    });

    setPhoto(capturedPhoto);
  };

  const handleRetakePhoto = () => setPhoto(null);

  const handleProceed = () => {
    if (!photo?.uri) {
      Toast.show({
        type: "error",
        text1: "No selfie captured",
      });
      return;
    }

    setLoading(true);

    const uri = photo.uri;
    const fileName = uri.split("/").pop() || `selfie_${Date.now()}.jpg`;
    const ext = fileName.split(".").pop()?.toLowerCase();

    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    if (ext === "heic") mimeType = "image/heic";

    const formData = new FormData();
    formData.append("bvn", bvn);
    formData.append("selfie", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    verifyBvnSelfieMutation.mutate(formData);
  };

  if (photo) {
    return (
      <View style={{ flex: 1 }}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Verifying BVN and selfie...</Text>
          </View>
        )}

        <PhotoPreviewSection
          photo={photo}
          handleRetakePhoto={handleRetakePhoto}
          handleProceed={handleProceed}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden />

        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
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

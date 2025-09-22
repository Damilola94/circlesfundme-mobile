import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CameraCapturedPicture } from "expo-camera";
import React from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const PhotoPreviewSection = ({
  photo,
  handleRetakePhoto,
  handleProceed,
}: {
  photo: CameraCapturedPicture;
  handleRetakePhoto: () => void;
  handleProceed: () => void;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Image
          style={styles.previewContainer}
          source={{ uri: "data:image/jpg;base64," + photo.base64 }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
          <MaterialCommunityIcons name="camera-retake" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleProceed}>
          <AntDesign name="right-circle" size={36} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    borderRadius: 15,
    padding: 1,
    width: "95%",
    backgroundColor: "darkgray",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "95%",
    height: "85%",
    borderRadius: 15,
  },
  buttonContainer: {
    marginTop: "4%",
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "gray",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PhotoPreviewSection;

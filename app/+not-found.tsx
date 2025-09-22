import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Button from "../components/ui/Buttton"; 

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>404 - Page Not Found</Text>
      <Text style={styles.description}>
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </Text>
      <Button title="Go Back Home" onPress={() => router.push("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});

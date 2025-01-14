import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { auth } from "../firebaseConfig";

export default function index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      try {
        auth.onAuthStateChanged((user) => {
          if (user) router.push("/home");
          else setLoading(false);
        });
      } catch (error) {
        alert("Error retrieving session token:", error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/background/login-bg.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          style={styles.linearGradient}
          colors={[
            "rgba(0, 0, 0, 0.0)",
            "rgba(0, 0, 0, 0.2)",
            "rgba(0, 0, 0, 0.8)",
            "rgba(0, 0, 0, 1)",
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome Back, Let's Start Cooking!</Text>

            <Text style={styles.subtitle}>
              Discover delicious recipes, step-by-step guides, and your next
              favorite dish—all in one place!
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size={"large"} color={"white"} />
            ) : (
              <Text style={styles.buttonText}>GET STARTED</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: Dimensions.get("window").height,
  },
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  titleContainer: {
    justifyContent: "flex-end",
    flex: 1,
    marginBottom: 60,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "white",
    textAlign: "center",
    fontWeight: "medium",
    fontSize: 16,
    marginHorizontal: 28,
  },
  button: {
    backgroundColor: "#F5B01C",
    borderRadius: 25,
    shadowColor: "black",
    elevation: 4,
    shadowOpacity: 0.36,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
    padding: 8,
  },
});

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
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
  const [visibility, setVisibility] = useState(true);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleEmail(text) {
    setEmail((u) => text);
  }

  function handlePass(text) {
    setPass((p) => text);
  }

  function handleVisibility() {
    setVisibility((v) => !visibility);
  }

  function validateForm() {
    let errors = {};

    if (!email) errors.email = "Email is required";
    if (!pass) errors.pass = "Password is required";

    setErrors(errors);

    return Object.keys(errors).length === 0;
  }

  const handleLogin = async () => {
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
          try {
            setEmail("");
            setPass("");
            setErrors({});

            router.push("/home");
          } catch (error) {
            alert("Error storing session token:", error);
          }
        })
        .catch((error) => {
          const errorCode = error.code;

          if (errorCode.includes("auth/invalid-credential"))
            alert("Invalid credentials!");
          else if (errorCode.includes("auth/invalid-email"))
            alert("Invalid email!");
          else alert(errorCode);
        });
    } catch (error) {
      alert("Log in failed: " + error);
    } finally {
      setLoading(false);
    }
  };

  function handleSignUp() {
    setEmail("");
    setPass("");
    setErrors({});

    router.push("/sign-up");
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
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
              "rgba(0, 0, 0, 0.8)",
            ]}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Welcome Back,{"\n"}Let's Start Cooking!
              </Text>
            </View>

            <View>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={24} style={styles.icon} />

                <TextInput
                  placeholder="Email"
                  style={styles.textInput}
                  onChangeText={handleEmail}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              <View style={{ marginTop: 16 }} />

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={24} style={styles.icon} />

                <TextInput
                  placeholder="Password"
                  style={styles.textInput}
                  secureTextEntry={visibility}
                  onChangeText={handlePass}
                  value={pass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={handleVisibility}>
                  <Ionicons
                    name={visibility ? "eye" : "eye-off"}
                    size={24}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.pass ? (
                <Text style={styles.errorText}>{errors.pass}</Text>
              ) : null}

              <View style={{ marginTop: 44 }} />

              <View style={styles.signContainer}>
                <Text style={styles.signInText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.touchableSignIn}> Sign up here</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => handleLogin()}
                style={styles.button}
              >
                {loading === false ? (
                  <Text style={styles.buttonText}>LOG IN</Text>
                ) : (
                  <ActivityIndicator size={"large"} color={"white"} />
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </ImageBackground>
    </ScrollView>
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
    marginTop: 24,
    flex: 1,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 48,
    textShadowColor: "black",
    textShadowRadius: 20,
    textShadowOffset: { width: 4, height: 4 },
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    shadowColor: "black",
    elevation: 4,
    shadowOpacity: 0.36,
    borderRadius: 25,
    minHeight: 50,
    padding: 8,
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
    marginLeft: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#545454",
    fontWeight: "medium",
  },
  eyeIcon: {
    marginRight: 12,
  },
  signContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signInText: {
    alignSelf: "center",
    marginBottom: 16,
    fontSize: 14,
    color: "white",
  },
  touchableSignIn: {
    fontSize: 14,
    color: "white",
  },
  button: {
    backgroundColor: "#F5B01C",
    borderRadius: 25,
    shadowColor: "black",
    elevation: 4,
    shadowOpacity: 0.36,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
    padding: 8,
  },
  errorText: {
    color: "#FF3131",
    marginLeft: 20,
    marginTop: 4,
    width: "40%",
  },
});

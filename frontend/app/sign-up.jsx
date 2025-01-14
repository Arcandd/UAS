import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import * as SecureStore from "expo-secure-store";

export default function SignUp() {
  const [visibility, setVisibility] = useState(true);
  const [cvisibility, setCVisibility] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [cpass, setCPass] = useState("");
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleUsername(text) {
    setUsername((u) => text);
  }

  function handleEmail(text) {
    setEmail((e) => text);
  }

  function handlePass(text) {
    setPass((p) => text);
  }

  function handleCPass(text) {
    setCPass((c) => text);
  }

  function handleVisibility() {
    setVisibility((v) => !visibility);
  }

  function handleCVisibility() {
    setCVisibility((c) => !cvisibility);
  }

  function handleLogIn() {
    setUsername("");
    setEmail("");
    setPass("");
    setCPass("");
    setErrors({});

    router.back();
  }

  function validateForm() {
    let errors = {};

    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    if (!pass) errors.pass = "Password is required";
    if (!cpass || cpass !== pass) errors.cpass = "Incorrect password";

    setErrors(errors);

    return Object.keys(errors).length === 0;
  }

  const handleSignUp = async () => {
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      await createUserWithEmailAndPassword(auth, email, pass)
        .then(async (userCredential) => {
          const user = userCredential.user;

          try {
            await updateProfile(user, {
              displayName: username,
            });
          } catch (error) {
            console.log("Session store error: ", error);
            alert("Failed to save session data.");
          }

          try {
            const userDocRef = doc(db, "users", user.uid); // ? ini cara biar isa buat dokumen pake id custom. id ne user.uid

            await setDoc(userDocRef, {
              username: username,
              email: user.email,
              createdAt: new Date(),
              cooking: [],
            });
          } catch (error) {
            console.log("Firestore error: ", error);
            alert("Failed to save user data to Firestore.");
          }

          setUsername("");
          setEmail("");
          setPass("");
          setCPass("");
          setErrors({});

          router.push("/home");
        })
        .catch((error) => {
          const errorCode = error.code;

          if (errorCode.includes("auth/invalid-email")) alert("Invalid email!");
          else if (errorCode.includes("auth/email-already-in-use"))
            alert("Email already in use!");
          else alert(errorCode);
        });
    } catch (error) {
      alert("Registration failed: " + error);
    } finally {
      setLoading(false);
    }
  };

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
                Discover Your Dream Recipes,{"\n"}Sign Up Today!
              </Text>
            </View>

            <View>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={24} style={styles.icon} />

                <TextInput
                  placeholder="Username"
                  style={styles.textInput}
                  onChangeText={handleUsername}
                  value={username}
                />
              </View>
              {errors.username ? (
                <Text style={styles.errorText}>{errors.username}</Text>
              ) : null}

              <View style={{ marginTop: 16 }} />

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={24} style={styles.icon} />

                <TextInput
                  placeholder="Email"
                  style={styles.textInput}
                  onChangeText={handleEmail}
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                    size={28}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.pass ? (
                <Text style={styles.errorText}>{errors.pass}</Text>
              ) : null}

              <View style={{ marginTop: 16 }} />

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  style={styles.icon}
                />

                <TextInput
                  placeholder="Confirm password"
                  style={styles.textInput}
                  secureTextEntry={cvisibility}
                  onChangeText={handleCPass}
                  value={cpass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={handleCVisibility}>
                  <Ionicons
                    name={cvisibility ? "eye" : "eye-off"}
                    size={28}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {errors.cpass ? (
                <Text style={styles.errorText}>{errors.cpass}</Text>
              ) : null}

              <View style={styles.signContainer}>
                <Text style={styles.signInText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleLogIn}>
                  <Text style={styles.touchableSignIn}> Sign up here</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => handleSignUp()}
                style={styles.button}
              >
                {loading === false ? (
                  <Text style={styles.buttonText}>SIGN UP</Text>
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
    marginTop: 44,
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
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
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
    width: "50%",
  },
});

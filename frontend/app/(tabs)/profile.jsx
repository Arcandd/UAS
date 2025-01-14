import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { auth } from "../../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import defaultProfilePicture from "../../assets/profile/profile-default.png";
import ProfileMenu from "../../components/profile-menu";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile } from "firebase/auth";

const ProfileScreen = () => {
  const router = useRouter();
  const user = auth.currentUser;
  const [photoURL, setPhotoUrl] = useState();
  // const [user, setUser] = useState({});

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;

        await updateProfile(user, { photoURL: imageUri });

        setPhotoUrl(user.photoURL);
      }
    } catch (error) {
      console.log("Error updating profile picture", err);
      alert("Error updating profile picture");
    }
  };

  const handleLogOut = async () => {
    try {
      await auth.signOut();

      router.push("/login");
    } catch (error) {
      alert("Error logging out: " + error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user.photoURL) {
        setPhotoUrl(user.photoURL);
      }
    }, [])
  );

  if (!user) {
    return <ActivityIndicator size={"large"} color={"#5D430C"} />;
  }

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={selectImage}>
          <Image
            source={photoURL ? { uri: photoURL } : defaultProfilePicture}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{user.displayName} </Text>
          </View>

          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Options Section */}
      <View style={styles.optionsSection}>
        <ProfileMenu
          icon={<Ionicons name="lock-closed-outline" size={24} />}
          text="Change Password"
        />

        <ProfileMenu
          icon={<Ionicons name="shield-outline" size={24} />}
          text="Privacy Policy"
        />

        <ProfileMenu
          icon={<Ionicons name="document-text-outline" size={24} />}
          text="Terms & Conditions"
        />

        <ProfileMenu
          icon={<Ionicons name="help-circle-outline" size={24} />}
          text="Help and Support"
        />

        <ProfileMenu
          icon={<Ionicons name="chatbubbles-outline" size={24} />}
          text="Chat with Us"
        />

        <ProfileMenu
          icon={<Ionicons name="log-out-outline" size={24} />}
          text="Log Out"
          onPress={() => handleLogOut()}
        />
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, styles.footerSpacing]}>
          Version 1.0.0
        </Text>
        <Text style={[styles.footerText, styles.footerSpacing]}>
          ©2024 Recipe App, Inc.
        </Text>
        <Text style={styles.footerText}>All rights reserved</Text>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileRole: {
    fontSize: 16,
    color: "#888",
  },
  profileEmail: {
    fontSize: 12,
    color: "#888",
  },
  optionsSection: {
    flex: 1,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingTop: 20,
  },
  footer: {
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 120,
  },
  footerText: {
    fontSize: 9,
    color: "#aaa",
    textAlign: "left",
  },
  footerSpacing: {
    marginBottom: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderRadius: 15,
    marginHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  modalTitle: {
    marginTop: 20,
    marginBottom: 40,
    fontSize: 16,
    fontWeight: "semibold",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF8800",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

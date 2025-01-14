import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Button,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList } from "react-native";

import ModalSteps from "../../components/modal-steps";
import { RECIPE_DATA } from "../../constants/recipe-data";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import { Ionicons } from "@expo/vector-icons";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function Detail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isModalVisible, setModalVisible] = useState(false);
  const [recipe, setRecipe] = useState({}); // ! Kalau mau ngestore object harus ada {} di dalem kurungnya
  const [loading, setLoading] = useState(false);
  const userId = auth.currentUser.uid;
  const [cookingStatus, setCookingStatus] = useState(false);

  const fetchRecipeDetail = async () => {
    setLoading(true);

    try {
      const recipeDocRef = await getDoc(doc(db, "recipes", id));

      if (recipeDocRef.exists()) setRecipe(recipeDocRef.data());
      else alert("Recipe not found!");
    } catch (error) {
      console.log("Error fetching recipe:", error);
      alert("Error fetching recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleCooking = async () => {
    setModalVisible(!isModalVisible);

    try {
      const userDocRef = doc(db, "users", userId);

      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();

        if (!userData.cooking.includes(id)) {
          await updateDoc(userDocRef, {
            cooking: arrayUnion(id),
          });
        }

        fetchCookingStatus();
      } else alert("User not found");
    } catch (error) {
      console.error("Error adding recipe to cooking: ", error);
      alert("Cooking failed");
    }
  };

  const fetchCookingStatus = async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.cooking.includes(id)) setCookingStatus(true);
        else setCookingStatus(false);
      }
    } catch (error) {
      console.error("Error checking cooking status: ", error);
    }
  };

  useEffect(() => {
    fetchRecipeDetail();
  }, []);

  // ? biar fungsi ini dipanggil terus jika ada perubahan pada cookingStatus dan isModalVisible
  useEffect(() => {
    fetchCookingStatus();
  }, [cookingStatus, isModalVisible]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#5D430C" />
        </View>
      ) : (
        <ImageBackground
          source={{ uri: recipe.imageDetail }}
          style={styles.background}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["transparent", "white"]}
            style={styles.linearGradient}
          />

          <LinearGradient
            colors={["rgba(0, 0, 0, 0.4)", "transparent", "transparent"]}
            style={{ flex: 1 }}
          >
            <SafeAreaView style={styles.safeArea}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity onPress={() => router.back()}>
                  <AntDesign name="arrowleft" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/mapview")}>
                  <Ionicons name="map" size={32} color={"white"} />
                </TouchableOpacity>
              </View>

              <FlatList
                ListHeaderComponent={
                  <View>
                    <View style={styles.header}>
                      <Text style={styles.title}>{recipe.name}</Text>

                      <View style={{ alignItems: "flex-end" }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "baseline",
                          }}
                        >
                          <Entypo name="back-in-time" size={12} color="gray" />
                          <Text style={styles.duration}>{recipe.duration}</Text>
                        </View>

                        <Text style={styles.status}>
                          {/* {fetchCookingStatus() ? "Cooking" : "Not cooking"} */}
                          {cookingStatus ? "Cooking" : "Not cooking"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.description}>{recipe.description}</Text>

                    <Text style={styles.ingredients}>Ingredients:</Text>
                  </View>
                }
                data={recipe.materials}
                keyExtractor={(index) => index.toString()}
                showVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Text style={styles.ingredientsList}> • {item}</Text>
                )}
                style={{ maxHeight: 240 }}
              />

              <View>
                <TouchableOpacity
                  style={styles.cookButton}
                  onPress={() => handleCooking()}
                >
                  <Text style={styles.cookText}>START COOKING</Text>
                </TouchableOpacity>

                {recipe.steps && (
                  <ModalSteps
                    visible={isModalVisible}
                    onClose={() => setModalVisible(!isModalVisible)}
                    data={recipe.steps}
                    recipeId={id}
                  />
                )}
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  background: {
    flex: 1,
    height: 480,
  },
  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  linearGradient: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: 400,
    bottom: "39%",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 15,
    width: "90%",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#5D430C",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    width: "60%",
  },
  duration: {
    fontWeight: "medium",
    marginLeft: 4,
    color: "gray",
  },
  status: {
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  ingredients: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 14,
    fontWeight: "normal",
    lineHeight: 20,
  },
  cookButton: {
    backgroundColor: "#F5B01C",
    marginTop: 24,
    padding: 12,
    alignItems: "center",
    borderRadius: 4,
  },
  cookText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
});

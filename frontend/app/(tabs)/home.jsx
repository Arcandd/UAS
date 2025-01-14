import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { createContext, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import { CATEGORY_DATA } from "../../constants/category-data";
import { RECIPE_DATA } from "../../constants/recipe-data";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const HomeScreen = () => {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [cookingStatus, setCookingStatus] = useState({});

  const fetchUserData = () => {
    try {
      const user = auth.currentUser;
      if (user) {
        setUser(user);
      } else {
        alert("Unauthorized!");
        router.push("/login");
      }
    } catch (error) {
      console.log("Error fetching user info", error);
      alert("Error fetching user info");
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const fetchedRecipes = [];

      querySnapshot.forEach((doc) => {
        fetchedRecipes.push({ id: doc.id, ...doc.data() });
      });

      setRecipes(fetchedRecipes);
    } catch (error) {
      console.log("Error fetching recipes:", error);
      alert("Error fetching recipes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCookingStatus = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cookingStatusMap = {};

        recipes.forEach((recipe) => {
          cookingStatusMap[recipe.id] = Array.isArray(userData.cooking)
            ? userData.cooking.includes(recipe.id)
            : false;
        });

        setCookingStatus(cookingStatusMap);
      }
    } catch (error) {
      console.error("Error checking cooking status: ", error);
      alert("Error checking cooking status");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchRecipes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (recipes.length > 0) {
        fetchCookingStatus();
      }
    }, [recipes])
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#5D430C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Hello, {user.displayName}!{"\n"}What are we cooking today?
          </Text>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} style={styles.searchIcon} />

            <TextInput
              placeholder="Search recipes..."
              style={styles.searchInput}
            />
          </View>

          {/* Category section */}
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {CATEGORY_DATA.map((category) => (
              <TouchableOpacity style={styles.categoryButton} key={category.id}>
                <View style={styles.categoryImgCont}>
                  <Image source={category.icon} style={styles.categoryImage} />
                </View>

                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Food section */}
        <View style={styles.container}>
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#5D430C" />
            </View>
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const cooking = cookingStatus[item.id];

                return (
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push(`/detail/${item.id}`)}
                  >
                    <ImageBackground
                      source={{ uri: item.image }}
                      style={styles.foodImages}
                      resizeMode="cover"
                    >
                      <LinearGradient
                        style={styles.foodDescCont}
                        colors={[
                          "rgba(0, 0, 0, 0.4)",
                          "transparent",
                          "rgba(0, 0, 0, 0.6)",
                        ]}
                      >
                        <View style={styles.foodDesc}>
                          <Text style={styles.foodHeader}>{item.category}</Text>

                          <View style={styles.foodHeaderStatus}>
                            <Text style={styles.foodHeader}>
                              Status:
                              {cooking ? " Cooking" : " Not cooking"}
                            </Text>

                            <Text style={styles.foodHeader}>
                              {item.duration}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.foodName}>{item.name}</Text>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    margin: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "black",
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 4,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F5B01C",
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
  },
  categoryButton: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  categoryImgCont: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 100,
    borderColor: "#F5B01C",
    borderWidth: 1,
  },
  categoryImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "400",
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    elevation: 8,
    backgroundColor: "white",
    shadowColor: "black",
    flex: 1,
    marginHorizontal: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  foodImages: {
    width: "100%",
    height: 450,
  },
  foodDescCont: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  foodDesc: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: -4,
  },
  foodHeader: {
    fontSize: 16,
    fontWeight: "medium",
    color: "white",
  },
  foodHeaderStatus: {
    alignItems: "flex-end",
  },
  foodDuration: {
    color: "white",
    fontWeight: "medium",
    fontSize: 14,
  },
  foodName: {
    fontWeight: "600",
    fontSize: 32,
    color: "white",
    width: "50%",
  },
});

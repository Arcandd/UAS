import {
  StyleSheet,
  Text,
  View,
  Modal,
  FlatList,
  PanResponder,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Button,
  Animated,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Entypo from "@expo/vector-icons/Entypo";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const ModalSteps = ({ visible, onClose, data, recipeId }) => {
  const steps = Number(data.length);
  const [currentStep, setCurrentStep] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [scrollPos, setScrollPos] = useState(0);
  const userId = auth.currentUser.uid;
  const [loading, setLoading] = useState(false);

  // ? Aktif ketika modal visible dan bekerja untuk men-scroll ke state scroll sebelumnya
  useEffect(() => {
    if (visible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: scrollPos, animated: false });
    }
  }, [visible]);

  // ? Aktif ketika terjadi perubahan pada currentSteps dan steps. Berfungsi untuk memberikan animasi pada progress bar
  useEffect(() => {
    Animated.timing(progress, {
      toValue: (currentStep + 1) / steps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, steps]);

  // ? Berfungsi untuk mengatur scroll serta memperbarui step
  function handleScroll(event) {
    const newScrollPos = event.nativeEvent.contentOffset.x;
    setScrollPos((s) => newScrollPos);
    setCurrentStep((s) =>
      Math.round(newScrollPos / (Dimensions.get("window").width - 48))
    );
  }

  const handleDone = async () => {
    if (currentStep === steps - 1) {
      setLoading(true);

      try {
        const userDocRef = doc(db, "users", userId);

        await updateDoc(userDocRef, {
          cooking: arrayRemove(recipeId),
        });

        setScrollPos((s) => 0);
        setCurrentStep((c) => 0);
      } catch (error) {
        console.error("Error removing recipe from cooking: ", error);
        alert("Cooking failed");
      } finally {
        setLoading(false);
      }
    }

    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalView}>
        <TouchableOpacity onPress={onClose} style={styles.back}>
          <Entypo name="cross" size={40} color="black" />
        </TouchableOpacity>

        <View style={styles.recipeCont}>
          <Text style={styles.title}>RECIPE</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.barContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          ></Animated.View>
        </View>

        <View style={styles.progressCont}>
          <Text style={styles.progress}>Number of steps: {steps}</Text>

          <Text style={styles.progress}>Current step: {currentStep + 1}</Text>
        </View>

        <ScrollView
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {data.map((item, index) => (
            <View key={index} style={styles.stepsCont}>
              <Text style={styles.steps}>{item}</Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => handleDone()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size={"large"} color={"white"} />
          ) : (
            <Text style={styles.doneText}>DONE</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ModalSteps;

const styles = StyleSheet.create({
  modalView: {
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    flex: 1,
    marginTop: 240,
    padding: 24,
    backgroundColor: "white",
  },
  back: {
    position: "absolute",
    top: "2%",
    left: "4%",
  },
  container: {
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressCont: {
    marginTop: 8,
  },
  progress: {
    fontWeight: "medium",
  },
  recipeCont: {
    marginTop: 40,
  },
  barContainer: {
    height: 12,
    backgroundColor: "#F5F5F5",
    overflow: "hidden",
    borderRadius: 6,
    elevation: 4,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  progressBar: {
    backgroundColor: "#00A0F6",
    height: "100%",
  },
  stepsCont: {
    height: Dimensions.get("window").width - 120,
    width: Dimensions.get("window").width - 52,
    justifyContent: "center",
    alignItems: "center",
  },
  steps: {
    fontSize: 20,
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: 16,
    height: 260,
    width: 330,
    textAlignVertical: "center",
    elevation: 4,
    padding: 16,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  doneButton: {
    backgroundColor: "#F5B01C",
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  doneText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    paddingVertical: 8,
  },
});

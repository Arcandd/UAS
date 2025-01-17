import {
  ActivityIndicator,
  Button,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { Callout, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const MapViewScreen = () => {
  const [location, setLocation] = useState(null);
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState();

  const fetchSupermarkets = async () => {
    setLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, "supermarkets"));
      const fetchedSupermarkets = [];

      querySnapshot.forEach((doc) => {
        fetchedSupermarkets.push({ id: doc.id, ...doc.data() });
      });

      setSupermarkets(fetchedSupermarkets);
    } catch (error) {
      console.log("Error fetching supermarket:", error);
      alert("Error fetching supermarket");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      async function getCurrentLocation() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        setStatus(status);

        if (status !== "granted") {
          alert("Permission to access location was denied!");

          return;
        }

        const isLocationEnabled = await Location.hasServicesEnabledAsync();

        if (!isLocationEnabled) {
          alert("Please turn on your location service!");

          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      }

      getCurrentLocation();
      fetchSupermarkets();
    }, [])
  );

  if (status !== "granted") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button
          onPress={() => {
            if (Platform.OS === "android") {
              Linking.openSettings();
            } else if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            }
          }}
          title="Request Location Permission"
          color={"#F5B01C"}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={location}
          showsCompass
          showsUserLocation
          showsBuildings={false}
          showsPointsOfInterest={false}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You"
            description={`${location.latitude} ${location.longitude}`}
          />

          {supermarkets.map((supermarket) => (
            <Marker
              key={supermarket.id}
              coordinate={{
                latitude: supermarket.geopoint.latitude,
                longitude: supermarket.geopoint.longitude,
              }}
              title={supermarket.name}
              description={supermarket.location}
            />
          ))}
        </MapView>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size={"large"} color={"#5D430C"} />
        </View>
      )}
    </View>
  );
};

export default MapViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

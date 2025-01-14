import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

const ProfileMenu = ({ icon, text, onPress, Styles }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, Styles?.menuItem || {}]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, Styles?.iconContainer || {}]}>
        {icon}
      </View>
      <Text style={[styles.menuText, Styles?.menuText || {}]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default ProfileMenu;

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  iconContainer: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
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
});

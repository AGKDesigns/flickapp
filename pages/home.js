import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

export default function home() {
  return (
    <View style={styles.container}>
      <Text style={styles.baseText}>THis is the HOME screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    color: "#F00",
    alignItems: "center",
    justifyContent: "center",
  },
  baseText: {
    color: "#FFF",
  },
});

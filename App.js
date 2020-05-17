import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.baseText}>Welcome to Flick App 2</Text>
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

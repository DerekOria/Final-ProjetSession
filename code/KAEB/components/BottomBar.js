import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../config/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function BottomBar() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    loadUserData();
  }, []);


  return (
    <View style={theme.bottomRow}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Ionicons name="home-outline" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Recherche")}>
        <Ionicons name="search-outline" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("HabitTracker")}>
        <Ionicons name="checkmark-circle-outline" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Communaute")}>
        <Ionicons name="people-outline" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        {user ? (
            <Image source={{ uri: user.avatar_url }} style={{width: 32, height: 32, borderRadius: 16}} />
        ) : (
            <Ionicons name="person-circle-outline" size={28} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
}

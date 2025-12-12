import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { theme, colors } from "../config/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function BottomBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(null);
  
  const currentScreen = route.name;

  useEffect(() => {
    async function loadUserData() {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    loadUserData();
  }, []);

  const isActive = (screen) => currentScreen === screen;

  return (
    <View style={theme.bottomRow}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.tab}>
        <Ionicons 
          name={isActive("Home") ? "home" : "home-outline"} 
          size={28} 
          color={isActive("Home") ? colors.primary : "white"} 
        />
        {isActive("Home") && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate("HabitTracker")} style={styles.tab}>
        <Ionicons 
          name={isActive("HabitTracker") ? "checkmark-circle" : "checkmark-circle-outline"} 
          size={28} 
          color={isActive("HabitTracker") ? colors.primary : "white"} 
        />
        {isActive("HabitTracker") && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate("LockIn")} style={styles.tab}>
        <Ionicons 
          name={isActive("LockIn") ? "lock-closed" : "lock-closed-outline"} 
          size={28} 
          color={isActive("LockIn") ? colors.primary : "white"} 
        />
        {isActive("LockIn") && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.tab}>
        {user ? (
            <Image 
              source={{ uri: user.avatar_url }} 
              style={[
                styles.profilePic,
                isActive("Profile") && styles.profilePicActive
              ]} 
            />
        ) : (
            <Ionicons 
              name={isActive("Profile") ? "person-circle" : "person-circle-outline"} 
              size={28} 
              color={isActive("Profile") ? colors.primary : "white"} 
            />
        )}
        {isActive("Profile") && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePicActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
});

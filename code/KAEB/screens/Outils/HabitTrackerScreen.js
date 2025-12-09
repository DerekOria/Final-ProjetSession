import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme, colors } from "../../config/theme"; // Ensure colors is imported
import { Ionicons } from "@expo/vector-icons";
import BottomBar from '../../components/BottomBar'; // Re-add BottomBar import

export default function HabitTrackerScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [habits, setHabits] = useState([]);
  const [userId, setUserId] = useState(null);
  const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

  useEffect(() => {
    async function getUserId() {
      const id = await AsyncStorage.getItem("user_id");
      setUserId(id);
    }
    getUserId();
  }, []);

  useEffect(() => {
    async function fetchHabits() {
      if (!userId) {
        console.log("[HabitTracker] No userId available yet");
        return;
      }
      try {
        console.log("[HabitTracker] Fetching habits for userId:", userId);
        const response = await fetch(
          "http://martha.jh.shawinigan.info/queries/select-user-habits/execute",
          {
            method: "POST",
            headers: {
              "auth": AUTH,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
          }
        );
        const data = await response.json();
        console.log("[HabitTracker] Fetch response:", data);
        if (data.success) {
          console.log("[HabitTracker] Setting habits:", data.data);
          setHabits(data.data);
        } else {
          console.error("[HabitTracker] Error in response:", data.error);
          setHabits([]);
        }
      } catch (error) {
        console.error("[HabitTracker] Fetch error:", error);
        setHabits([]);
      }
    }
    if (isFocused) {
      fetchHabits();
    }
  }, [isFocused, userId]);

  const renderHabit = ({ item }) => {
    // Log the item structure to see what fields we have
    console.log("[HabitTracker] Habit item structure:", Object.keys(item), item);
    
    return (
      <View style={styles.habitContainer}>
        <Text style={styles.habitName}>{item.name || item.h_name}</Text>
        <Text style={styles.habitDescription}>{item.description || item.h_description}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <Text style={styles.habitFrequency}>Frequency: {item.frequency || item.h_frequency}</Text>
          {/* Removed item.category reference */}
          <TouchableOpacity onPress={() => {
            // Use the correct ID field - could be 'id', 'habit_id', or 'h_id'
            const habitIdToPass = item.id || item.habit_id || item.h_id;
            console.log("[HabitTracker] Navigating to EditHabit with habit:", { ...item, id: habitIdToPass });
            navigation.navigate('EditHabit', { habit: { ...item, id: habitIdToPass } });
          }}>
              <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.screenContainer}>
      <View style={theme.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={theme.title}>Habit Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddHabit")}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item, index) => {
          // Try different ID field names that Martha might use
          const id = item.id || item.habit_id || item.h_id;
          if (id) {
            return id.toString();
          }
          return `habit-${index}`;
        }}
        ListEmptyComponent={<Text style={{color: colors.text, textAlign: 'center', marginTop: 20}}>You have no habits yet. Add one!</Text>}
      />
      <BottomBar navigation={navigation} /> {/* Re-add BottomBar */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    habitContainer: {
        backgroundColor: colors.card,
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
    },
    habitName: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    habitDescription: {
        color: colors.gray,
        fontSize: 14,
        marginVertical: 4,
    },
    habitFrequency: {
        color: colors.text,
        fontSize: 12,
    }
});
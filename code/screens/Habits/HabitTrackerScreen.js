import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../config/theme";
import { Ionicons } from "@expo/vector-icons";
import BottomBar from '../../components/BottomBar';
import { marthaFetch, getHabitId } from '../../config/api';

// get icon based on frequency
const getFrequencyIcon = (freq) => {
  const f = (freq || '').toLowerCase();
  if (f.includes('daily')) return 'today';
  if (f.includes('week')) return 'calendar';
  if (f.includes('month')) return 'calendar-outline';
  return 'repeat';
};

// get color based on frequency
const getFrequencyColor = (freq) => {
  const f = (freq || '').toLowerCase();
  if (f.includes('daily')) return '#2A9D8F';
  if (f.includes('week')) return '#E9C46A';
  if (f.includes('month')) return '#E76F51';
  return '#888';
};

function HabitCard({ item, onEdit, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const habitName = item.name || item.h_name;
  const habitDesc = item.description || item.h_description;
  const frequency = item.frequency || item.h_frequency || 'Daily';
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getFrequencyColor(frequency) + '20' }]}>
          <Ionicons name={getFrequencyIcon(frequency)} size={24} color={getFrequencyColor(frequency)} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.habitName} numberOfLines={1}>{habitName}</Text>
          <View style={[styles.frequencyBadge, { backgroundColor: getFrequencyColor(frequency) }]}>
            <Text style={styles.frequencyText}>{frequency}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {habitDesc ? (
        <Text style={styles.description} numberOfLines={2}>{habitDesc}</Text>
      ) : null}
      
      <View style={styles.cardFooter}>
        <View style={styles.streak}>
          <Ionicons name="flame" size={16} color="#FF6B6B" />
          <Text style={styles.streakText}>Keep it up!</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HabitTrackerScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [habits, setHabits] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function getUserId() {
      const id = await AsyncStorage.getItem("user_id");
      setUserId(id);
    }
    getUserId();
  }, []);

  useEffect(() => {
    async function fetchHabits() {
      if (!userId) return;
      
      try {
        const data = await marthaFetch("select-user-habits", { user_id: userId });
        if (data.success) {
          setHabits(data.data);
        } else {
          setHabits([]);
        }
      } catch (error) {
        setHabits([]);
      }
    }
    if (isFocused) {
      fetchHabits();
    }
  }, [isFocused, userId]);

  const renderHabit = ({ item, index }) => {
    const habitIdToPass = getHabitId(item);
    
    return (
      <HabitCard 
        item={item} 
        index={index}
        onEdit={() => navigation.navigate('EditHabit', { habit: { ...item, id: habitIdToPass } })}
      />
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="leaf-outline" size={60} color="#2A9D8F" />
      </View>
      <Text style={styles.emptyTitle}>No habits yet</Text>
      <Text style={styles.emptySubtitle}>Start building better habits today!</Text>
      <TouchableOpacity 
        style={styles.addFirstButton}
        onPress={() => navigation.navigate("AddHabit")}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.addFirstText}>Add your first habit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={theme.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habit Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddHabit")} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color="#2A9D8F" />
        </TouchableOpacity>
      </View>
      
      {habits.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{habits.length}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
        </View>
      )}
      
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item, index) => {
          const id = getHabitId(item);
          return id ? id.toString() : `habit-${index}`;
        }}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <BottomBar navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statItem: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: '#2A9D8F',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  habitName: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  frequencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  frequencyText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  description: {
    color: '#AAA',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    marginLeft: 60,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 60,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addFirstText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});
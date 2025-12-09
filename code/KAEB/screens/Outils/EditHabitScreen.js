import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, colors } from '../../config/theme';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function EditHabitScreen({ route, navigation }) {
    const { habit } = route.params;
    console.log("[EditHabit] Received habit object:", habit);
    console.log("[EditHabit] Habit keys:", Object.keys(habit));
    console.log("[EditHabit] habit.id:", habit.id, "habit.habit_id:", habit.habit_id, "habit.h_id:", habit.h_id);
    
    const [name, setName] = useState(habit.name || habit.h_name);
    const [description, setDescription] = useState(habit.description || habit.h_description);
    const [communities, setCommunities] = useState([]);
    // Initialize communityId to habit.community_id, or null if it's not set
    const [communityId, setCommunityId] = useState(habit.community_id || habit.h_community_id || null);
    const [frequency, setFrequency] = useState(habit.frequency || habit.h_frequency || 'Daily');
    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

    useEffect(() => {
        async function fetchCommunities() {
            try {
                const response = await fetch("http://martha.jh.shawinigan.info/queries/select-communities/execute", {
                    method: "POST",
                    headers: { "auth": AUTH, "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (data.success) {
                    setCommunities(data.data);
                    console.log("Communities loaded:", data.data);
                    // If communityId wasn't set by habit, or is invalid, try to set a default from fetched communities
                    if ((communityId === null || communityId === '' || !data.data.find(c => c.id === communityId)) && data.data.length > 0) {
                        setCommunityId(data.data[0].id);
                    }
                } else {
                    Alert.alert("Error", "Failed to load communities.");
                    console.error("Failed to fetch communities:", data.error);
                }
            } catch (error) {
                console.error("Network error fetching communities:", error);
                Alert.alert("Error", "An unexpected error occurred while loading communities.");
            }
        };
        fetchCommunities();
    }, []);

    const handleUpdateHabit = async () => {
        console.log("Update button pressed");
        console.log("Current state:", { name, description, communityId, frequency, habitId: habit.id });
        
        // Get the actual ID from the habit object
        const actualHabitId = habit.id || habit.habit_id || habit.h_id;
        console.log("[EditHabit] Resolved habit ID:", actualHabitId);
        
        if (!actualHabitId) {
            console.error("[EditHabit] ERROR: No habit ID found! Habit object:", habit);
            Alert.alert('Error', 'No habit ID found. Cannot update.');
            return;
        }
        
        if (!name.trim() || !description.trim() || !frequency) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        try {
            // Martha expects parameters in this exact order with these exact field names
            // UPDATE Habits SET name = ?'name', description = ?'description', community_id = ?'community_id', frequency = ?'frequency' WHERE id = ?'habit_id'
            const updateData = {
                'name': name.trim(),
                'description': description.trim(),
                'community_id': communityId,
                'frequency': frequency,
                'habit_id': actualHabitId
            };
            console.log("Sending update request with:", updateData);
            console.log("Habit ID being updated:", actualHabitId);
            
            const response = await fetch("http://martha.jh.shawinigan.info/queries/update-habit/execute", {
                method: 'POST',
                headers: { 'auth': AUTH, 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            console.log("Update response:", data);
            
            if (data.success) {
                Alert.alert('Success', 'Habit updated successfully.');
                navigation.goBack();
            } else {
                console.log("Update failed with error:", data.error);
                Alert.alert('Error', data.error || 'Failed to update habit.');
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
        }
    };
    
    const handleDeleteHabit = async () => {
        const actualHabitId = habit.id || habit.habit_id || habit.h_id;
        console.log("[EditHabit] Delete button pressed, resolved habit ID:", actualHabitId);
        
        if (!actualHabitId) {
            console.error("[EditHabit] ERROR: No habit ID found for delete! Habit object:", habit);
            Alert.alert('Error', 'No habit ID found. Cannot delete.');
            return;
        }
        
        // Directly perform delete for testing on desktop where Alert might not show.
        await performDelete(actualHabitId);
    };

    const performDelete = async (habitIdToDelete) => {
        console.log("[EditHabit] Performing delete for habit ID:", habitIdToDelete);
        try {
            const deleteData = {
                'habit_id': habitIdToDelete
            };

            // Step 1: Delete associated UserHabits entries
            console.log("[EditHabit] Deleting UserHabits entries for habit ID:", habitIdToDelete);
            const deleteUserHabitsResponse = await fetch("http://martha.jh.shawinigan.info/queries/delete-user-habits-by-habit-id/execute", {
                method: 'POST',
                headers: { 'auth': AUTH, 'Content-Type': 'application/json' },
                body: JSON.stringify(deleteData)
            });
            const deleteUserHabitsData = await deleteUserHabitsResponse.json();
            console.log("Delete UserHabits response:", deleteUserHabitsData);

            if (!deleteUserHabitsData.success) {
                console.error("Failed to delete UserHabits:", deleteUserHabitsData.error);
                Alert.alert('Error', deleteUserHabitsData.error || 'Failed to delete associated user habits.');
                return;
            }

            // Step 2: Delete the habit itself
            console.log("[EditHabit] Deleting habit from Habits table for habit ID:", habitIdToDelete);
            const response = await fetch("http://martha.jh.shawinigan.info/queries/delete-habit/execute", {
                method: 'POST',
                headers: { 'auth': AUTH, 'Content-Type': 'application/json' },
                body: JSON.stringify(deleteData)
            });
            const data = await response.json();
            console.log("[EditHabit] Delete response:", data);
            if (data.success) {
                console.log("[EditHabit] Habit deleted successfully!");
                Alert.alert('Success', 'Habit deleted successfully.');
                navigation.goBack();
            } else {
                console.log("Delete failed:", data.error);
                Alert.alert('Error', data.error || 'Failed to delete habit.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'An unexpected error occurred during delete: ' + error.message);
        }
    };

    return (
        <SafeAreaView style={theme.screenContainer}>
            <ScrollView style={{paddingHorizontal: 20}}>
                <View style={[theme.headerRow, {justifyContent: 'space-between', width: '100%'}]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={theme.title}>Edit Habit</Text>
                    <View style={{width: 24}} />{/* Spacer to balance header */}
                </View>

                <Text style={theme.label}>Habit Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Habit Name"
                    placeholderTextColor="#aaa"
                    value={name}
                    onChangeText={setName}
                />
                <Text style={theme.label}>Description</Text>
                <TextInput
                    style={[theme.input, {height: 100, textAlignVertical: 'top'}]}
                    placeholder="Description"
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text style={theme.label}>Community</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={communityId}
                        onValueChange={(itemValue) => setCommunityId(itemValue)}
                        style={styles.picker}
                        dropdownIconColor="white"
                    >
                        {communities.map((c) => (
                            <Picker.Item key={c.id} label={c.name} value={c.id} color="#000000" />
                        ))}
                    </Picker>
                </View>

                <Text style={theme.label}>Frequency</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={frequency}
                        onValueChange={(itemValue) => setFrequency(itemValue)}
                        style={styles.picker}
                        dropdownIconColor="white"
                    >
                        <Picker.Item label="Daily" value="Daily" color="#000000" />
                        <Picker.Item label="Weekly" value="Weekly" color="#000000" />
                        <Picker.Item label="Monthly" value="Monthly" color="#000000" />
                    </Picker>
                </View>

                <TouchableOpacity style={[theme.publishButton, {marginTop: 30}]} onPress={handleUpdateHabit}>
                    <Text style={theme.publishButtonText}>Update Habit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[theme.publishButton, {backgroundColor: colors.danger, marginTop: 10, marginBottom: 40}]} onPress={handleDeleteHabit}>
                    <Text style={theme.publishButtonText}>Delete Habit</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: '#2C2C2E',
        color: 'white',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
    },
    pickerContainer: {
        backgroundColor: '#2C2C2E',
        borderRadius: 10,
        marginVertical: 10,
        overflow: 'hidden', // Ensures the picker itself respects the border radius
    },
    picker: {
        color: '#000000', // Make selected text visible on white background
    },
    // itemStyle is for iOS only, Android items are styled via the main picker style
    pickerItem: {
        color: '#000000', // Ensure item text is black when dropdown is open
        backgroundColor: '#FFFFFF', // Ensure item background is white when dropdown is open
    }
});
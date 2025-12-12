import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, colors } from '../../config/theme';
import Dropdown from '../../components/Dropdown';
import { Ionicons } from '@expo/vector-icons';
import { marthaFetch, getHabitId } from '../../config/api';

export default function EditHabitScreen({ route, navigation }) {
    const { habit } = route.params;
    
    const habitId = getHabitId(habit);
    
    const [name, setName] = useState(habit.name || habit.h_name);
    const [description, setDescription] = useState(habit.description || habit.h_description);
    const [communities, setCommunities] = useState([]);
    const [communityId, setCommunityId] = useState(habit.community_id || habit.h_community_id || null);
    const [frequency, setFrequency] = useState(habit.frequency || habit.h_frequency || 'Daily');

    useEffect(() => {
        async function fetchCommunities() {
            try {
                const data = await marthaFetch("select-communities");
                if (data.success) {
                    setCommunities(data.data);
                    // default to first community if needed
                    if ((communityId === null || communityId === '' || !data.data.find(c => c.id === communityId)) && data.data.length > 0) {
                        setCommunityId(data.data[0].id);
                    }
                } else {
                    Alert.alert("Error", "Failed to load communities.");
                }
            } catch (error) {
                Alert.alert("Error", "An unexpected error occurred while loading communities.");
            }
        };
        fetchCommunities();
    }, []);

    const handleUpdateHabit = async () => {
        if (!habitId) {
            Alert.alert('Error', 'No habit ID found. Cannot update.');
            return;
        }
        
        if (!name.trim() || !description.trim() || !frequency) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        try {
            const data = await marthaFetch("update-habit", {
                'name': name.trim(),
                'description': description.trim(),
                'community_id': communityId,
                'frequency': frequency,
                'habit_id': habitId
            });
            
            if (data.success) {
                Alert.alert('Success', 'Habit updated successfully.');
                navigation.goBack();
            } else {
                Alert.alert('Error', data.error || 'Failed to update habit.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
        }
    };
    
    const performDelete = async () => {
        try {
            // delete user-habit links first
            const deleteUserHabitsData = await marthaFetch("delete-user-habits-by-habit-id", {
                'habit_id': habitId
            });

            if (!deleteUserHabitsData.success) {
                if (Platform.OS === 'web') {
                    alert(deleteUserHabitsData.error || 'Failed to delete associated user habits.');
                } else {
                    Alert.alert('Error', deleteUserHabitsData.error || 'Failed to delete associated user habits.');
                }
                return;
            }

            const data = await marthaFetch("delete-habit", {
                'habit_id': habitId
            });
            
            if (data.success) {
                if (Platform.OS === 'web') {
                    alert('Habit deleted successfully.');
                } else {
                    Alert.alert('Success', 'Habit deleted successfully.');
                }
                navigation.goBack();
            } else {
                if (Platform.OS === 'web') {
                    alert(data.error || 'Failed to delete habit.');
                } else {
                    Alert.alert('Error', data.error || 'Failed to delete habit.');
                }
            }
        } catch (error) {
            if (Platform.OS === 'web') {
                alert('An unexpected error occurred during delete: ' + error.message);
            } else {
                Alert.alert('Error', 'An unexpected error occurred during delete: ' + error.message);
            }
        }
    };

    const handleDeleteHabit = async () => {
        if (!habitId) {
            if (Platform.OS === 'web') {
                alert('No habit ID found. Cannot delete.');
            } else {
                Alert.alert('Error', 'No habit ID found. Cannot delete.');
            }
            return;
        }
        
        // Use window.confirm on web, Alert.alert on mobile
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to delete this habit? This action cannot be undone.");
            if (confirmed) {
                await performDelete();
            }
        } else {
            Alert.alert(
                "Delete Habit",
                "Are you sure you want to delete this habit? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: performDelete },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={theme.screenContainer}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
            <ScrollView style={{paddingHorizontal: 20}} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
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
                <Dropdown
                    options={communities.map(c => ({
                        label: c.name,
                        value: c.id
                    }))}
                    selectedValue={communityId}
                    onSelect={setCommunityId}
                    placeholder="Select a community"
                />

                <Text style={theme.label}>Frequency</Text>
                <Dropdown
                    options={[
                        { label: "Daily", value: "Daily" },
                        { label: "Weekly", value: "Weekly" },
                        { label: "Monthly", value: "Monthly" }
                    ]}
                    selectedValue={frequency}
                    onSelect={setFrequency}
                    placeholder="Select frequency"
                />

                <TouchableOpacity style={[theme.publishButton, {marginTop: 30}]} onPress={handleUpdateHabit}>
                    <Text style={theme.publishButtonText}>Update Habit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[theme.publishButton, {backgroundColor: colors.danger, marginTop: 10, marginBottom: 40}]} onPress={handleDeleteHabit}>
                    <Text style={theme.publishButtonText}>Delete Habit</Text>
                </TouchableOpacity>

            </ScrollView>
            </KeyboardAvoidingView>
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
});
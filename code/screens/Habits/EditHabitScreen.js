import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, colors } from '../../config/theme';
import Dropdown from '../../components/Dropdown';
import { Ionicons } from '@expo/vector-icons';
import { marthaFetch, getHabitId } from '../../config/api';

export default function EditHabitScreen({ route, navigation }) {
    const { habit } = route.params;
    
    const habitId = getHabitId(habit);
    
    const [name, setName] = useState(habit.name || habit.h_name);
    const [description, setDescription] = useState(habit.description || habit.h_description || '');
    const [communities, setCommunities] = useState([]);
    const [communityId, setCommunityId] = useState(habit.community_id || habit.h_community_id || null);
    const [frequency, setFrequency] = useState(habit.frequency || habit.h_frequency || null);
    const [toastMessage, setToastMessage] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));

    const showToast = (message) => {
        setToastMessage(message);
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(2500),
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setToastMessage(''));
    };

    useEffect(() => {
        async function fetchCommunities() {
            try {
                const data = await marthaFetch("select-communities");
                if (data.success) {
                    setCommunities(data.data);
                    // Set community if it exists and is valid
                    if (communityId && data.data.find(c => c.id === communityId)) {
                        // Keep the existing communityId
                    } else if (data.data.length > 0) {
                        // Only set default if current is invalid
                        setCommunityId(null);
                    }
                } else {
                    showToast("⚠ Failed to load communities");
                }
            } catch (error) {
                showToast("⚠ Network error loading communities");
            }
        };
        fetchCommunities();
    }, []);

    const handleUpdateHabit = async () => {
        if (!habitId) {
            showToast('⚠ No habit ID found');
            return;
        }
        
        if (!name || !name.trim()) {
            showToast('⚠ Please enter a habit name');
            return;
        }
        if (!frequency) {
            showToast('⚠ Please select a frequency');
            return;
        }

        try {
            const data = await marthaFetch("update-habit", {
                'name': name.trim(),
                'description': description ? description.trim() : '',
                'community_id': communityId,
                'frequency': frequency,
                'habit_id': habitId
            });
            
            if (data.success) {
                showToast('✓ Habit updated successfully!');
                setTimeout(() => navigation.goBack(), 1500);
            } else {
                showToast('⚠ ' + (data.error || 'Failed to update habit'));
            }
        } catch (error) {
            showToast('⚠ Network error. Check your connection.');
        }
    };
    
    const performDelete = async () => {
        try {
            // Delete habit directly (user_id is now in Habits table, no UserHabits needed)
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
            {toastMessage !== '' && (
                <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </Animated.View>
            )}
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
                <Text style={theme.label}>Description (Optional)</Text>
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
    toast: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: '#333',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        zIndex: 1000,
        alignItems: 'center',
    },
    toastText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../config/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function AddHabitScreen({ navigation }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [communityId, setCommunityId] = useState(null);
    const [frequency, setFrequency] = useState('Daily');
    const [communities, setCommunities] = useState([]);
    const [userId, setUserId] = useState(null);
    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

    useEffect(() => {
        const fetchUserData = async () => {
            const id = await AsyncStorage.getItem('user_id');
            setUserId(id);
        };
        const fetchCommunities = async () => {
            try {
                const response = await fetch("http://martha.jh.shawinigan.info/queries/select-communities/execute", {
                    method: "POST",
                    headers: { "auth": AUTH, "Content-Type": "application/json" }
                });
                const data = await response.json();
                if (data.success) {
                    setCommunities(data.data);
                    if (data.data.length > 0) {
                        setCommunityId(data.data[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch communities:", error);
            }
        };
        fetchUserData();
        fetchCommunities();
    }, []);

    const handleAddHabit = async () => {
        if (!name || !description || !communityId || !frequency) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        try {
            // Step 1: Create the habit
            const createResponse = await fetch("http://martha.jh.shawinigan.info/queries/create-habit/execute", {
                method: 'POST',
                headers: { 'auth': AUTH, 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'name': name, 'description': description, 'community_id': communityId, 'frequency': frequency })
            });
            const createData = await createResponse.json();

            if (createData.success) {
                // Step 2: Get the ID of the newly created habit
                const getHabitIdResponse = await fetch("http://martha.jh.shawinigan.info/queries/select-last-created-habit/execute", {
                    method: 'POST',
                    headers: { 'auth': AUTH, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 'name': name, 'description': description, 'community_id': communityId })
                });
                const getHabitIdData = await getHabitIdResponse.json();

                if (getHabitIdData.success && getHabitIdData.data.length > 0) {
                    const habitId = getHabitIdData.data[0].id;

                    // Step 3: Assign the habit to the user
                    const assignResponse = await fetch("http://martha.jh.shawinigan.info/queries/assign-habit-to-user/execute", {
                        method: 'POST',
                        headers: { 'auth': AUTH, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 'user_id': String(userId), 'habit_id': String(habitId) })
                    });
                    const assignData = await assignResponse.json();

                    if (assignData.success) {
                        Alert.alert('Success', 'Habit added successfully.');
                        navigation.goBack();
                    } else {
                        Alert.alert('Error', 'Failed to assign habit to user.');
                        console.error('Assign habit error:', assignData.error);
                    }
                } else {
                    Alert.alert('Error', 'Failed to retrieve new habit ID.');
                    console.error('Retrieve habit ID error:', getHabitIdData.error);
                }
            } else {
                Alert.alert('Error', 'Failed to create habit.');
                console.error('Create habit error:', createData.error);
            }
        } catch (error) {
            console.error('Network or unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <SafeAreaView style={theme.screenContainer}>
            <ScrollView style={{paddingHorizontal: 20}}>
                <View style={[theme.headerRow, {justifyContent: 'space-between', width: '100%'}]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={theme.title}>Add New Habit</Text>
                    <View style={{width: 24}} />{/* Spacer to balance header */}
                </View>

                <Text style={theme.label}>Habit Name</Text>
                <TextInput
                    style={theme.input}
                    placeholder="e.g., Wake up at 8 AM"
                    placeholderTextColor="#aaa"
                    value={name}
                    onChangeText={setName}
                />
                <Text style={theme.label}>Description</Text>
                <TextInput
                    style={[theme.input, {height: 100, textAlignVertical: 'top'}]}
                    placeholder="e.g., I want to wake up everyday at 8 AM"
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

                <TouchableOpacity style={[theme.publishButton, {marginTop: 30, marginBottom: 40}]} onPress={handleAddHabit}>
                    <Text style={theme.publishButtonText}>Add Habit</Text>
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
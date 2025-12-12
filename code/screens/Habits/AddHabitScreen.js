import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../config/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dropdown from '../../components/Dropdown';
import { Ionicons } from '@expo/vector-icons';
import { marthaFetch } from '../../config/api';

export default function AddHabitScreen({ navigation }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [communityId, setCommunityId] = useState(null);
    const [frequency, setFrequency] = useState('Daily');
    const [communities, setCommunities] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const id = await AsyncStorage.getItem('user_id');
            setUserId(id);
        };
        const fetchCommunities = async () => {
            try {
                const data = await marthaFetch("select-communities");
                if (data.success) {
                    setCommunities(data.data);
                    if (data.data.length > 0) {
                        setCommunityId(data.data[0].id);
                    }
                }
            } catch (error) {
                Alert.alert("Error", "Failed to load communities.");
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
            const createData = await marthaFetch("create-habit", {
                'name': name,
                'description': description,
                'community_id': communityId,
                'frequency': frequency
            });

            if (createData.success) {
                // get the id of the habit we just made
                const getHabitIdData = await marthaFetch("select-last-created-habit", {
                    'name': name,
                    'description': description,
                    'community_id': communityId
                });

                if (getHabitIdData.success && getHabitIdData.data.length > 0) {
                    const habitId = getHabitIdData.data[0].id;

                    const assignData = await marthaFetch("assign-habit-to-user", {
                        'user_id': String(userId),
                        'habit_id': String(habitId)
                    });

                    if (assignData.success) {
                        Alert.alert('Success', 'Habit added successfully.');
                        navigation.goBack();
                    } else {
                        Alert.alert('Error', 'Failed to assign habit to user.');
                    }
                } else {
                    Alert.alert('Error', 'Failed to retrieve new habit ID.');
                }
            } else {
                Alert.alert('Error', 'Failed to create habit.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred.');
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
                    <Text style={theme.title}>Add New Habit</Text>
                    <View style={{width: 24}} />
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

                <TouchableOpacity style={[theme.publishButton, {marginTop: 30, marginBottom: 40}]} onPress={handleAddHabit}>
                    <Text style={theme.publishButtonText}>Add Habit</Text>
                </TouchableOpacity>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, StyleSheet } from 'react-native';
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
    const [frequency, setFrequency] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [userId, setUserId] = useState(null);
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
        const fetchUserData = async () => {
            const id = await AsyncStorage.getItem('user_id');
            setUserId(id);
        };
        const fetchCommunities = async () => {
            try {
                const data = await marthaFetch("select-communities");
                if (data.success) {
                    setCommunities(data.data);
                }
            } catch (error) {
                showToast("⚠ Failed to load communities");
            }
        };
        fetchUserData();
        fetchCommunities();
    }, []);

    const handleAddHabit = async () => {
        if (!name || !name.trim()) {
            showToast('⚠ Please enter a habit name');
            return;
        }
        if (!communityId) {
            showToast('⚠ Please select a community');
            return;
        }
        if (!frequency) {
            showToast('⚠ Please select a frequency');
            return;
        }

        try {
            const createData = await marthaFetch("create-habit", {
                'name': name.trim(),
                'description': description ? description.trim() : '',
                'community_id': communityId,
                'frequency': frequency,
                'user_id': String(userId)
            });

            if (createData.success) {
                showToast('✓ Habit added successfully!');
                setTimeout(() => navigation.goBack(), 1500);
            } else {
                showToast('⚠ Could not create habit');
            }
        } catch (error) {
            showToast('⚠ Network error. Check your connection.');
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
                <Text style={theme.label}>Description (Optional)</Text>
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

const styles = StyleSheet.create({
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
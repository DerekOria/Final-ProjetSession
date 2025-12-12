import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, colors } from '../../config/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { marthaFetch, urlToBase64, isBase64Image } from '../../config/api';

export default function EditProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [career, setCareer] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));

    const showSuccess = (message) => {
        setSuccessMessage(message);
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setSuccessMessage(''));
    };

    useEffect(() => {
        async function loadUserData() {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setFirstname(parsedUser.firstname);
                setLastname(parsedUser.lastname);
                setEmail(parsedUser.email);
                setCareer(parsedUser.career);
                setAvatarUrl(parsedUser.avatar_url);
            }
        }
        loadUserData();
    }, []);

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            let finalAvatarUrl = user.avatar_url; // Keep existing avatar by default
            
            // If a new URL was entered, convert it to Base64
            if (avatarUrl && avatarUrl.trim() !== '' && !isBase64Image(avatarUrl)) {
                showSuccess("Processing image...");
                finalAvatarUrl = await urlToBase64(avatarUrl);
            } else if (avatarUrl && isBase64Image(avatarUrl)) {
                finalAvatarUrl = avatarUrl; // Already Base64, use as-is
            }
            
            const data = await marthaFetch("update-profile-details", {
                user_id: user.id,
                firstname,
                lastname,
                email,
                career,
                avatar_url: finalAvatarUrl,
            });
            
            if (data.success) {
                const updatedUser = { ...user, firstname, lastname, email, career, avatar_url: finalAvatarUrl };
                setUser(updatedUser);
                setAvatarUrl(finalAvatarUrl);
                await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                showSuccess("✓ Profile updated successfully!");
            } else {
                Alert.alert("Error", "Failed to update profile.");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred during profile update.");
        }
    };

    const handleUpdatePassword = async () => {
        if (!user) return;
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        if (newPassword.length < 4) {
            Alert.alert("Error", "Password must be at least 4 characters long.");
            return;
        }
        try {
            const data = await marthaFetch("update-password", {
                user_id: user.id,
                password: newPassword,
            });
            if (data.success) {
                showSuccess("✓ Password updated successfully!");
                setNewPassword('');
                setConfirmPassword('');
            } else {
                Alert.alert("Error", "Failed to update password.");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred during password update.");
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={theme.screenContainer}>
                <Text style={{ color: 'white' }}>Loading profile data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={theme.screenContainer}>
            {successMessage !== '' && (
                <Animated.View style={[styles.successBanner, { opacity: fadeAnim }]}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.successText}>{successMessage}</Text>
                </Animated.View>
            )}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
            <ScrollView style={{paddingHorizontal: 20}} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
                <View style={theme.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={theme.title}>Edit Profile</Text>
                    <View style={{width: 24}} />
                </View>

                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <Image
                        source={{ uri: avatarUrl || "http://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                        style={theme.profileImageLarge}
                    />
                </View>

                <Text style={theme.label}>Avatar URL</Text>
                <TextInput
                    style={theme.input}
                    placeholder="Paste image URL here"
                    placeholderTextColor="#aaa"
                    value={isBase64Image(avatarUrl) ? '' : avatarUrl}
                    onChangeText={setAvatarUrl}
                />
                {isBase64Image(avatarUrl) && (
                    <Text style={{ color: colors.gray, fontSize: 12, marginTop: 4 }}>
                        Current image saved. Enter new URL to change.
                    </Text>
                )}

                <Text style={theme.label}>First Name</Text>
                <TextInput
                    style={theme.input}
                    value={firstname}
                    onChangeText={setFirstname}
                    placeholderTextColor="#aaa"
                />
                <Text style={theme.label}>Last Name</Text>
                <TextInput
                    style={theme.input}
                    value={lastname}
                    onChangeText={setLastname}
                    placeholderTextColor="#aaa"
                />
                <Text style={theme.label}>Email</Text>
                <TextInput
                    style={theme.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholderTextColor="#aaa"
                />
                <Text style={theme.label}>Career</Text>
                <TextInput
                    style={theme.input}
                    value={career}
                    onChangeText={setCareer}
                    placeholderTextColor="#aaa"
                />
                <TouchableOpacity style={theme.publishButton} onPress={handleUpdateProfile}>
                    <Text style={theme.publishButtonText}>Update Details</Text>
                </TouchableOpacity>

                <Text style={[theme.label, {marginTop: 40}]}>Change Password</Text>
                <TextInput
                    style={theme.input}
                    placeholder="New Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TextInput
                    style={theme.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={theme.publishButton} onPress={handleUpdatePassword}>
                    <Text style={theme.publishButtonText}>Update Password</Text>
                </TouchableOpacity>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    successBanner: {
        backgroundColor: '#2E7D32',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    successText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../config/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [career, setCareer] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

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
            const response = await fetch("http://martha.jh.shawinigan.info/queries/update-profile-details/execute", {
                method: "POST",
                headers: { "auth": AUTH, "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    firstname,
                    lastname,
                    email,
                    career,
                })
            });
            const data = await response.json();
            if (data.success) {
                // Update user in AsyncStorage
                const updatedUser = { ...user, firstname, lastname, email, career };
                await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                Alert.alert("Success", "Profile updated successfully.");
            } else {
                Alert.alert("Error", "Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An error occurred during profile update.");
        }
    };

    const handleUpdateAvatar = async () => {
        if (!user) return;
        try {
            const response = await fetch("http://martha.jh.shawinigan.info/queries/update-avatar/execute", {
                method: "POST",
                headers: { "auth": AUTH, "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    avatar_url: avatarUrl,
                })
            });
            const data = await response.json();
            if (data.success) {
                const updatedUser = { ...user, avatar_url: avatarUrl };
                await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                Alert.alert("Success", "Avatar updated successfully.");
            } else {
                Alert.alert("Error", "Failed to update avatar.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An error occurred during avatar update.");
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
            const response = await fetch("http://martha.jh.shawinigan.info/queries/update-password/execute", {
                method: "POST",
                headers: { "auth": AUTH, "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    password: newPassword,
                })
            });
            const data = await response.json();
            if (data.success) {
                Alert.alert("Success", "Password updated successfully.");
                setNewPassword('');
                setConfirmPassword('');
            } else {
                Alert.alert("Error", "Failed to update password.");
            }
        } catch (error) {
            console.error(error);
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
            <ScrollView style={{paddingHorizontal: 20}}>
                <View style={theme.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={theme.title}>Edit Profile</Text>
                    <View style={{width: 24}} />{/* Spacer */}
                </View>

                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <Image
                        source={{ uri: avatarUrl || "http://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                        style={theme.profileImageLarge}
                    />
                    <TextInput
                        style={[theme.input, {width: '80%', marginTop: 10}]}
                        placeholder="Avatar URL"
                        placeholderTextColor="#aaa"
                        value={avatarUrl}
                        onChangeText={setAvatarUrl}
                    />
                    <TouchableOpacity style={theme.publishButton} onPress={handleUpdateAvatar}>
                        <Text style={theme.publishButtonText}>Update Avatar</Text>
                    </TouchableOpacity>
                </View>

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
        </SafeAreaView>
    );
}
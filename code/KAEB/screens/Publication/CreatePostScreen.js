import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../config/theme";
import { Picker } from '@react-native-picker/picker';

export default function CreatePostScreen({ navigation }) {

    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [userId, setUserId] = useState(null);
    const [habits, setHabits] = useState([]);
    const [selectedHabit, setSelectedHabit] = useState(null);

    useEffect(() => {
        async function loadUser() {
            const saved = await AsyncStorage.getItem("user_id");
            setUserId(saved);
        }
        loadUser();
    }, []);

    useEffect(() => {
        async function loadData() {
            if (!userId) return;
            try {
                // Fetch communities
                const resCommunities = await fetch("http://martha.jh.shawinigan.info/queries/select-communities/execute", {
                    method: "POST",
                    headers: { "auth": AUTH, "Content-Type": "application/json" }
                });
                const jsonCommunities = await resCommunities.json();
                if (jsonCommunities.success) {
                    setCommunities(jsonCommunities.data);
                    if (jsonCommunities.data.length > 0) {
                        const firstCommId = jsonCommunities.data[0].id || jsonCommunities.data[0].community_id || jsonCommunities.data[0].c_id;
                        setSelectedCommunity(firstCommId);
                    }
                }

                // Fetch user habits
                const resHabits = await fetch("http://martha.jh.shawinigan.info/queries/select-user-habits/execute", {
                    method: "POST",
                    headers: { "auth": AUTH, "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId })
                });
                const jsonHabits = await resHabits.json();
                if (jsonHabits.success) {
                    setHabits(jsonHabits.data);
                }

            } catch (error) {
                console.error("Failed to load data:", error);
                Alert.alert("Error", "Could not load data.");
            }
        }
        loadData();
    }, [userId]);

    async function createPost() {
        console.log("[CreatePost] Button pressed - function called");
        console.log("[CreatePost] State values:", { userId, selectedCommunity, description, selectedHabit, imageUrl });
        
        if (!userId) {
            console.log("[CreatePost] ERROR: No userId found");
            Alert.alert("Error", "User ID not found. Please log in again.");
            return;
        }
        
        if (!description || !selectedCommunity) {
            console.log("[CreatePost] Validation failed");
            Alert.alert("Missing Information", "Please select a community and write a description.");
            return;
        }
        
        try {
            console.log("[CreatePost] Sending POST request to Martha...");
            
            // Sanitize description - remove problematic characters if needed
            const cleanDescription = description.trim();
            
            const requestBody = {
                'user_id': String(userId),
                'community_id': String(selectedCommunity),
                'description': cleanDescription,
                'image_url': imageUrl || "",
                'habit_id': selectedHabit ? String(selectedHabit) : null
            };
            console.log("[CreatePost] Request body:", requestBody);
            console.log("[CreatePost] Description being sent:", cleanDescription);
            console.log("[CreatePost] User ID:", userId);
            console.log("[CreatePost] Community ID:", selectedCommunity);
            console.log("[CreatePost] Habit ID:", selectedHabit);
            
            const res = await fetch("http://martha.jh.shawinigan.info/queries/create-post/execute", {
                method: "POST",
                headers: {
                    "auth": AUTH,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            console.log("[CreatePost] Response status:", res.status);
            const json = await res.json();
            console.log("[CreatePost] Response JSON:", json);

            if (json.success) {
                console.log("[CreatePost] SUCCESS - Post created!");
                Alert.alert("Success", "Post created!");
                navigation.goBack();
            } else {
                console.log("[CreatePost] ERROR from server:", json.error || json.message);
                Alert.alert("Error", json.error || "Could not create the post.");
            }
        } catch (error) {
            console.log("[CreatePost] CAUGHT EXCEPTION:", error);
            Alert.alert("Error", "An unexpected error occurred: " + error.message);
        }
    }

    return (
        <SafeAreaView style={[theme.screenContainer, {paddingHorizontal: 0}]}>
            <ScrollView style={{ paddingHorizontal: 20 }}>

                <Text style={[theme.title, {marginVertical: 20}]}>Créer une publication</Text>

                <Text style={theme.label}>Communauté</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCommunity}
                        onValueChange={(itemValue) => setSelectedCommunity(itemValue)}
                        style={styles.picker}
                        dropdownIconColor={'white'}
                        >
                        {communities.map(c => {
                            const communityId = c.id || c.community_id || c.c_id;
                            return <Picker.Item key={communityId} label={c.name} value={communityId} color="#000000" />;
                        })}
                    </Picker>
                </View>

                <Text style={theme.label}>Lier un Habitude (Optionnel)</Text>
                 <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedHabit}
                        onValueChange={(itemValue) => setSelectedHabit(itemValue)}
                        style={styles.picker}
                        dropdownIconColor={'white'}
                        >
                        <Picker.Item label="-- Aucun --" value={null} color="#000000" />
                        {habits.map(h => {
                            const habitId = h.id || h.habit_id || h.h_id;
                            const habitName = h.name || h.h_name;
                            return <Picker.Item key={habitId} label={habitName} value={habitId} color="#000000" />;
                        })}
                    </Picker>
                </View>

                <Text style={theme.label}>Description</Text>
                <TextInput
                    style={[theme.input, {height: 100, textAlignVertical: 'top'}]}
                    placeholder="Écris quelque chose..."
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text style={theme.label}>Image URL (Optionnel)</Text>
                 <TextInput
                    style={theme.input}
                    placeholder="https://example.com/image.png"
                    placeholderTextColor="#aaa"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                />

                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={theme.previewImage} />
                ) : null}

                <TouchableOpacity style={theme.publishButton} onPress={createPost}>
                    <Text style={theme.publishButtonText}>Publier</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pickerContainer: {
        backgroundColor: '#2C2C2E',
        borderRadius: 10,
        marginVertical: 10,
        overflow: 'hidden',
    },
    picker: {
        color: '#000000', // For selected value text when picker is collapsed
    },
    pickerItem: {
        color: '#000000', // For items in the open dropdown list
        backgroundColor: '#FFFFFF', // Ensure items have a white background for readability
    }
});
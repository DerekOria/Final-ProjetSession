import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../config/theme";
import Dropdown from "../../components/Dropdown";
import { Ionicons } from "@expo/vector-icons";
import { marthaFetch, getCommunityId, getHabitId, sanitizeForSQL, urlToBase64 } from "../../config/api";
import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen({ navigation }) {

    const [communities, setCommunities] = useState([]); // Charger les communities depuis Martha
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [userId, setUserId] = useState(null);
    const [habits, setHabits] = useState([]); // Charger les habits depuis Martha
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [isConverting, setIsConverting] = useState(false); // ?
    const [selectedImage, setSelectedImage] = useState(null);

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
                const jsonCommunities = await marthaFetch("select-communities");
                if (jsonCommunities.success) {
                    setCommunities(jsonCommunities.data);
                }

                const jsonHabits = await marthaFetch("select-user-habits", { user_id: userId });
                if (jsonHabits.success) {
                    setHabits(jsonHabits.data);
                }

            } catch (error) {
                Alert.alert("Error", "Could not load data.");
            }
        }
        loadData();
    }, [userId]);

    async function pickImage() {
        try {

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0){
                setSelectedImage(result.assets[0].uri);
                setImageUrl("");
            }

        }
        catch (error) {
            Alert.alert("Error", "Failed to pick image" + error.message);
        }
    }

    function removeImage(){
        setSelectedImage(null),
        setImageUrl("");
    }

    async function createPost() {
        if (!userId) {
            Alert.alert("Error", "User ID not found. Please log in again.");
            return;
        }
        
        if (!selectedCommunity) {
            Alert.alert("Missing Information", "Please select a community.");
            return;
        }
        
        try {
            // convert image URL to base64 before saving
            setIsConverting(true);
            let imageData = '';

            //
            if (selectedImage){
                imageData = await urlToBase64(selectedImage);
            } else if(imageUrl && imageUrl.trim() !== '') {
                imageData = await urlToBase64(imageUrl);
            }
            

            setIsConverting(false);
            
            const json = await marthaFetch("create-post", {
                'user_id': userId,
                'community_id': selectedCommunity,
                'description': sanitizeForSQL(description.trim()),
                'image_url': sanitizeForSQL(imageData),
                'habit_id': selectedHabit || null
            });

            if (json.success) {
                Alert.alert("Success", "Post created!");
                navigation.goBack();
            } else {
                Alert.alert("Error", json.error || "Could not create the post.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred: " + error.message);
        }
    }

    return (
        <SafeAreaView style={[theme.screenContainer, {paddingHorizontal: 0}]}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
            <ScrollView 
                style={{ paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >

                <View style={[theme.headerRow, {justifyContent: 'space-between', marginBottom: 10}]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={theme.title}>Create Post</Text>
                    <View style={{width: 24}} />
                </View>

                <Text style={theme.label}>Community</Text>
                <Dropdown
                    options={communities.map(c => ({
                        label: c.name,
                        value: getCommunityId(c)
                    }))}
                    selectedValue={selectedCommunity}
                    onSelect={setSelectedCommunity}
                    placeholder="Select a community"
                />

                <Text style={theme.label}>Link a Habit (Optional)</Text>
                <Dropdown
                    options={[
                        { label: "-- None --", value: null },
                        ...habits.map(h => ({
                            label: h.name || h.h_name,
                            value: getHabitId(h)
                        }))
                    ]}
                    selectedValue={selectedHabit}
                    onSelect={setSelectedHabit}
                    placeholder="Select a habit"
                />

                <Text style={theme.label}>Description</Text>
                <TextInput
                    style={[theme.input, {height: 100, textAlignVertical: 'top'}]}
                    placeholder="Write something..."
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text style={theme.label}>Add Image (Optional) </Text>

                <TouchableOpacity 
                    style={{
                        backgroundColor: '#2a2a2a',
                        padding: 15,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: '#444',
                    }}
                    onPress={pickImage}
                >
                    <Ionicons name="images-outline" size={24} color="white" style={{marginRight: 10}} />
                    <Text style={{color: 'white', fontSize: 16}}>
                        Choose from Gallery
                    </Text>
                </TouchableOpacity>

                <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
                    <View style={{flex: 1, height: 1, backgroundColor: '#444'}} />
                    <Text style={{color: '#888', marginHorizontal: 10}}>OR</Text>
                    <View style={{flex: 1, height: 1, backgroundColor: '#444'}} />
                </View>


                <Text style={theme.label}>Image URL (Optional)</Text>
                <TextInput
                    style={theme.input}
                    placeholder="https://example.com/image.png"
                    placeholderTextColor="#aaa"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    editable={!selectedImage} // Disable if image from gallery is selected
                />

                {(selectedImage || imageUrl) && (
                    <View style={{marginTop: 15, position: 'relative'}}>
                        <Image 
                            source={{ uri: selectedImage || imageUrl }} 
                            style={theme.previewImage}
                        />
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                borderRadius: 20,
                                padding: 8,
                            }}
                            onPress={removeImage}
                        >
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity 
                    style={[theme.publishButton, isConverting && {opacity: 0.6}]} 
                    onPress={createPost}
                    disabled={isConverting}
                >
                    <Text style={theme.publishButtonText}>
                        {isConverting ? "Processing image..." : "Publish"}
                    </Text>
                </TouchableOpacity>

            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
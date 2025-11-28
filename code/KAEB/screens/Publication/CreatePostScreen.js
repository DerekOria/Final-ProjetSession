import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../config/theme";

export default function CreatePostScreen({ navigation }) {

    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        async function loadUser() {
            const saved = await AsyncStorage.getItem("user_id");
            setUserId(saved);
        }
        loadUser();
    }, []);

    useEffect(() => {
        async function loadCommunities() {
            const res = await fetch("https://martha.jh.shawinigan.info/queries/select-communities/execute", {
                method: "POST",
                headers: {
                    "auth": AUTH,
                    "Content-Type": "application/json"
                }
            });

            const json = await res.json();
            if (json.success) setCommunities(json.data);
        }

        loadCommunities();
    }, []);

    async function pickImage() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Permission needed.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType. Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    async function uploadImage(uri) {
        const formData = new FormData();
        formData.append("file", {
            uri,
            type: "image/jpeg",
            name: "post.jpg"
        });

        const res = await fetch("https://martha.jh.shawinigan.info/upload-image-post", {
            method: "POST",
            headers: {
                "auth": AUTH
            },
            body: formData
        });

        return await res.json();
    }

    async function createPost() {

        if (!image) {
            alert("Selecciona una imagen.");
            return;
        }

        const uploaded = await uploadImage(image);

        const res = await fetch("https://martha.jh.shawinigan.info/queries/create-post/execute", {
            method: "POST",
            headers: {
                "auth": AUTH,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                community_id: selectedCommunity,
                description,
                image_url: uploaded.url
            })
        });

        const json = await res.json();

        if (json.success) {
            alert("Post creado!");
            navigation.goBack();
        } else {
            alert("Error creando el post.");
        }
    }

    return (
        <SafeAreaView style={theme.screenContainer}>
            <ScrollView style={{ padding: 20 }}>

                <Text style={theme.title}>Créer une publication</Text>

                <Text style={theme.label}>Communauté</Text>
                {communities.map(c => (
                    <TouchableOpacity
                        key={c.id}
                        style={[
                            theme.communityOption,
                            selectedCommunity === c.id && theme.communitySelected
                        ]}
                        onPress={() => setSelectedCommunity(c.id)}
                    >
                        <Text style={theme.communityText}>{c.name}</Text>
                    </TouchableOpacity>
                ))}

                <Text style={theme.label}>Description</Text>
                <TextInput
                    style={theme.input}
                    placeholder="Écris quelque chose..."
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <TouchableOpacity style={theme.imageButton} onPress={pickImage}>
                    <Text style={{ color: "#000" }}>Choisir une image</Text>
                </TouchableOpacity>

                {image && (
                    <Image source={{ uri: image }} style={theme.previewImage} />
                )}

                <TouchableOpacity style={theme.publishButton} onPress={createPost}>
                    <Text style={theme.publishText}>Publier</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

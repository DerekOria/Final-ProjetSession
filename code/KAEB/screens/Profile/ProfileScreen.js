import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ThemeIcon from "../../components/CustomBotton";
import BottomBar from "../../components/BottomBar";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {

    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

    const navigation = useNavigation();
    const [userImage, setUserImage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [tab, setTab] = useState("posts"); // "posts" | "saved"
    const [myPosts, setMyPosts] = useState([]);


    useEffect(() => {
        async function loadUser() {
            const id = await AsyncStorage.getItem("user_id");
            console.log("📌 user_id desde AsyncStorage:", id);

            setUserId(id);

            if (id) {
                loadProfile(id);
                loadMyPosts(id);
            }
            else console.log("❌ No existe user_id");
        }
        loadUser();
    }, []);

async function loadProfile(id) {
    try {
        const res = await fetch(
            "http://martha.jh.shawinigan.info/queries/select-profile/execute",
            {
                method: "POST",
                headers: {
                    "auth": AUTH,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ user_id: id })
            }
        );

        const json = await res.json();

        console.log("Perfil:", json);

        if (json.success && json.data.length > 0) {
            setUserImage(json.data[0].avatar_url);
        }

    } catch (e) {
        console.log("❌ Error al cargar perfil:", e);
        
        setUserImage("http://cdn-icons-png.flaticon.com/512/149/149071.png");
    }
}

async function loadMyPosts(id) {
    try {
        const res = await fetch(
            "http://martha.jh.shawinigan.info/queries/select-user-posts/execute",
            {
                method: "POST",
                headers: {
                    auth: AUTH,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: id }),
            }
        );

        const json = await res.json();
        console.log("📸 Mis posts:", json);

        if (json.success) setMyPosts(json.data);

    } catch (err) {
        console.log("❌ Error cargando posts:", err);
    }
}


    async function uploadToMartha(uri) {

        const formData = new FormData();
        formData.append("file", {
            uri,
            type: "image/jpeg",
            name: "avatar.jpg",
        });
        formData.append("folder", "avatars");

        console.log("⬆ Subiendo imagen...");

        const res = await fetch("http://martha.jh.shawinigan.info/upload-profile-avatar", {
            method: "POST",
            body: formData, 
        });

        return await res.json();
    }

    async function saveAvatarToDB(url) {
        console.log("💾 Guardando avatar en BD…");

        const res = await fetch("http://martha.jh.shawinigan.info/query", {
            method: "POST",
            headers: {
                auth: AUTH,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "update-avatar",
                param_user_id: userId,
                param_avatar_url: url,
            }),
        });

        console.log("✔ BD Response:", await res.json());
    }

    async function pickImage() {

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Permission needed.");
            return;
        }

        if (Platform.OS === "web") {
        alert("La carga de imágenes no funciona en la versión web. Usa tu celular con Expo Go.");
        return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: [ImagePicker.MediaType.image], 
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {

            const uri = result.assets[0].uri;
            console.log("URI seleccionada:", uri);
            const uploaded = await uploadToMartha(uri);

            if (uploaded.url) {
                await saveAvatarToDB(uploaded.url);
                setUserImage(uploaded.url);
            }
        }
    }

    return (
        <SafeAreaView style={theme.screenContainer}>
            <View style={theme.profileContainer}>

                <ThemeIcon name="arrow-back-outline" onPress={() => navigation.navigate("Home")} />

                <TouchableOpacity style={theme.profileButtonProfile} onPress={pickImage}>
                    <Image
                        source={{
                            uri: userImage || "http://cdn-icons-png.flaticon.com/512/149/149071.png",
                        }}
                        style={theme.profileImageLarge}
                    />
                </TouchableOpacity>

                <ThemeIcon name="settings-outline" />

            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setTab("posts")} style={[styles.tab, tab === "posts" && styles.tabActive]}>
                    <Text style={styles.tabText}>Posts</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setTab("saved")} style={[styles.tab, tab === "saved" && styles.tabActive]}>
                    <Text style={styles.tabText}> Saved </Text>
                </TouchableOpacity>
                </View>

                {tab === "posts" && (
                    <View style={styles.grid}>
                        {myPosts.map((p) => (
                            <TouchableOpacity
                                key={p.id}
                                onPress={() => navigation.navigate("Publication", { post: p })}
                            >
                                <Image
                                    source={{ uri: p.image_url }}
                                    style={styles.gridImage}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {tab === "saved" && (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: "white", fontSize: 16 }}>No tienes posts guardados aún.</Text>
                    </View>
                )}





            <BottomBar />
        </SafeAreaView>
    );
}

const styles = {
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 14,
    },
    tab: {
        paddingVertical: 6,
    },
    tabActive: {
        borderBottomColor: "white",
        borderBottomWidth: 2,
    },
    tabText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    gridImage: {
        width: "99.99%",
        height: 120,
        aspectRatio: 1,     // cuadradas automáticamente
        borderWidth: 1,
        borderColor: "#000",
        borderColor: "#222",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    }
};

import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomBar from "../../components/BottomBar";
import PostCard from "../../components/PostCard";
import { marthaFetch, getPostId } from "../../config/api";

export default function HomeScreen({ route }){

    const [UserId, setUserId] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userImage, setUserImage] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
    const isFocused = useIsFocused();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await marthaFetch("select-posts", {});

                if (data.success) {
                    setPosts(data.data);
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        if (isFocused) {
            fetchPosts();
        }
    }, [isFocused]);

    useEffect(() => {
        async function loadUser() {
            const id = await AsyncStorage.getItem("user_id");
            setUserId(id);
            
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                const user = JSON.parse(userData);
                if (user.avatar_url) {
                    setUserImage(user.avatar_url);
                }
            }
        }
        loadUser();
    }, [isFocused]);

    return(
        <SafeAreaView style={theme.screenContainer}>

        <View style={theme.headerRow}>

            <TouchableOpacity onPress={() => navigation.navigate("CreatePost")} style={{ padding: 4 }}>
                <Ionicons name="add-circle" size={36} color={colors.primary} />
            </TouchableOpacity>
            
            <Text style={theme.title}> KAEB </Text>
            
            <TouchableOpacity style={theme.profileButton} onPress={() => navigation.navigate("Profile") }>
            
            <Image
                source={{ uri: userImage }}
                style={theme.profileImage}
            />
            </TouchableOpacity>
        </View>

        <View style={theme.divider}/>

        <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal: 16}}>
            {loading ? (
                <Text style={{ color: "white", textAlign: "center", marginTop: 20 }}>Loading posts...</Text>
            ) : posts.length === 0 ? (
                <Text style={{ color: colors.gray, textAlign: "center", marginTop: 20 }}>No posts yet. Create one!</Text>
            ) : (
                posts.map((p) => (
                <TouchableOpacity
                    key={getPostId(p) || `post-${Math.random()}`}
                    onPress={() => navigation.navigate("Post", { post: p })}
                >
                    <PostCard post={p} />
                </TouchableOpacity>
            ))
            )}
        </ScrollView>


        
        <BottomBar />

        </SafeAreaView>
    );

}
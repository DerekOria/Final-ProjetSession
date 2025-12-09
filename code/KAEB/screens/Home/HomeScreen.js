import { View, Button, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomBar from "../../components/BottomBar"; // Re-add BottomBar import
import PostCard from "../../components/PostCard";


export default function HomeScreen({ route }){

    const [UserId, setUserId] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused(); 

    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(
                    "http://martha.jh.shawinigan.info/queries/select-posts/execute",
                    {
                        method: "POST",
                        headers: {
                            "auth": AUTH,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({})
                    }
                );

                const data = await response.json();

                if (data.success) {
                    setPosts(data.data);
                } else {
                    console.log("Erreur dans la requete:", data.error);
                }

            } catch (err) {
                console.log("Erreur fetch:", err);

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
        }
        loadUser();
    }, []);


    // pour naviguer entre screens
    const navigation = useNavigation();
    // juste pour tester
    const userImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return(
        <SafeAreaView style={theme.screenContainer}>

        <View style={theme.headerRow}>

            <TouchableOpacity>
                <Text style={theme.title} onPress={() => navigation.navigate("CreatePost")}>+</Text>
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
            ) : (
                posts.map((p) => (
                <TouchableOpacity
                    key={p.id}
                    onPress={() => navigation.navigate("Publication", { post: p })}
                >
                    <PostCard post={p} />
                </TouchableOpacity>
            ))
            )}
        </ScrollView>


        
        <BottomBar /> {/* Re-add BottomBar */}

        </SafeAreaView>
    );

}
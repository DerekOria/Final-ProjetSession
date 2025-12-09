import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from "react-native";

import { useRef, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PostCard({ post }) {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [liked, setLiked] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: false,
        }).start();
        
        const getUserId = async () => {
            const id = await AsyncStorage.getItem("user_id");
            setCurrentUserId(id);
        };
        getUserId();
    }, []);

    const handleEdit = () => {
        navigation.navigate("EditPost", { post });
    };

    const isOwner = currentUserId && currentUserId == post.user_id;

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <Image
                    source={{ uri: post.avatar_url }}
                    style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                    <Text style={styles.username}>
                        {post.firstname} {post.lastname}
                    </Text>

                    <Text style={styles.subInfo}>• {post.community}</Text>
                </View>
                
                {isOwner && (
                     <TouchableOpacity onPress={handleEdit} style={{marginRight: 10}}>
                        <Ionicons name="create-outline" size={22} color="#CCC" />
                    </TouchableOpacity>
                )}

                <Ionicons name="ellipsis-vertical" size={22} color="#CCC" />
            </View>

            {/* IMAGE */}
            {post.image_url && (
                <Image
                    source={{ uri: post.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}

            {/* ACTIONS */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => setLiked(!liked)}>
                    <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={28}
                        color={liked ? "#FF3A3A" : "#FFF"}
                    />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="chatbubble-outline" size={26} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Ionicons name="repeat-outline" size={26} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* DESCRIPTION */}
            <Text style={styles.desc}>{post.description}</Text>
        </Animated.View>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1C1C1E",
        padding: 14,
        borderRadius: 14,
        marginVertical: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 12,
    },
    username: {
        color: "white",
        fontSize: 15,
        fontWeight: "bold",
    },
    subInfo: {
        color: "#AAA",
        fontSize: 12,
        marginTop: 2,
    },
    image: {
        width: "100%",
        height: 240,
        borderRadius: 12,
        backgroundColor: "#333",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 10,
    },
    desc: {
        color: "white",
        marginTop: 6,
        fontSize: 15,
        lineHeight: 20,
    },
});

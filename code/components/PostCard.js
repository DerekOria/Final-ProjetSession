import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from "react-native";

import { useRef, useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { marthaFetch, getPostId } from "../config/api";

export default function PostCard({ post }) {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [liked, setLiked] = useState(false);
    const [celebrated, setCelebrated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [reactionCount, setReactionCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const userIdRef = useRef(null);

    const postId = getPostId(post);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: false,
        }).start();
        
        const loadUserId = async () => {
            const id = await AsyncStorage.getItem("user_id");
            setCurrentUserId(id);
            userIdRef.current = id;
        };
        loadUserId();
    }, []);

    // refresh when coming back to screen
    useFocusEffect(
        useCallback(() => {
            const refreshData = async () => {
                const id = userIdRef.current || await AsyncStorage.getItem("user_id");
                userIdRef.current = id;
                setCurrentUserId(id);
                
                await Promise.all([
                    loadReactionCount(),
                    loadCommentCount(),
                    loadUserReactions(id),
                ]);
            };
            refreshData();
        }, [postId])
    );

    const loadReactionCount = async () => {
        try {
            const data = await marthaFetch("select-post-reactions", { post_id: postId });
            if (data.success && data.data) {
                const total = data.data.reduce((sum, r) => sum + (r.count || 0), 0);
                setReactionCount(total);
            }
        } catch (err) {}
    };

    const loadCommentCount = async () => {
        try {
            const data = await marthaFetch("count-post-comments", { post_id: postId });
            if (data.success && data.data && data.data[0]) {
                setCommentCount(data.data[0].count || 0);
            }
        } catch (err) {}
    };

    const loadUserReactions = async (uid) => {
        if (!uid) return;
        try {
            const data = await marthaFetch("select-user-post-reactions", { 
                post_id: postId, 
                user_id: uid 
            });
            if (data.success && data.data) {
                const types = data.data.map(r => r.reaction_type);
                setLiked(types.includes('love'));
                setCelebrated(types.includes('celebrate'));
            }
        } catch (err) {}
    };

    const handleLike = async () => {
        if (!currentUserId) return;
        
        try {
            if (liked) {
                await marthaFetch("remove-reaction", {
                    post_id: postId,
                    user_id: currentUserId,
                    reaction_type: 'love',
                });
                setLiked(false);
                setReactionCount(prev => Math.max(0, prev - 1));
            } else {
                await marthaFetch("add-reaction", {
                    post_id: postId,
                    user_id: currentUserId,
                    reaction_type: 'love',
                });
                setLiked(true);
                setReactionCount(prev => prev + 1);
            }
        } catch (err) {}
    };

    const handleCelebrate = async () => {
        if (!currentUserId) return;
        
        try {
            if (celebrated) {
                await marthaFetch("remove-reaction", {
                    post_id: postId,
                    user_id: currentUserId,
                    reaction_type: 'celebrate',
                });
                setCelebrated(false);
                setReactionCount(prev => Math.max(0, prev - 1));
            } else {
                await marthaFetch("add-reaction", {
                    post_id: postId,
                    user_id: currentUserId,
                    reaction_type: 'celebrate',
                });
                setCelebrated(true);
                setReactionCount(prev => prev + 1);
            }
        } catch (err) {}
    };

    const handleEdit = () => {
        navigation.navigate("EditPost", { post });
    };

    const handleViewPost = () => {
        navigation.navigate("Post", { post });
    };

    const handleViewProfile = () => {
        if (currentUserId && currentUserId == post.user_id) {
            navigation.navigate("Profile");
        } else {
            navigation.navigate("ViewProfile", { 
                user: {
                    user_id: post.user_id,
                    id: post.user_id,
                    firstname: post.firstname,
                    lastname: post.lastname,
                    avatar_url: post.avatar_url,
                }
            });
        }
    };

    const isOwner = currentUserId && currentUserId == post.user_id;

    // format the date nicely
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            {/* Header: Avatar, name, community, time, edit */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleViewProfile}>
                    <Image
                        source={{ uri: post.avatar_url }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <TouchableOpacity onPress={handleViewProfile}>
                        <Text style={styles.username}>
                            {post.firstname} {post.lastname}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.metaRow}>
                        <View style={styles.communityBadge}>
                            <Text style={styles.communityText}>{post.community}</Text>
                        </View>
                        <Text style={styles.timeText}>{formatDate(post.created_at)}</Text>
                    </View>
                </View>

                {isOwner && (
                    <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                        <Ionicons name="create-outline" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Description */}
            <TouchableOpacity onPress={handleViewPost} activeOpacity={0.8}>
                <Text style={styles.description}>{post.description}</Text>
            </TouchableOpacity>

            {/* Image (if exists) */}
            {post.image_url && (
                <TouchableOpacity onPress={handleViewPost} activeOpacity={0.9}>
                    <Image
                        source={{ uri: post.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}

            {/* Footer: Reactions and comments */}
            <View style={styles.footer}>
                <View style={styles.reactions}>
                    <TouchableOpacity onPress={handleLike} style={styles.reactionButton}>
                        <Ionicons
                            name={liked ? "heart" : "heart-outline"}
                            size={22}
                            color={liked ? "#FF4757" : "#888"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleCelebrate} style={styles.reactionButton}>
                        <Text style={[styles.celebrateEmoji, celebrated && styles.celebrateActive]}>
                            🎉
                        </Text>
                    </TouchableOpacity>

                    {reactionCount > 0 && (
                        <Text style={styles.reactionCount}>{reactionCount}</Text>
                    )}
                </View>

                <TouchableOpacity onPress={handleViewPost} style={styles.commentButton}>
                    <Ionicons name="chatbubble-outline" size={20} color="#888" />
                    <Text style={styles.commentCount}>{commentCount}</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1E1E1E",
        borderRadius: 16,
        marginVertical: 8,
        marginHorizontal: 4,
        overflow: 'hidden',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        paddingBottom: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#333",
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    communityBadge: {
        backgroundColor: "#2A9D8F",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    communityText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "600",
    },
    timeText: {
        color: "#666",
        fontSize: 12,
        marginLeft: 8,
    },
    editButton: {
        padding: 8,
    },
    description: {
        color: "#E5E5E5",
        fontSize: 15,
        lineHeight: 22,
        paddingHorizontal: 14,
        paddingBottom: 12,
    },
    image: {
        width: "100%",
        height: 220,
        backgroundColor: "#2A2A2A",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#2A2A2A",
    },
    reactions: {
        flexDirection: "row",
        alignItems: "center",
    },
    reactionButton: {
        padding: 6,
        marginRight: 4,
    },
    celebrateEmoji: {
        fontSize: 18,
        opacity: 0.5,
    },
    celebrateActive: {
        opacity: 1,
    },
    reactionCount: {
        color: "#888",
        fontSize: 14,
        marginLeft: 4,
    },
    commentButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 6,
    },
    commentCount: {
        color: "#888",
        fontSize: 14,
        marginLeft: 6,
    },
});

import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { marthaFetch, getPostId } from "../../config/api";
import { colors } from "../../config/theme";

const REACTION_TYPES = [
    { type: 'like', emoji: '👍' },
    { type: 'love', emoji: '❤️' },
    { type: 'celebrate', emoji: '🎉' },
    { type: 'strong', emoji: '💪' },
    { type: 'fire', emoji: '🔥' },
];

export default function PostScreen({ route, navigation }) {

    const { post } = route.params;
    const postId = getPostId(post);
    
    const [userId, setUserId] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [reactions, setReactions] = useState({});
    const [userReactions, setUserReactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserAndData();
    }, []);

    const loadUserAndData = async () => {
        const id = await AsyncStorage.getItem("user_id");
        setUserId(id);
        await Promise.all([
            loadComments(),
            loadReactions(id),
        ]);
        setLoading(false);
    };

    const loadComments = async () => {
        try {
            const data = await marthaFetch("select-post-comments", { post_id: postId });
            if (data.success) {
                setComments(data.data || []);
            }
        } catch (err) {}
    };

    const loadReactions = async (uid) => {
        try {
            const reactionsData = await marthaFetch("select-post-reactions", { post_id: postId });
            if (reactionsData.success) {
                const counts = {};
                (reactionsData.data || []).forEach(r => {
                    counts[r.reaction_type] = r.count;
                });
                setReactions(counts);
            }

            if (uid) {
                const userReactionsData = await marthaFetch("select-user-post-reactions", { 
                    post_id: postId, 
                    user_id: uid 
                });
                if (userReactionsData.success) {
                    setUserReactions((userReactionsData.data || []).map(r => r.reaction_type));
                }
            }
        } catch (err) {}
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !userId) return;
        
        try {
            const data = await marthaFetch("create-comment", {
                post_id: postId,
                user_id: userId,
                content: newComment.trim(),
            });
            if (data.success) {
                setNewComment('');
                await loadComments();
            }
        } catch (err) {
            // Silent fail
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const data = await marthaFetch("delete-comment", {
                comment_id: commentId,
                user_id: userId,
            });
            if (data.success) {
                await loadComments();
            }
        } catch (err) {
            // Silent fail
        }
    };

    const handleReaction = async (reactionType) => {
        if (!userId) return;
        
        const hasReaction = userReactions.includes(reactionType);
        
        try {
            if (hasReaction) {
                await marthaFetch("remove-reaction", {
                    post_id: postId,
                    user_id: userId,
                    reaction_type: reactionType,
                });
                setUserReactions(prev => prev.filter(r => r !== reactionType));
                setReactions(prev => ({
                    ...prev,
                    [reactionType]: Math.max(0, (prev[reactionType] || 1) - 1)
                }));
            } else {
                await marthaFetch("add-reaction", {
                    post_id: postId,
                    user_id: userId,
                    reaction_type: reactionType,
                });
                setUserReactions(prev => [...prev, reactionType]);
                setReactions(prev => ({
                    ...prev,
                    [reactionType]: (prev[reactionType] || 0) + 1
                }));
            }
        } catch (err) {
            // Silent fail
        }
    };

    const getTotalReactions = () => {
        return Object.values(reactions).reduce((sum, count) => sum + count, 0);
    };

    const handleViewProfile = () => {
        if (userId && userId == post.user_id) {
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Post</Text>

                    <View style={{ width: 28 }} />
                </View>

                <ScrollView style={{ flex: 1 }}>

                    <TouchableOpacity onPress={handleViewProfile} style={styles.userRow}>
                        <Image
                            source={{ uri: post.avatar_url }}
                            style={styles.avatar}
                        />

                        <View>
                            <Text style={styles.username}>
                                {post.firstname} {post.lastname}
                            </Text>
                            <Text style={styles.community}>
                                • {post.community}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {post.image_url && (
                        <Image 
                            source={{ uri: post.image_url }}
                            style={styles.postImage}
                            resizeMode="cover"
                        />
                    )}

                    <Text style={styles.description}>{post.description}</Text>

                    <View style={styles.reactionsSection}>
                        <Text style={styles.sectionTitle}>Reactions {getTotalReactions() > 0 && `(${getTotalReactions()})`}</Text>
                        <View style={styles.reactionsRow}>
                            {REACTION_TYPES.map(({ type, emoji }) => {
                                const isActive = userReactions.includes(type);
                                const count = reactions[type] || 0;
                                return (
                                    <TouchableOpacity 
                                        key={type}
                                        style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
                                        onPress={() => handleReaction(type)}
                                    >
                                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                                        {count > 0 && <Text style={styles.reactionCount}>{count}</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.commentsSection}>
                        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
                        
                        {comments.length === 0 ? (
                            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                        ) : (
                            comments.map((comment) => (
                                <View key={comment.id} style={styles.commentCard}>
                                    <Image 
                                        source={{ uri: comment.avatar_url }} 
                                        style={styles.commentAvatar} 
                                    />
                                    <View style={styles.commentContent}>
                                        <View style={styles.commentHeader}>
                                            <Text style={styles.commentAuthor}>
                                                {comment.firstname} {comment.lastname}
                                            </Text>
                                            {comment.created_at && (
                                                <Text style={styles.commentDate}>
                                                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={styles.commentText}>{comment.content}</Text>
                                    </View>
                                    {userId && userId == comment.user_id && (
                                        <TouchableOpacity 
                                            onPress={() => handleDeleteComment(comment.id)}
                                            style={styles.deleteButton}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        )}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.commentInputContainer}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Write a comment..."
                        placeholderTextColor="#888"
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                        onPress={handleAddComment}
                        disabled={!newComment.trim()}
                    >
                        <Ionicons name="send" size={20} color={newComment.trim() ? "#fff" : "#666"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12
    },
    username: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    community: {
        color: "#BBB",
        fontSize: 13
    },
    postImage: {
        width: "100%",
        height: 280,
        marginBottom: 16,
        backgroundColor: "#222"
    },
    description: {
        color: "white",
        fontSize: 16,
        paddingHorizontal: 16,
        marginBottom: 20,
        lineHeight: 22
    },
    // Reactions
    reactionsSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    reactionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    reactionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2C2C2E",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "transparent",
    },
    reactionButtonActive: {
        borderColor: "#198F8D",
        backgroundColor: "#1a3a39",
    },
    reactionEmoji: {
        fontSize: 20,
    },
    reactionCount: {
        color: "white",
        fontSize: 14,
        marginLeft: 6,
        fontWeight: "600",
    },
    // Comments
    commentsSection: {
        paddingHorizontal: 16,
    },
    noComments: {
        color: "#888",
        fontSize: 14,
        fontStyle: "italic",
    },
    commentCard: {
        flexDirection: "row",
        backgroundColor: "#1C1C1E",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        alignItems: "flex-start",
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentAuthor: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    commentDate: {
        color: "#888",
        fontSize: 11,
    },
    commentText: {
        color: "#DDD",
        fontSize: 14,
        lineHeight: 20,
    },
    deleteButton: {
        padding: 4,
    },
    // Comment Input
    commentInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#1C1C1E",
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    commentInput: {
        flex: 1,
        backgroundColor: "#2C2C2E",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: "white",
        fontSize: 14,
        maxHeight: 80,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: "#198F8D",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#333",
    },
});

import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PublicationScreen({ route, navigation }) {

    const { post } = route.params;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Publication</Text>

                <View style={{ width: 28 }} />
            </View>

            <ScrollView>

                {/* USER INFO */}
                <View style={styles.userRow}>
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
                </View>

                {/* POST IMAGE */}
                {post.image_url && (
                    <Image 
                        source={{ uri: post.image_url }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />
                )}

                {/* DESC */}
                <Text style={styles.description}>{post.description}</Text>

            </ScrollView>
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
        marginBottom: 50,
        lineHeight: 22
    }
});

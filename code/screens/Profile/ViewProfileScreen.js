import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { theme, colors } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import PostCard from "../../components/PostCard";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { marthaFetch, getPostId } from "../../config/api";

export default function ViewProfileScreen({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { user } = route.params;
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    async function loadUserPosts() {
        if (!user) return;
        try {
            const json = await marthaFetch("select-user-posts", { user_id: user.user_id || user.id });
            if (json.success) {
                setUserPosts(json.data || []);
            }
        } catch (err) {}
    }
    if (isFocused && user) {
        loadUserPosts();
    }
  }, [isFocused, user]);

  if (!user) {
    return (
      <SafeAreaView style={theme.screenContainer}>
        <Text style={{ color: "white" }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={theme.screenContainer}>
        <View style={[theme.headerRow, {justifyContent: 'space-between', paddingHorizontal: 20, width: '100%'}]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Profile</Text>
            <View style={{ width: 24 }} />
        </View>

      <ScrollView>
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Image
            source={{ uri: user.avatar_url }}
            style={theme.profileImageLarge}
          />
          <Text style={theme.profileName}>
            {user.firstname} {user.lastname}
          </Text>
        </View>

        <View style={theme.divider} />
        
        <Text style={{ color: colors.gray, textAlign: 'center', marginVertical: 10, fontSize: 16 }}>
          Posts
        </Text>
        
        {userPosts.length === 0 ? (
          <Text style={{ color: colors.gray, textAlign: 'center', marginTop: 20 }}>
            This user hasn't posted anything yet.
          </Text>
        ) : (
          userPosts.map((p) => (
            <PostCard key={getPostId(p) || `post-${Math.random()}`} post={p} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

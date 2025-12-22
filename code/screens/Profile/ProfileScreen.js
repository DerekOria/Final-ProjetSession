import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { theme, colors } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import PostCard from "../../components/PostCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import BottomBar from "../../components/BottomBar";
import { Ionicons } from "@expo/vector-icons";
import { marthaFetch, getPostId } from "../../config/api";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    async function loadUserData() {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    loadUserData();
  }, [isFocused]);

  useEffect(() => {
    async function loadMyPosts() {
        if (!user) return;
        try {
            const json = await marthaFetch("select-user-posts", { user_id: user.id });
            if (json.success) {
                setMyPosts(json.data);
            }
        } catch (err) {}
    }
    if (isFocused && user) {
        loadMyPosts();
    }
  }, [isFocused, user]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
        index: 0,
        routes: [{ name: "Login" }]
    });
  }

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
            <Text style={theme.title}>Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
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
          <Text style={{ color: "grey" }}>{user.career}</Text>
        </View>

        <TouchableOpacity onPress={handleLogout} style={{margin: 20, padding: 10, backgroundColor: 'grey', borderRadius: 5}}>
            <Text style={{color: 'white', textAlign: 'center'}}>Logout</Text>
        </TouchableOpacity>

        <View style={theme.divider} />
        {myPosts.length === 0 ? (
          <Text style={{ color: colors.gray, textAlign: 'center', marginTop: 20 }}>You haven't posted anything yet.</Text>
        ) : (
          myPosts.map((p) => (
            <PostCard key={getPostId(p) || `post-${Math.random()}`} post={p} />
          ))
        )}
      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
}
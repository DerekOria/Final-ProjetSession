import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import PostCard from "../../components/PostCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import BottomBar from "../../components/BottomBar";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";
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
            const res = await fetch(
                "http://martha.jh.shawinigan.info/queries/select-user-posts/execute",
                {
                    method: "POST",
                    headers: {
                        "auth": AUTH,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_id: user.id }),
                }
            );
            const json = await res.json();
            if (json.success) {
                setMyPosts(json.data);
            }
        } catch (err) {
            console.log("❌ Error cargando posts:", err);
        }
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
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
        {myPosts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
}
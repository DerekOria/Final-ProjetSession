import { View, Button, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeIcon from "../../components/CustomBotton";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen(){

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

        <View style={theme.content}>
            <Text style={theme.content}>CONTENT</Text>
        </View>

        <View style={theme.bottomRow}>
            
            <ThemeIcon name="search-outline" onPress={() => navigation.navigate("Recherche") } />
            <ThemeIcon name="headset-outline" onPress={() => navigation.navigate("FocusRoom") } />
            <ThemeIcon name="people" onPress={() => navigation.navigate("Communaute") } />
            <ThemeIcon name="calendar-outline" onPress={() => navigation.navigate("HabitTracker") } />
            <ThemeIcon name="book-outline" onPress={() => navigation.navigate("LockIn") } />
            
        </View>

        </SafeAreaView>
    );

}
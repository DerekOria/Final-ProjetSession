import { View, Button, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";

import ThemeIcon from "../../components/CustomBotton";

export default function HomeScreen(){

    // juste pour tester
    const userImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Imagen por defecto


    return(
        <SafeAreaView style={theme.screenContainer}>

        <View style={theme.headerRow}>
            <TouchableOpacity>
                <Text style={theme.title}>+</Text>
            </TouchableOpacity>
            <Text style={theme.title}> KAEB </Text>
            <TouchableOpacity style={theme.profileButton}>
            <Image
            source={{ uri: userImage }}
            style={theme.profileImage}
            />
            </TouchableOpacity>
        </View>

        <View style={theme.divider}/>

        <View>
            <Text>CONTENT</Text>
        </View>

        <View style={theme.bottomRow}>
            
            <ThemeIcon name="search-outline"/>
            <ThemeIcon name="headset-outline"/>
            <ThemeIcon name="calendar-outline"/>
            <ThemeIcon name="book-outline"/>
            
        </View>

        </SafeAreaView>
    );

}
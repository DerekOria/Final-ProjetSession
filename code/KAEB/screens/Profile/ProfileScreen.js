import { View, Button, Text, TouchableOpacity, Image } from "react-native";
import { theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ThemeIcon from "../../components/CustomBotton";

export default function ProfileScreen(){
    
    const navigation = useNavigation();
    const userImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Imagen por defecto

    return(
        <SafeAreaView style={theme.screenContainer}>
            <View style={theme.profileContainer}>

            <ThemeIcon style={theme.backHome} name="arrow-back-outline" onPress={() => navigation.navigate("Home")} />

            <TouchableOpacity style={theme.profileButtonProfile}>
            <Image
                source={{ uri: userImage }}
                style={theme.profileImage}/>
            </TouchableOpacity>

            <ThemeIcon style={theme.backHome} name="settings-outline"/>
            </View>

        </SafeAreaView>
    );

}
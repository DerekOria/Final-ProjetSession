import { View, Button, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeIcon from "../../components/CustomBotton";
import { useNavigation } from "@react-navigation/native";

export default function RechercheScreen(){

    const navigation = useNavigation();
    
    return(
        <SafeAreaView style={theme.screenContainer}>
            
            <View style={theme.headerOutils}>
                
                <ThemeIcon style={theme.backHome} name="arrow-back-outline" onPress={() => navigation.navigate("Home")} />
                <View style={theme.searchBar}>
                <TextInput
                    style={theme.searchInput}
                    placeholder="Recherche with Kaeb"
                    placeholderTextColor={colors.gray}
                    />
                <ThemeIcon name="search-outline"/>
                </View>
            </View>


        </SafeAreaView>
    );

}
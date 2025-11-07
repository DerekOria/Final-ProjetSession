import { View, Button, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeIcon from "../../components/CustomBotton";
import { useNavigation } from "@react-navigation/native";

export default function HabitTrackerScreen(){

    const navigation = useNavigation();
    
    return(
        <SafeAreaView style={theme.screenContainer}>
            
            <View style={theme.headerOutils}>
                
                
            </View>
            
        </SafeAreaView>
    );

}
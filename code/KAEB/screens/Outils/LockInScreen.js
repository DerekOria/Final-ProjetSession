import { View, Button, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeIcon from "../../components/CustomBotton";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../components/BottomBar";

export default function LockInScreen(){

    const navigation = useNavigation();
    
    return(
        <SafeAreaView style={theme.screenContainer}>
            
            <View style={theme.headerOutils}>
                
                <ThemeIcon style={theme.backHome} name="arrow-back-outline" onPress={() => navigation.navigate("Home")} />
                
            </View>

        <BottomBar />

        </SafeAreaView>
    );

}
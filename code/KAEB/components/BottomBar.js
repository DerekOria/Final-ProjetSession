import { View } from "react-native";
import ThemeIcon from "./CustomBotton";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../config/theme";

export default function BottomBar() {
    const navigation = useNavigation();

    return (
    <View style={theme.bottomRow}>

        <ThemeIcon name="search-outline" onPress={() => navigation.navigate("Recherche")} />
        <ThemeIcon name="headset-outline" onPress={() => navigation.navigate("FocusRoom")} />
        <ThemeIcon name="people-outline" onPress={() => navigation.navigate("Communaute")} />
        <ThemeIcon name="calendar-outline" onPress={() => navigation.navigate("HabitTracker")} />
        <ThemeIcon name="book-outline" onPress={() => navigation.navigate("LockIn")} />

    </View>
    );
}

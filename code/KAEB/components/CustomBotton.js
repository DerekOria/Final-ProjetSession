import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../config/theme";

export default function ThemeIcon({
    name,
    size = 26,
    color = colors.text,
    onPress,
    style,
}) {

    return (

        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.6}
            style={[{ padding: 6 }, style]}>
                <Ionicons name={name} size={name} color={color}/>
        </TouchableOpacity>

    );

}
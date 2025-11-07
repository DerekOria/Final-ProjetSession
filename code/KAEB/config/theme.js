import { StyleSheet } from "react-native";
import { ScreenContainer } from "react-native-screens";


export const colors = {
    background: '#121212',
    primary: '#198F8D',
    card: '#1E1E1E',
    text: '#FFFFFF',
    gray: '#A0A0A0',
    danger: '#D93F3F',
    };

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const fonts = {
    regular: 'System',
    bold: 'System',
    size: {
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 28,
    },
};

export const theme = StyleSheet.create({

    screenContainer: {
        flex: 1,
        position: "relative",
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: 60,
        
    },
    title: {
        textAlign: 'center',
        fontSize: fonts.size.xxl,
        fontWeight: 'bold',
        color: colors.text,
        
    },
    headerRow:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    }, bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        bottom: 15,
        left: 20,
        right: 20,
    }, backHome: {
        bottom: 70,
    },profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: "hidden",
    },profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
    },profileButtonProfile: {
        width: 120,
        height: 120,
        borderRadius: 20,
        overflow: "hidden",
    },profileImageLarge:{
        width: 150,
        height: 150,
        borderRadius:75,
        borderWidth: 3,
    },profileName:{
        color: colors.text,
        fontSize: fonts.size.xxl,
        fontWeight: "bold",
    },profileContainer:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 40,
    },content: {
        flexDirection: "column",
        alignItems: "center",
        color: colors.text,
        fontWeight: "bold",
        fontSize : fonts.size.xxl,
        
    },divider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.15)", 
        width: "100%",
        marginTop: 10,
        marginBottom: 10,
    }
});
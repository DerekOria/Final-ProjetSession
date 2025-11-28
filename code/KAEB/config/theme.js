import { StyleSheet } from "react-native";
import { ScreenContainer, SearchBar } from "react-native-screens";


export const colors = {
    background: '#121212',
    primary: '#198F8D',
    card: '#1E1E1E',
    text: '#FFFFFF',
    yellow: "#D4A017",        // amarillo oscuro elegante
    yellowDark: "#B98C00",    // más oscuro para hover/pressed
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
        
    },headerRow:{

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

    },headerOutils:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 60,
    },bottomRow: {
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
        width: 160,
        height: 160,
        borderRadius: 80,
        overflow: "hidden",
    },profileImageLarge:{
        width: 160,
        height: 160,
        borderRadius:80,
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
    }, searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginVertical: spacing.sm,
        bottom: 70,
        right: 10,
        width: 310,
    }, searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        colors: colors.text,
        fontSize: fonts.size.md,
        
    }, postCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
    },

    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
    },

    postUserImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: spacing.md,
    },

    postUsername: {
        color: colors.text,
        fontSize: fonts.size.lg,
        fontWeight: "bold",
    },

    postSubInfo: {
        color: colors.gray,
        fontSize: fonts.size.sm,
        marginTop: 2,
    },

    postImage: {
        width: "100%",
        height: 220,
        backgroundColor: colors.card,
    },
    postActions: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    postActionButton: {
        marginRight: spacing.lg,
    },
    postDescription: {
        color: colors.text,
        fontSize: fonts.size.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    }, input: {
        color: colors.text,
        fontSize: fonts.size.lg,
        alignItems: "center"
    },   registerBox: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: 25,
        paddingTop: 35,
        boxShadow: "0px 4px 14px rgba(0,0,0,0.45)",
        alignItems: "center",
    },

    input: {
        width: "100%",
        height: 48,
        backgroundColor: "#222",
        borderRadius: 12,
        paddingHorizontal: 14,
        marginTop: 12,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 16,
    },

    
    birthRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginTop: 10,
    },

    
    birthPicker: {
        flex: 1,
        height: 48,
        backgroundColor: "#222",
        borderRadius: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
    },

    button: {
        width: "100%",
        backgroundColor: colors.yellow,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 18,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    
    buttonText: {
        color: "#000",
        fontSize: 17,
        fontWeight: "700",
    
    }, link : {
        marginTop: 14,
        color: colors.yellow,
        fontSize: 15,
    }
});
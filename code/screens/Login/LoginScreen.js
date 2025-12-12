import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme, colors } from "../../config/theme";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { marthaFetch } from "../../config/api";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const validateFields = () => {
        if (!email || !password) {
            setError("Please fill in all fields.");
            return false;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            setError("Invalid email address.");
            return false;
        }

        if (password.length < 4) {
            setError("Password must be at least 4 characters.");
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        setError("");
        if (!validateFields()) return;

        const response = await marthaFetch("login-user", {
            email: email,
            password: password
        });

        if (response.success && response.data.length > 0) {
            const user = response.data[0];

            await AsyncStorage.setItem("user", JSON.stringify(user));
            await AsyncStorage.setItem("user_id", String(user.id));

            navigation.reset({
                index: 0,
                routes: [{ name: "Home" }]
            });
        } else {
            setError("Invalid email or password.");
        }
    };

    return (
        <SafeAreaView style={[theme.screenContainer, { justifyContent: "center" }]}>
            <View style={{ alignItems: "center", width: "100%" }}>

                <Text style={[theme.title, { marginBottom: 40 }]}>KAEB</Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666"
                    style={theme.input}
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    secureTextEntry
                    style={theme.input}
                    value={password}
                    onChangeText={setPassword}
                />

                {error !== "" && (
                    <Text style={{ color: colors.danger, marginTop: 8 }}>{error}</Text>
                )}

                <TouchableOpacity style={theme.button} onPress={handleLogin}>
                    <Text style={theme.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ marginTop: 20 }}
                    onPress={() => navigation.navigate("Register")}
                >
                    <Text style={{ color: colors.primary }}>Create an account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

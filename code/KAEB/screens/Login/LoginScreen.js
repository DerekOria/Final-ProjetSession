import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme, colors } from "../../config/theme";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

    const handleLogin = async () => {
        const response = await fetch("http://martha.jh.shawinigan.info/queries/login-user/execute", {
            method: "POST",
            headers: {
                "auth": AUTH,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }).then(r => r.json());

        console.log(response);

        if (response.success && response.data.length > 0) {
            const user = response.data[0];

            await AsyncStorage.setItem("user", JSON.stringify(user));
            await AsyncStorage.setItem("user_id", String(user.id));

            navigation.reset({
                index: 0,
                routes: [{ name: "Home" }]
            });
        } else {
            setMessage("Email o contraseña inválida.");
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
                    placeholder="Contraseña"
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
                    <Text style={theme.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ marginTop: 20 }}
                    onPress={() => navigation.navigate("Register")}
                >
                    <Text style={{ color: colors.primary }}>Crear cuenta</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { theme } from "../../config/theme";

export default function RegisterScreen({ navigation }) {

    const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [career, setCareer] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");

    // Birthdate
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 76 }, (_, i) => 1950 + i);

    // ---------------------------
    // VALIDACIONES
    // ---------------------------
    const validate = () => {

        if (!firstname.trim()) return "Prénom obligatoire.";
        if (!lastname.trim()) return "Nom obligatoire.";

        if (!day || !month || !year) return "Date de naissance invalide.";

        if (!career) return "Veuillez choisir une carrière.";

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) return "Email invalide.";

        if (password.length < 6)
            return "Le mot de passe doit contenir au moins 6 caractères.";

        if (password !== confirm)
            return "Les mots de passe ne correspondent pas.";

        return null; // No errors
    };

    // ---------------------------
    // REGISTER
    // ---------------------------
    const handleRegister = async () => {

        const error = validate();
        if (error) {
            setMessage(error);
            return;
        }

        const birthdate = `${year}-${String(month).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;

        const response = await fetch(
            "http://martha.jh.shawinigan.info/queries/register-user/execute",
            {
                method: "POST",
                headers: {
                    auth: AUTH,
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    birthdate,
                    career,
                    email,
                    password,
                    avatar_url:
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }),
            }
        ).then((r) => r.json());

        if (response.success) {
            navigation.replace("Login");
        } else {
            setMessage("Erreur lors de la création du compte.");
        }
    };

    return (
        <SafeAreaView style={[theme.screenContainer, { justifyContent: "center" }]}>
            <View style={{ alignItems: "center", width: "100%" }}>

                <View style={theme.registerBox}>
                    <Text style={theme.title}>Register</Text>

                    {message ? (
                        <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                            {message}
                        </Text>
                    ) : null}

                    <TextInput
                        placeholder="Prénom"
                        placeholderTextColor="#999"
                        style={theme.input}
                        value={firstname}
                        onChangeText={setFirstname}
                    />

                    <TextInput
                        placeholder="Nom"
                        placeholderTextColor="#999"
                        style={theme.input}
                        value={lastname}
                        onChangeText={setLastname}
                    />

                    <Text style={{ color: "#fff", marginTop: 10 }}>Date de naissance</Text>

                    <View style={theme.birthRow}>
                        <Picker
                            selectedValue={day}
                            onValueChange={setDay}
                            style={theme.birthPicker}
                            dropdownIconColor="#fff"
                        >
                            <Picker.Item label="Jour" value="" />
                            {days.map((d) => (
                                <Picker.Item key={d} label={String(d)} value={d} />
                            ))}
                        </Picker>

                        <Picker
                            selectedValue={month}
                            onValueChange={setMonth}
                            style={theme.birthPicker}
                            dropdownIconColor="#fff"
                        >
                            <Picker.Item label="Mois" value="" />
                            {months.map((m) => (
                                <Picker.Item key={m} label={String(m)} value={m} />
                            ))}
                        </Picker>

                        <Picker
                            selectedValue={year}
                            onValueChange={setYear}
                            style={theme.birthPicker}
                            dropdownIconColor="#fff"
                        >
                            <Picker.Item label="Année" value="" />
                            {years.map((y) => (
                                <Picker.Item key={y} label={String(y)} value={y} />
                            ))}
                        </Picker>
                    </View>

                    {/* Picker for career */}
                    <Picker
                        selectedValue={career}
                        onValueChange={(v) => setCareer(v)}
                        style={[theme.input, { height: 50 }]}
                        dropdownIconColor="#fff"
                    >
                        <Picker.Item label="Choisir une carrière" value="" />
                        <Picker.Item label="Informatique" value="Informatique" />
                        <Picker.Item label="Mathématiques" value="Mathématiques" />
                        <Picker.Item label="Sciences" value="Sciences" />
                        <Picker.Item label="Santé" value="Santé" />
                        <Picker.Item label="Administration" value="Administration" />
                        <Picker.Item label="Génie" value="Génie" />
                        <Picker.Item label="Arts" value="Arts" />
                        <Picker.Item label="Éducation" value="Éducation" />
                        <Picker.Item label="Langues" value="Langues" />
                        <Picker.Item label="Autres" value="Autres" />
                    </Picker>

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#999"
                        style={theme.input}
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        placeholder="Mot de Passe"
                        placeholderTextColor="#999"
                        style={theme.input}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TextInput
                        placeholder="Confirmer Mot de Passe"
                        placeholderTextColor="#999"
                        style={theme.input}
                        secureTextEntry
                        value={confirm}
                        onChangeText={setConfirm}
                    />

                    <TouchableOpacity style={theme.button} onPress={handleRegister}>
                        <Text style={theme.buttonText}>Créer mon compte</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={theme.link}>J'ai déjà un compte</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { theme } from "../../config/theme";
import { marthaFetch, urlToBase64 } from "../../config/api";

export default function RegisterScreen({ navigation }) {

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

    const validate = () => {

        if (!firstname.trim()) return "First name is required.";
        if (!lastname.trim()) return "Last name is required.";

        if (!day || !month || !year) return "Invalid date of birth.";

        if (!career) return "Please select a career.";

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) return "Invalid email.";

        if (password.length < 6)
            return "Password must be at least 6 characters.";

        if (password !== confirm)
            return "Passwords do not match.";

        return null; // No errors
    };

    const handleRegister = async () => {

        const error = validate();
        if (error) {
            setMessage(error);
            return;
        }

        const birthdate = `${year}-${String(month).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;

        // Convert default avatar to Base64
        const defaultAvatarUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        const avatarBase64 = await urlToBase64(defaultAvatarUrl);

        const response = await marthaFetch("register-user", {
            firstname,
            lastname,
            birthdate,
            career,
            email,
            password,
            avatar_url: avatarBase64,
        });

        if (response.success) {
            navigation.replace("Login");
        } else {
            setMessage("Error creating account.");
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
                        placeholder="First Name"
                        placeholderTextColor="#999"
                        style={theme.input}
                        value={firstname}
                        onChangeText={setFirstname}
                    />

                    <TextInput
                        placeholder="Last Name"
                        placeholderTextColor="#999"
                        style={theme.input}
                        value={lastname}
                        onChangeText={setLastname}
                    />

                    <Text style={{ color: "#fff", marginTop: 10 }}>Date of Birth</Text>

                    <View style={theme.birthRow}>
                        <Picker
                            selectedValue={day}
                            onValueChange={setDay}
                            style={theme.birthPicker}
                            dropdownIconColor="#fff"
                        >
                            <Picker.Item label="Day" value="" />
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
                            <Picker.Item label="Month" value="" />
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
                            <Picker.Item label="Year" value="" />
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
                        <Picker.Item label="Select a career" value="" />
                        <Picker.Item label="Computer Science" value="Computer Science" />
                        <Picker.Item label="Mathematics" value="Mathematics" />
                        <Picker.Item label="Sciences" value="Sciences" />
                        <Picker.Item label="Health" value="Health" />
                        <Picker.Item label="Business" value="Business" />
                        <Picker.Item label="Engineering" value="Engineering" />
                        <Picker.Item label="Arts" value="Arts" />
                        <Picker.Item label="Education" value="Education" />
                        <Picker.Item label="Languages" value="Languages" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#999"
                        style={theme.input}
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#999"
                        style={theme.input}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        style={theme.input}
                        secureTextEntry
                        value={confirm}
                        onChangeText={setConfirm}
                    />

                    <TouchableOpacity style={theme.button} onPress={handleRegister}>
                        <Text style={theme.buttonText}>Create Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={theme.link}>Already have an account</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}

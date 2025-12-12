import { View, Text, StyleSheet, TouchableOpacity, Animated, AppState } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, theme } from "../../config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import BottomBar from "../../components/BottomBar";
import { useState, useEffect, useRef } from "react";

const TIME_OPTIONS = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '90 min', value: 90 },
];

export default function LockInScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    
    const [selectedMinutes, setSelectedMinutes] = useState(30);
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [failed, setFailed] = useState(false);
    const [completed, setCompleted] = useState(false);
    
    const lockAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const confettiAnim = useRef(new Animated.Value(0)).current;
    const appState = useRef(AppState.currentState);
    const wasRunning = useRef(false);

    // track if user leaves app
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (wasRunning.current && nextAppState !== 'active') {
                // user left the app while timer was running
                setIsRunning(false);
                setFailed(true);
                wasRunning.current = false;
                triggerShake();
            }
            appState.current = nextAppState;
        });

        return () => subscription?.remove();
    }, []);

    // track if user switches tabs
    useEffect(() => {
        if (!isFocused && isRunning) {
            setIsRunning(false);
            setFailed(true);
            wasRunning.current = false;
            triggerShake();
        }
    }, [isFocused]);

    // timer countdown
    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            wasRunning.current = true;
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            setIsRunning(false);
            setCompleted(true);
            wasRunning.current = false;
            triggerConfetti();
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const triggerConfetti = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(confettiAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(confettiAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
            { iterations: 5 }
        ).start();
    };

    const handleStart = () => {
        setFailed(false);
        setCompleted(false);
        setTimeLeft(selectedMinutes * 60);
        
        // animate lock closing
        Animated.timing(lockAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start(() => {
            setIsRunning(true);
        });
    };

    const handleReset = () => {
        setIsRunning(false);
        setFailed(false);
        setCompleted(false);
        setTimeLeft(selectedMinutes * 60);
        wasRunning.current = false;
        
        Animated.timing(lockAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const lockRotation = lockAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const lockScale = lockAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.3, 1],
    });

    // confetti pieces
    const renderConfetti = () => {
        const pieces = [];
        const emojis = ['🎉', '🎊', '✨', '⭐', '🌟', '💪', '🔥'];
        for (let i = 0; i < 20; i++) {
            const left = Math.random() * 100;
            const delay = Math.random() * 1000;
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            pieces.push(
                <Animated.Text
                    key={i}
                    style={[
                        styles.confettiPiece,
                        {
                            left: `${left}%`,
                            opacity: confettiAnim,
                            transform: [{
                                translateY: confettiAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-50, 400],
                                })
                            }]
                        }
                    ]}
                >
                    {emoji}
                </Animated.Text>
            );
        }
        return pieces;
    };

    // failed state
    if (failed) {
        return (
            <SafeAreaView style={[theme.screenContainer, styles.container]}>
                <Animated.View style={[styles.failedContainer, { transform: [{ translateX: shakeAnim }] }]}>
                    <Text style={styles.failedEmoji}>😔</Text>
                    <Text style={styles.failedTitle}>You Lost!</Text>
                    <Text style={styles.failedSubtitle}>You left the Lock In screen.</Text>
                    <Text style={styles.failedMessage}>
                        Stay on this screen to complete your focus session.
                    </Text>
                    <TouchableOpacity style={styles.tryAgainButton} onPress={handleReset}>
                        <Text style={styles.tryAgainText}>Try Again</Text>
                    </TouchableOpacity>
                </Animated.View>
                <BottomBar />
            </SafeAreaView>
        );
    }

    // completed state
    if (completed) {
        return (
            <SafeAreaView style={[theme.screenContainer, styles.container]}>
                {renderConfetti()}
                <View style={styles.completedContainer}>
                    <Text style={styles.completedEmoji}>🏆</Text>
                    <Text style={styles.completedTitle}>Great Job!</Text>
                    <Text style={styles.completedSubtitle}>
                        You stayed focused for {selectedMinutes} minutes!
                    </Text>
                    <Text style={styles.completedMessage}>
                        Keep building that discipline 💪
                    </Text>
                    <TouchableOpacity style={styles.doneButton} onPress={handleReset}>
                        <Text style={styles.doneButtonText}>Start Another Session</Text>
                    </TouchableOpacity>
                </View>
                <BottomBar />
            </SafeAreaView>
        );
    }

    // timer running state
    if (isRunning) {
        return (
            <SafeAreaView style={[theme.screenContainer, styles.container]}>
                <View style={styles.header}>
                    <Animated.View style={{ transform: [{ rotate: lockRotation }, { scale: lockScale }] }}>
                        <Ionicons name="lock-closed" size={50} color={colors.primary} />
                    </Animated.View>
                    <Text style={styles.title}>Locked In</Text>
                    <Text style={styles.runningSubtitle}>Don't leave this screen!</Text>
                </View>

                <View style={styles.timerContainerActive}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>

                <View style={styles.warningBox}>
                    <Ionicons name="warning" size={20} color="#FFB800" />
                    <Text style={styles.warningText}>
                        Leaving this screen or the app will end your session
                    </Text>
                </View>

                <TouchableOpacity style={styles.cancelButton} onPress={handleReset}>
                    <Text style={styles.cancelButtonText}>Give Up</Text>
                </TouchableOpacity>

                <BottomBar />
            </SafeAreaView>
        );
    }

    // default setup state
    return (
        <SafeAreaView style={[theme.screenContainer, styles.container]}>
            <View style={styles.header}>
                <Animated.View style={{ transform: [{ rotate: lockRotation }, { scale: lockScale }] }}>
                    <Ionicons name="lock-open" size={50} color={colors.primary} />
                </Animated.View>
                <Text style={styles.title}>Lock In Mode</Text>
                <Text style={styles.subtitle}>Choose your focus duration</Text>
            </View>

            <View style={styles.timeSelector}>
                {TIME_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.timeOption,
                            selectedMinutes === option.value && styles.timeOptionSelected
                        ]}
                        onPress={() => {
                            setSelectedMinutes(option.value);
                            setTimeLeft(option.value * 60);
                        }}
                    >
                        <Text style={[
                            styles.timeOptionText,
                            selectedMinutes === option.value && styles.timeOptionTextSelected
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                <Ionicons name="lock-closed" size={24} color="white" />
                <Text style={styles.startButtonText}>Start Lock In</Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>
                Once started, you must stay on this screen until the timer ends.
            </Text>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000000',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
    },
    subtitle: {
        color: colors.gray,
        fontSize: 16,
        marginTop: 8,
    },
    runningSubtitle: {
        color: '#FFB800',
        fontSize: 16,
        marginTop: 8,
        fontWeight: '600',
    },
    timeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    timeOption: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
    },
    timeOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeOptionText: {
        color: colors.gray,
        fontSize: 14,
        fontWeight: '600',
    },
    timeOptionTextSelected: {
        color: 'white',
    },
    timerContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 30,
        marginVertical: 20,
        borderWidth: 2,
        borderColor: '#333',
    },
    timerContainerActive: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 40,
        marginVertical: 30,
        borderWidth: 3,
        borderColor: colors.primary,
    },
    timerText: {
        color: colors.text,
        fontSize: 64,
        fontWeight: '200',
        fontVariant: ['tabular-nums'],
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 10,
        marginTop: 10,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoText: {
        color: '#666',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 40,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2000',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 10,
        marginHorizontal: 20,
    },
    warningText: {
        color: '#FFB800',
        fontSize: 13,
        flex: 1,
    },
    cancelButton: {
        marginTop: 30,
        paddingHorizontal: 30,
        paddingVertical: 12,
    },
    cancelButtonText: {
        color: colors.danger,
        fontSize: 16,
    },
    failedContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 100,
    },
    failedEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    failedTitle: {
        color: colors.danger,
        fontSize: 36,
        fontWeight: 'bold',
    },
    failedSubtitle: {
        color: colors.text,
        fontSize: 18,
        marginTop: 10,
    },
    failedMessage: {
        color: colors.gray,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 40,
    },
    tryAgainButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 40,
    },
    tryAgainText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    completedContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 100,
    },
    completedEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    completedTitle: {
        color: colors.primary,
        fontSize: 36,
        fontWeight: 'bold',
    },
    completedSubtitle: {
        color: colors.text,
        fontSize: 18,
        marginTop: 10,
    },
    completedMessage: {
        color: colors.gray,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    doneButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 40,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    confettiPiece: {
        position: 'absolute',
        fontSize: 24,
        top: 0,
    },
});
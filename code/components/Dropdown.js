import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../config/theme";

export default function Dropdown({ 
    options = [], 
    selectedValue, 
    onSelect, 
    placeholder = "Select an option",
    labelKey = "label",
    valueKey = "value"
}) {
    const [modalVisible, setModalVisible] = useState(false);

    const getSelectedLabel = () => {
        const selected = options.find(opt => {
            const optValue = typeof opt === 'object' ? opt[valueKey] : opt;
            return optValue === selectedValue;
        });
        if (selected) {
            return typeof selected === 'object' ? selected[labelKey] : selected;
        }
        return placeholder;
    };

    const handleSelect = (option) => {
        const value = typeof option === 'object' ? option[valueKey] : option;
        onSelect(value);
        setModalVisible(false);
    };

    return (
        <View>
            <TouchableOpacity 
                style={styles.selector} 
                onPress={() => setModalVisible(true)}
            >
                <Text style={[
                    styles.selectorText,
                    selectedValue === null && styles.placeholderText
                ]}>
                    {getSelectedLabel()}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.gray} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{placeholder}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={options}
                            keyExtractor={(item, index) => {
                                const value = typeof item === 'object' ? item[valueKey] : item;
                                return value?.toString() || index.toString();
                            }}
                            renderItem={({ item }) => {
                                const value = typeof item === 'object' ? item[valueKey] : item;
                                const label = typeof item === 'object' ? item[labelKey] : item;
                                const isSelected = value === selectedValue;
                                
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.option,
                                            isSelected && styles.optionSelected
                                        ]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            isSelected && styles.optionTextSelected
                                        ]}>
                                            {label}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    selector: {
        backgroundColor: '#2C2C2E',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
        marginVertical: 8,
    },
    selectorText: {
        color: 'white',
        fontSize: 16,
    },
    placeholderText: {
        color: '#888',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    modalContent: {
        backgroundColor: '#1C1C1E',
        borderRadius: 14,
        maxHeight: '60%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    optionSelected: {
        backgroundColor: '#2C2C2E',
    },
    optionText: {
        color: 'white',
        fontSize: 16,
    },
    optionTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
});

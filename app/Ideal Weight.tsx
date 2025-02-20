import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const IdealWeightCalculator = () => {
    const [height, setHeight] = useState('');
    const [heightInch, setHeightInch] = useState('');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [idealWeight, setIdealWeight] = useState<number | null>(null);

    useEffect(() => {
        loadSavedValues();
    }, []);

    const loadSavedValues = async () => {
        try {
            const savedHeight = await AsyncStorage.getItem('idealWeight_height');
            const savedHeightInch = await AsyncStorage.getItem('idealWeight_heightInch');
            const savedHeightUnit = await AsyncStorage.getItem('idealWeight_heightUnit');
            const savedGender = await AsyncStorage.getItem('idealWeight_gender');

            if (savedHeight) setHeight(savedHeight);
            if (savedHeightInch) setHeightInch(savedHeightInch);
            if (savedHeightUnit) setHeightUnit(savedHeightUnit as 'cm' | 'ft');
            if (savedGender) setGender(savedGender as 'male' | 'female');
        } catch (error) {
            console.error('Error loading saved values:', error);
        }
    };

    const saveValue = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(`idealWeight_${key}`, value);
        } catch (error) {
            console.error('Error saving value:', error);
        }
    };

    const handleHeightChange = (value: string) => {
        setHeight(value);
        saveValue('height', value);
        calculateIdealWeight(value, heightInch, heightUnit, gender);
    };

    const handleHeightInchChange = (value: string) => {
        setHeightInch(value);
        saveValue('heightInch', value);
        calculateIdealWeight(height, value, heightUnit, gender);
    };

    const handleHeightUnitChange = (value: 'cm' | 'ft') => {
        setHeightUnit(value);
        saveValue('heightUnit', value);
        calculateIdealWeight(height, heightInch, value, gender);
    };

    const handleGenderChange = (value: 'male' | 'female') => {
        setGender(value);
        saveValue('gender', value);
        calculateIdealWeight(height, heightInch, heightUnit, value);
    };

    const calculateIdealWeight = (height: string, heightInch: string, unit: 'cm' | 'ft', gender: 'male' | 'female') => {
        let heightInCm: number;

        if (unit === 'cm') {
            heightInCm = parseFloat(height) || 0;
        } else {
            const feet = parseFloat(height) || 0;
            const inches = parseFloat(heightInch) || 0;
            heightInCm = (feet * 30.48) + (inches * 2.54);
        }

        if (heightInCm <= 0) {
            setIdealWeight(null);
            return;
        }

        // Convert height to meters for BMI formula
        const heightInMeters = heightInCm / 100;

        // Using BMI formula with normal BMI range midpoint (21.7)
        // Normal BMI range is 18.5-24.9, taking midpoint as ideal
        const idealBMI = gender === 'male' ? 22 : 21.4;
        const calculatedWeight = idealBMI * (heightInMeters * heightInMeters);

        setIdealWeight(Math.round(calculatedWeight * 10) / 10);
    };

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4CAF50', '#2196F3']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Text style={styles.title}>Ideal Weight Calculator</Text>

                <View style={styles.card}>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputHeader}>
                                <Text style={styles.inputLabel}>Height</Text>
                                <View style={styles.unitToggle}>
                                    <Pressable
                                        style={[styles.unitButton, heightUnit === 'cm' && styles.activeUnit]}
                                        onPress={() => handleHeightUnitChange('cm')}>
                                        <Text style={[styles.buttonText, heightUnit === 'cm' && styles.activeButtonText]}>
                                            cm
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.unitButton, heightUnit === 'ft' && styles.activeUnit]}
                                        onPress={() => handleHeightUnitChange('ft')}>
                                        <Text style={[styles.buttonText, heightUnit === 'ft' && styles.activeButtonText]}>
                                            ft
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {heightUnit === 'cm' ? (
                                <TextInput
                                    style={[styles.input, styles.enhancedInput]}
                                    placeholder="Enter height in cm"
                                    value={height}
                                    onChangeText={handleHeightChange}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                            ) : (
                                <View style={styles.imperialHeight}>
                                    <View style={styles.feetInputContainer}>
                                        <TextInput
                                            style={[styles.input, styles.enhancedInput, styles.feetInput]}
                                            placeholder="ft"
                                            value={height}
                                            onChangeText={handleHeightChange}
                                            keyboardType="numeric"
                                            placeholderTextColor="#999"
                                        />
                                        <Text style={styles.unitText}>ft</Text>
                                    </View>
                                    <View style={styles.inchInputContainer}>
                                        <TextInput
                                            style={[styles.input, styles.enhancedInput, styles.inchInput]}
                                            placeholder="in"
                                            value={heightInch}
                                            onChangeText={handleHeightInchChange}
                                            keyboardType="numeric"
                                            placeholderTextColor="#999"
                                        />
                                        <Text style={styles.unitText}>in</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Gender</Text>
                            <View style={styles.genderToggle}>
                                <Pressable
                                    style={[styles.genderButton, gender === 'male' && styles.activeGender]}
                                    onPress={() => handleGenderChange('male')}>
                                    <Text style={[styles.buttonText, gender === 'male' && styles.activeButtonText]}>
                                        Male
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.genderButton, gender === 'female' && styles.activeGender]}
                                    onPress={() => handleGenderChange('female')}>
                                    <Text style={[styles.buttonText, gender === 'female' && styles.activeButtonText]}>
                                        Female
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>

                {idealWeight !== null && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>Your Ideal Weight</Text>
                        <Text style={styles.idealWeightValue}>
                            {idealWeight} kg
                        </Text>
                        <Text style={styles.idealWeightLb}>
                            {Math.round(idealWeight * 2.20462 * 10) / 10} lb
                        </Text>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>About the calculation</Text>
                            <Text style={styles.infoText}>
                                This calculator uses the BMI formula to determine ideal weight based on height and gender. For females, it uses a BMI of 21.4 and for males 22.0 as the ideal reference point. The result provides a general guideline and may not account for individual factors such as body composition, age, and overall health.
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: Dimensions.get('window').height * 0.3,
        opacity: 0.15,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 24,
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 24,
    },
    inputContainer: {
        gap: 24,
    },
    inputWrapper: {
        gap: 8,
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    unitToggle: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#f5f5f5',
        padding: 4,
        borderRadius: 12,
    },
    genderToggle: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#f5f5f5',
        padding: 4,
        borderRadius: 12,
    },
    unitButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    genderButton: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeUnit: {
        backgroundColor: '#0a7ea4',
    },
    activeGender: {
        backgroundColor: '#0a7ea4',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeButtonText: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    enhancedInput: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imperialHeight: {
        flexDirection: 'row',
        gap: 12,
    },
    feetInputContainer: {
        flex: 1,
        position: 'relative',
    },
    inchInputContainer: {
        flex: 1,
        position: 'relative',
    },
    feetInput: {
        paddingRight: 40,
    },
    inchInput: {
        paddingRight: 40,
    },
    unitText: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -8 }],
        color: '#666',
        fontSize: 14,
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    idealWeightValue: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#0a7ea4',
        marginBottom: 8,
        letterSpacing: -1,
    },
    idealWeightLb: {
        fontSize: 24,
        color: '#666',
        marginBottom: 32,
    },
    infoContainer: {
        padding: 24,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        width: '100%',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
});

export default IdealWeightCalculator;

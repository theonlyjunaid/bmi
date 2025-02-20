import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BodyFatCalculator = () => {
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [waistCircumference, setWaistCircumference] = useState('');
    const [waistCircumferenceUnit, setWaistCircumferenceUnit] = useState<'cm' | 'in'>('cm');
    const [height, setHeight] = useState('');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
    const [neckCircumference, setNeckCircumference] = useState('');
    const [neckCircumferenceUnit, setNeckCircumferenceUnit] = useState<'cm' | 'in'>('cm');
    const [hipCircumference, setHipCircumference] = useState('');
    const [hipCircumferenceUnit, setHipCircumferenceUnit] = useState<'cm' | 'in'>('cm');

    const [bodyFat, setBodyFat] = useState<number | null>(null);
    const [fatMass, setFatMass] = useState<number | null>(null);
    const [leanMass, setLeanMass] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSavedValues();
    }, []);

    const loadSavedValues = async () => {
        try {
            const values = await Promise.all([
                AsyncStorage.getItem('weight'),
                AsyncStorage.getItem('weightUnit'),
                AsyncStorage.getItem('age'),
                AsyncStorage.getItem('gender'),
                AsyncStorage.getItem('waistCircumference'),
                AsyncStorage.getItem('waistCircumferenceUnit'),
                AsyncStorage.getItem('height'),
                AsyncStorage.getItem('heightUnit'),
                AsyncStorage.getItem('neckCircumference'),
                AsyncStorage.getItem('neckCircumferenceUnit'),
                AsyncStorage.getItem('hipCircumference'),
                AsyncStorage.getItem('hipCircumferenceUnit')
            ]);

            const [
                savedWeight,
                savedWeightUnit,
                savedAge,
                savedGender,
                savedWaistCircumference,
                savedWaistCircumferenceUnit,
                savedHeight,
                savedHeightUnit,
                savedNeckCircumference,
                savedNeckCircumferenceUnit,
                savedHipCircumference,
                savedHipCircumferenceUnit
            ] = values;

            if (savedWeight) setWeight(savedWeight);
            if (savedWeightUnit) setWeightUnit(savedWeightUnit as 'kg' | 'lb');
            if (savedAge) setAge(savedAge);
            if (savedGender) setGender(savedGender as 'male' | 'female');
            if (savedWaistCircumference) setWaistCircumference(savedWaistCircumference);
            if (savedWaistCircumferenceUnit) setWaistCircumferenceUnit(savedWaistCircumferenceUnit as 'cm' | 'in');
            if (savedHeight) setHeight(savedHeight);
            if (savedHeightUnit) setHeightUnit(savedHeightUnit as 'cm' | 'in');
            if (savedNeckCircumference) setNeckCircumference(savedNeckCircumference);
            if (savedNeckCircumferenceUnit) setNeckCircumferenceUnit(savedNeckCircumferenceUnit as 'cm' | 'in');
            if (savedHipCircumference) setHipCircumference(savedHipCircumference);
            if (savedHipCircumferenceUnit) setHipCircumferenceUnit(savedHipCircumferenceUnit as 'cm' | 'in');
        } catch (error) {
            console.error('Error loading saved values:', error);
        }
    };

    const saveValue = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving value:', error);
        }
    };

    const handleInputChange = (setter: (value: string) => void, key: string) => (value: string) => {
        setter(value);
        saveValue(key, value);
    };

    const handleUnitChange = (setter: (value: any) => void, key: string) => (value: any) => {
        setter(value);
        saveValue(key, value);
    };

    const calculateBodyFat = async () => {
        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            let weightInKg = convertToMetric(weight, weightUnit, 0.453592);
            let waistInCm = convertToMetric(waistCircumference, waistCircumferenceUnit, 2.54);
            let heightInCm = convertToMetric(height, heightUnit, 2.54);
            let neckInCm = convertToMetric(neckCircumference, neckCircumferenceUnit, 2.54);
            let hipInCm = gender === 'female' ? convertToMetric(hipCircumference, hipCircumferenceUnit, 2.54) : 0;

            let bodyFatPercentage = calculateBodyFatPercentage(waistInCm, neckInCm, heightInCm, hipInCm);
            let fatMassValue = (bodyFatPercentage / 100) * weightInKg;
            let leanMassValue = weightInKg - fatMassValue;

            setBodyFat(Number(bodyFatPercentage.toFixed(2)));
            setFatMass(Number(fatMassValue.toFixed(2)));
            setLeanMass(Number(leanMassValue.toFixed(2)));
        } catch (error) {
            console.error('Calculation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateInputs = () => {
        const requiredInputs = [
            weight, waistCircumference, height, neckCircumference,
            ...(gender === 'female' ? [hipCircumference] : [])
        ];
        return requiredInputs.every(input => input && !isNaN(Number(input)));
    };

    const convertToMetric = (value: string, unit: string, conversionFactor: number) => {
        const numValue = parseFloat(value);
        return unit === 'cm' || unit === 'kg' ? numValue : numValue * conversionFactor;
    };

    const calculateBodyFatPercentage = (waist: number, neck: number, height: number, hip: number) => {
        if (gender === 'male') {
            return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
        }
        return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    };

    const getBodyFatCategory = (bf: number) => {
        if (gender === 'male') {
            if (bf < 6) return { label: 'Essential Fat', color: '#FF9800' };
            if (bf < 14) return { label: 'Athletes', color: '#4CAF50' };
            if (bf < 18) return { label: 'Fitness', color: '#8BC34A' };
            if (bf < 25) return { label: 'Average', color: '#FFC107' };
            return { label: 'Obese', color: '#F44336' };
        } else {
            if (bf < 14) return { label: 'Essential Fat', color: '#FF9800' };
            if (bf < 21) return { label: 'Athletes', color: '#4CAF50' };
            if (bf < 25) return { label: 'Fitness', color: '#8BC34A' };
            if (bf < 32) return { label: 'Average', color: '#FFC107' };
            return { label: 'Obese', color: '#F44336' };
        }
    };

    const renderInput = (
        label: string,
        value: string,
        onChangeText: (value: string) => void,
        unit?: { current: string, options: string[], onChange: (value: any) => void },
        placeholder?: string
    ) => (
        <View style={styles.inputWrapper}>
            <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>{label}</Text>
                {unit && (
                    <View style={styles.unitToggle}>
                        {unit.options.map((option) => (
                            <Pressable
                                key={option}
                                style={[styles.unitButton, unit.current === option && styles.activeUnit]}
                                onPress={() => unit.onChange(option)}>
                                <Text style={[styles.buttonText, unit.current === option && styles.activeButtonText]}>
                                    {option}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
            <TextInput
                style={[styles.input, styles.enhancedInput]}
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                value={value}
                onChangeText={onChangeText}
                keyboardType="numeric"
                placeholderTextColor="#999"
            />
        </View>
    );

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4CAF50', '#2196F3']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Text style={styles.title}>Body Fat Calculator</Text>

                <View style={styles.card}>
                    <View style={styles.genderSelector}>
                        <Pressable
                            style={[styles.genderButton, gender === 'male' && styles.activeGender]}
                            onPress={() => handleUnitChange(setGender, 'gender')('male')}>
                            <MaterialCommunityIcons
                                name="gender-male"
                                size={24}
                                color={gender === 'male' ? '#fff' : '#666'}
                            />
                            <Text style={[styles.genderText, gender === 'male' && styles.activeGenderText]}>
                                Male
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.genderButton, gender === 'female' && styles.activeGender]}
                            onPress={() => handleUnitChange(setGender, 'gender')('female')}>
                            <MaterialCommunityIcons
                                name="gender-female"
                                size={24}
                                color={gender === 'female' ? '#fff' : '#666'}
                            />
                            <Text style={[styles.genderText, gender === 'female' && styles.activeGenderText]}>
                                Female
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.inputContainer}>
                        {renderInput('Age', age, handleInputChange(setAge, 'age'))}
                        {renderInput('Weight', weight, handleInputChange(setWeight, 'weight'), {
                            current: weightUnit,
                            options: ['kg', 'lb'],
                            onChange: handleUnitChange(setWeightUnit, 'weightUnit')
                        })}
                        {renderInput('Height', height, handleInputChange(setHeight, 'height'), {
                            current: heightUnit,
                            options: ['cm', 'in'],
                            onChange: handleUnitChange(setHeightUnit, 'heightUnit')
                        })}
                        {renderInput('Neck Circumference', neckCircumference,
                            handleInputChange(setNeckCircumference, 'neckCircumference'), {
                            current: neckCircumferenceUnit,
                            options: ['cm', 'in'],
                            onChange: handleUnitChange(setNeckCircumferenceUnit, 'neckCircumferenceUnit')
                        })}
                        {renderInput('Waist Circumference', waistCircumference,
                            handleInputChange(setWaistCircumference, 'waistCircumference'), {
                            current: waistCircumferenceUnit,
                            options: ['cm', 'in'],
                            onChange: handleUnitChange(setWaistCircumferenceUnit, 'waistCircumferenceUnit')
                        })}
                        {gender === 'female' && renderInput('Hip Circumference', hipCircumference,
                            handleInputChange(setHipCircumference, 'hipCircumference'), {
                            current: hipCircumferenceUnit,
                            options: ['cm', 'in'],
                            onChange: handleUnitChange(setHipCircumferenceUnit, 'hipCircumferenceUnit')
                        })}
                    </View>

                    <TouchableOpacity
                        style={[styles.calculateButton, !validateInputs() && styles.disabledButton]}
                        onPress={calculateBodyFat}
                        disabled={!validateInputs() || loading}>
                        <Text style={styles.calculateButtonText}>
                            {loading ? 'Calculating...' : 'Calculate'}
                        </Text>
                    </TouchableOpacity>

                    {bodyFat !== null && (
                        <View style={styles.resultsContainer}>
                            <View style={[styles.resultItem, { borderBottomWidth: 2, borderBottomColor: getBodyFatCategory(bodyFat).color }]}>
                                <Text style={styles.resultLabel}>Body Fat Percentage</Text>
                                <View style={styles.resultValueContainer}>
                                    <Text style={[styles.resultValue, { color: getBodyFatCategory(bodyFat).color }]}>
                                        {bodyFat}%
                                    </Text>
                                    <Text style={[styles.categoryLabel, { color: getBodyFatCategory(bodyFat).color }]}>
                                        {getBodyFatCategory(bodyFat).label}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.resultItem}>
                                <Text style={styles.resultLabel}>Fat Mass</Text>
                                <Text style={styles.resultValue}>{fatMass} kg</Text>
                            </View>
                            <View style={styles.resultItem}>
                                <Text style={styles.resultLabel}>Lean Mass</Text>
                                <Text style={styles.resultValue}>{leanMass} kg</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle}>About the calculation</Text>
                        <Text style={styles.infoText}>
                            This calculator uses the U.S. Navy method to estimate body fat percentage. It relies on measurements of your neck, waist, and height (plus hip measurements for females). The formula has been validated against hydrostatic weighing and is considered reasonably accurate for most people. However, results may vary based on individual body composition and measurement accuracy.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f8f9fa'
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
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginVertical: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    genderSelector: {
        flexDirection: 'row',
        marginBottom: 24,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        padding: 4,
    },
    genderButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    activeGender: {
        backgroundColor: '#007AFF',
    },
    genderText: {
        fontSize: 16,
        color: '#666',
    },
    activeGenderText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inputContainer: {
        gap: 20,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 2,
    },
    unitButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    activeUnit: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontSize: 14,
        color: '#666',
    },
    activeButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    enhancedInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    calculateButton: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 32,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultsContainer: {
        marginTop: 32,
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        padding: 20,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    resultLabel: {
        fontSize: 16,
        color: '#666',
    },
    resultValueContainer: {
        alignItems: 'flex-end',
    },
    resultValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    categoryLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    infoContainer: {
        marginTop: 32,
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    }
});

export default BodyFatCalculator;

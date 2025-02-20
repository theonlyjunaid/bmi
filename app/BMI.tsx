import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Pressable, ScrollView, View, Text, TextInput, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function BMI() {
    const [height, setHeight] = useState('');
    const [heightInch, setHeightInch] = useState('');
    const [weight, setWeight] = useState('');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
    const [bmi, setBmi] = useState<number | null>(null);

    // Load saved values on mount
    useEffect(() => {
        const loadSavedValues = async () => {
            try {
                const savedHeight = await AsyncStorage.getItem('height');
                const savedHeightInch = await AsyncStorage.getItem('heightInch');
                const savedWeight = await AsyncStorage.getItem('weight');
                const savedHeightUnit = await AsyncStorage.getItem('heightUnit');
                const savedWeightUnit = await AsyncStorage.getItem('weightUnit');

                if (savedHeight) setHeight(savedHeight);
                if (savedHeightInch) setHeightInch(savedHeightInch);
                if (savedWeight) setWeight(savedWeight);
                if (savedHeightUnit) setHeightUnit(savedHeightUnit as 'cm' | 'ft');
                if (savedWeightUnit) setWeightUnit(savedWeightUnit as 'kg' | 'lb');
            } catch (error) {
                console.error('Error loading saved values:', error);
            }
        };

        loadSavedValues();
    }, []);

    // Save values when they change
    const saveValue = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving value:', error);
        }
    };

    const handleHeightChange = (value: string) => {
        setHeight(value);
        saveValue('height', value);
    };

    const handleHeightInchChange = (value: string) => {
        setHeightInch(value);
        saveValue('heightInch', value);
    };

    const handleWeightChange = (value: string) => {
        setWeight(value);
        saveValue('weight', value);
    };

    const handleHeightUnitChange = (value: 'cm' | 'ft') => {
        setHeightUnit(value);
        saveValue('heightUnit', value);
    };

    const handleWeightUnitChange = (value: 'kg' | 'lb') => {
        setWeightUnit(value);
        saveValue('weightUnit', value);
    };

    const getBMICategory = (bmi: number, heightInMeters: number) => {
        const idealWeightLower = 18.5 * (heightInMeters * heightInMeters);
        const idealWeightUpper = 24.9 * (heightInMeters * heightInMeters);
        const currentWeight = bmi * (heightInMeters * heightInMeters);

        let weightDiff = 0;
        let weightMessage = '';

        if (bmi < 18.5) {
            weightDiff = idealWeightLower - currentWeight;
            weightMessage = `${weightDiff.toFixed(1)} ${weightUnit === 'kg' ? 'kg' : 'lbs'} to gain`;
            return {
                category: 'Underweight',
                color: '#3498db',
                percentage: (bmi / 40) * 100,
                weightMessage
            };
        }
        if (bmi < 25) {
            return {
                category: 'Normal weight',
                color: '#2ecc71',
                percentage: (bmi / 40) * 100,
                weightMessage: 'Healthy weight range'
            };
        }
        if (bmi < 30) {
            weightDiff = currentWeight - idealWeightUpper;
            weightMessage = `${weightDiff.toFixed(1)} ${weightUnit === 'kg' ? 'kg' : 'lbs'} to lose`;
            return {
                category: 'Overweight',
                color: '#f1c40f',
                percentage: (bmi / 40) * 100,
                weightMessage
            };
        }
        weightDiff = currentWeight - idealWeightUpper;
        weightMessage = `${weightDiff.toFixed(1)} ${weightUnit === 'kg' ? 'kg' : 'lbs'} to lose`;
        return {
            category: 'Obese',
            color: '#e74c3c',
            percentage: Math.min((bmi / 40) * 100, 100),
            weightMessage
        };
    };

    const bmiDetails = useMemo(() => {
        if (bmi === null) return null;

        let heightInMeters: number;
        if (heightUnit === 'cm') {
            heightInMeters = parseFloat(height) / 100;
        } else {
            const feet = parseFloat(height);
            const inches = parseFloat(heightInch || '0');
            heightInMeters = (feet * 30.48 + inches * 2.54) / 100;
        }

        return getBMICategory(bmi, heightInMeters);
    }, [bmi, height, heightInch, heightUnit, weightUnit]);

    useEffect(() => {
        if (!height || !weight) {
            setBmi(null);
            return;
        }

        let heightInMeters: number;
        let weightInKg: number;

        if (heightUnit === 'cm') {
            heightInMeters = parseFloat(height) / 100;
        } else {
            const feet = parseFloat(height);
            const inches = parseFloat(heightInch || '0');
            heightInMeters = (feet * 30.48 + inches * 2.54) / 100;
        }

        if (weightUnit === 'kg') {
            weightInKg = parseFloat(weight);
        } else {
            weightInKg = parseFloat(weight) * 0.453592;
        }

        if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters <= 0 || weightInKg <= 0) {
            setBmi(null);
            return;
        }

        const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
        setBmi(Number(calculatedBmi.toFixed(1)));
    }, [height, heightInch, weight, heightUnit, weightUnit]);

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4CAF50', '#2196F3']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Text style={styles.title}>BMI Calculator</Text>


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
                            <View style={styles.inputHeader}>
                                <Text style={styles.inputLabel}>Weight</Text>
                                <View style={styles.unitToggle}>
                                    <Pressable
                                        style={[styles.unitButton, weightUnit === 'kg' && styles.activeUnit]}
                                        onPress={() => handleWeightUnitChange('kg')}>
                                        <Text style={[styles.buttonText, weightUnit === 'kg' && styles.activeButtonText]}>
                                            kg
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.unitButton, weightUnit === 'lb' && styles.activeUnit]}
                                        onPress={() => handleWeightUnitChange('lb')}>
                                        <Text style={[styles.buttonText, weightUnit === 'lb' && styles.activeButtonText]}>
                                            lb
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                            <TextInput
                                style={[styles.input, styles.enhancedInput]}
                                placeholder={`Enter weight in ${weightUnit}`}
                                value={weight}
                                onChangeText={handleWeightChange}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                </View>
                {bmi !== null && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>Your BMI</Text>
                        <Text style={[styles.bmiValue, { color: bmiDetails?.color }]}>
                            {bmi}
                        </Text>
                        <Text style={[styles.category, { color: bmiDetails?.color }]}>
                            {bmiDetails?.category}
                        </Text>
                        <Text style={[styles.weightMessage, { color: bmiDetails?.color }]}>
                            {bmiDetails?.weightMessage}
                        </Text>

                        <View style={styles.meterContainer}>
                            <View style={[styles.meterFill, { width: `${parseFloat(bmiDetails?.percentage.toString() || '0')}%`, backgroundColor: bmiDetails?.color }]} />
                            <View style={styles.meterMarkers}>
                                <View style={styles.marker}><Text style={styles.markerText}>18.5</Text></View>
                                <View style={styles.marker}><Text style={styles.markerText}>25</Text></View>
                                <View style={styles.marker}><Text style={styles.markerText}>30</Text></View>
                            </View>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>BMI Categories</Text>
                            <View style={styles.categoryList}>
                                <View style={styles.categoryItem}>
                                    <View style={[styles.categoryDot, { backgroundColor: '#3498db' }]} />
                                    <Text>Underweight: {'<'} 18.5</Text>
                                </View>
                                <View style={styles.categoryItem}>
                                    <View style={[styles.categoryDot, { backgroundColor: '#2ecc71' }]} />
                                    <Text>Normal weight: 18.5 - 24.9</Text>
                                </View>
                                <View style={styles.categoryItem}>
                                    <View style={[styles.categoryDot, { backgroundColor: '#f1c40f' }]} />
                                    <Text>Overweight: 25 - 29.9</Text>
                                </View>
                                <View style={styles.categoryItem}>
                                    <View style={[styles.categoryDot, { backgroundColor: '#e74c3c' }]} />
                                    <Text>Obese: ≥ 30</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>About the calculation</Text>
                            <Text style={styles.infoText}>
                                BMI (Body Mass Index) is calculated by dividing your weight by the square of your height. While BMI is a useful screening tool, it's important to note that it doesn't directly measure body fat or overall health. Factors like muscle mass, age, gender, ethnicity, and body composition can affect how accurately BMI reflects your health status. Always consult healthcare professionals for a comprehensive health assessment.
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>);
}

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
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    unitToggle: {
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
    activeUnit: {
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
    inputContainer: {
        gap: 24,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputWrapper: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    enhancedInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
    bmiValue: {
        fontSize: 64,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: -1,
    },
    category: {
        marginBottom: 8,
        fontSize: 28,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    weightMessage: {
        marginBottom: 32,
        fontSize: 18,
        fontWeight: '500',
    },
    meterContainer: {
        width: '100%',
        height: 24,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 32,
        overflow: 'hidden',
    },
    meterFill: {
        height: '100%',
        borderRadius: 12,
        width: '100%',
    },
    meterMarkers: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '15%',
    },
    marker: {
        height: '100%',
        width: 2,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    markerText: {
        position: 'absolute',
        top: 28,
        fontSize: 12,
        transform: [{ translateX: -10 }],
        color: '#666',
        fontWeight: '500',
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
        marginBottom: 20,
        textAlign: 'center',
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    categoryList: {
        gap: 16,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
});

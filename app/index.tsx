import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { HelloWave } from '@/components/HelloWave';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>Welcome!</ThemedText>
          <HelloWave />
        </View>

        <ThemedText type="subtitle" style={styles.subtitle}>
          Choose a calculator to get started
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Link href="/BMI" style={styles.button} asChild>
            <TouchableOpacity style={styles.buttonInner}>
              <View style={styles.buttonIconContainer}>
                <MaterialCommunityIcons name="scale-bathroom" size={28} color="#2196F3" />
              </View>
              <View style={styles.buttonTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.buttonTitle}>BMI Calculator</ThemedText>
                <ThemedText style={styles.buttonDescription}>Calculate your Body Mass Index</ThemedText>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/Body fat" style={styles.button} asChild>
            <TouchableOpacity style={styles.buttonInner}>
              <View style={styles.buttonIconContainer}>
                <MaterialCommunityIcons name="percent" size={28} color="#4CAF50" />
              </View>
              <View style={styles.buttonTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.buttonTitle}>Body Fat Calculator</ThemedText>
                <ThemedText style={styles.buttonDescription}>Calculate your body fat percentage</ThemedText>
              </View>
            </TouchableOpacity>
          </Link>
          <Link href="/Ideal Weight" style={styles.button} asChild>
            <TouchableOpacity style={styles.buttonInner}>
              <View style={styles.buttonIconContainer}>
                <MaterialCommunityIcons name="scale-bathroom" size={28} color="#2196F3" />
              </View>
              <View style={styles.buttonTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.buttonTitle}>Ideal Weight Calculator</ThemedText>
                <ThemedText style={styles.buttonDescription}>Calculate your ideal weight</ThemedText>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Dimensions.get('window').height * 0.3,
    opacity: 0.15,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    color: '#000000',
    marginTop: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    color: '#000000',
    marginTop: 8,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: Dimensions.get('window').height * 0.1,
    gap: 16,
  },
  button: {
    marginBottom: 16,
  },
  buttonInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  buttonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: '#333',
    marginBottom: 4,
  },
  buttonDescription: {
    color: '#666',
  }
});

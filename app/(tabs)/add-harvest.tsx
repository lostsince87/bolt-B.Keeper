import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Droplets, Calendar, Save, Layers } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function AddHarvestScreen() {
  const [selectedHive, setSelectedHive] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [honeyFrames, setHoneyFrames] = useState('');
  const [estimatedHoney, setEstimatedHoney] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const hives = ['Kupa Alpha', 'Kupa Beta', 'Kupa Gamma'];

  // Calculate estimated honey when frames change
  const handleFramesChange = (value: string) => {
    setHoneyFrames(value);
    const frames = parseFloat(value);
    if (frames > 0) {
      setEstimatedHoney(frames * 2); // 2kg per frame
    } else {
      setEstimatedHoney(null);
    }
  };

  const handleSave = () => {
    if (!selectedHive) {
      Alert.alert('Fel', 'Välj en kupa för skattningen');
      return;
    }
    if (!honeyFrames || parseFloat(honeyFrames) <= 0) {
      Alert.alert('Fel', 'Ange antal honungsramar');
      return;
    }

    // Here you would save to your database
    Alert.alert(
      'Skattning sparad!', 
      `Skattning för ${selectedHive}: ${honeyFrames} ramar ≈ ${estimatedHoney} kg honung`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.title}>Registrera skattning</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Välj kupa *</Text>
              <View style={styles.hiveSelector}>
                {hives.map((hive) => (
                  <TouchableOpacity
                    key={hive}
                    style={[
                      styles.hiveOption,
                      selectedHive === hive && styles.hiveOptionSelected
                    ]}
                    onPress={() => setSelectedHive(hive)}
                  >
                    <Text style={[
                      styles.hiveOptionText,
                      selectedHive === hive && styles.hiveOptionTextSelected
                    ]}>
                      {hive}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Datum *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#8B7355" />
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Antal honungsramar *</Text>
              <View style={styles.inputContainer}>
                <Layers size={20} color="#F7B801" />
                <TextInput
                  style={styles.input}
                  value={honeyFrames}
                  onChangeText={handleFramesChange}
                  placeholder="12"
                  keyboardType="numeric"
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            {estimatedHoney !== null && (
              <View style={styles.estimationResult}>
                <Droplets size={24} color="#F7B801" />
                <View style={styles.estimationText}>
                  <Text style={styles.estimationValue}>
                    ≈ {estimatedHoney} kg honung
                  </Text>
                  <Text style={styles.estimationNote}>
                    Baserat på 2 kg per honungsram
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Anteckningar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Kvalitet på honungen, färg, konsistens..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#8B7355"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={24} color="white" />
              <Text style={styles.saveButtonText}>Spara skattning</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
    marginLeft: 12,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#8B4513',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hiveSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hiveOption: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8D5B7',
  },
  hiveOptionSelected: {
    backgroundColor: '#F7B801',
    borderColor: '#F7B801',
  },
  hiveOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  hiveOptionTextSelected: {
    color: 'white',
  },
  estimationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7B801' + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  estimationText: {
    marginLeft: 12,
  },
  estimationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7B801',
    marginBottom: 2,
  },
  estimationNote: {
    fontSize: 12,
    color: '#8B7355',
  },
  saveButton: {
    backgroundColor: '#F7B801',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
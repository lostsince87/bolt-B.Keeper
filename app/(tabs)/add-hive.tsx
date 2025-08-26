import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Briefcase, Save } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function AddHiveScreen() {
  const [hiveName, setHiveName] = useState('');
  const [location, setLocation] = useState('');
  const [frames, setFrames] = useState('20');
  const [isNucleus, setIsNucleus] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [hives, setHives] = useState([
    { id: 1, name: 'Kupa Alpha', location: 'Norra ängen' },
    { id: 2, name: 'Kupa Beta', location: 'Södra skogen' },
    { id: 3, name: 'Kupa Gamma', location: 'Östra fältet' },
  ]);

  const handleSave = () => {
    if (!hiveName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för kupan');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Fel', 'Ange en plats för kupan');
      return;
    }

    const frameCount = parseInt(frames);
    if (frameCount <= 10 && isNucleus === null) {
      Alert.alert('Fråga', 'Är detta en avläggare?');
      return;
    }

    // Create new hive object
    const newHive = {
      id: hives.length + 1,
      name: hiveName.trim(),
      location: location.trim(),
      frames: frameCount,
      isNucleus: frameCount <= 10 ? isNucleus : false,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add to hives list (in real app, save to database)
    setHives([...hives, newHive]);

    Alert.alert(
      'Kupa sparad!', 
      `${hiveName} har lagts till på ${location}${frameCount <= 10 && isNucleus ? ' som avläggare' : ''}`,
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
          <Text style={styles.title}>Ny kupa</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kupans namn *</Text>
              <View style={styles.inputContainer}>
                <Briefcase size={20} color="#8B7355" />
                <TextInput
                  style={styles.input}
                  placeholder="t.ex. Kupa Alpha"
                  value={hiveName}
                  onChangeText={setHiveName}
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Plats *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#8B7355" />
                <TextInput
                  style={styles.input}
                  placeholder="t.ex. Norra ängen"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Antal ramar</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="20"
                  value={frames}
                  onChangeText={setFrames}
                  keyboardType="numeric"
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            {parseInt(frames) <= 10 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Är detta en avläggare?</Text>
                <View style={styles.nucleusSelector}>
                  <TouchableOpacity
                    style={[
                      styles.nucleusOption,
                      isNucleus === true && styles.nucleusOptionSelected
                    ]}
                    onPress={() => setIsNucleus(true)}
                  >
                    <Text style={[
                      styles.nucleusOptionText,
                      isNucleus === true && styles.nucleusOptionTextSelected
                    ]}>
                      Ja
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.nucleusOption,
                      isNucleus === false && styles.nucleusOptionSelected
                    ]}
                    onPress={() => setIsNucleus(false)}
                  >
                    <Text style={[
                      styles.nucleusOptionText,
                      isNucleus === false && styles.nucleusOptionTextSelected
                    ]}>
                      Nej
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Anteckningar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ytterligare information om kupan..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#8B7355"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={24} color="white" />
              <Text style={styles.saveButtonText}>Spara kupa</Text>
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
  nucleusSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  nucleusOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nucleusOptionSelected: {
    backgroundColor: '#8FBC8F',
    borderColor: '#8FBC8F',
  },
  nucleusOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B7355',
  },
  nucleusOptionTextSelected: {
    color: 'white',
  },
});
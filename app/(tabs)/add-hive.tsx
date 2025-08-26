import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Briefcase, Save, Crown, Scissors } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function AddHiveScreen() {
  const [hiveName, setHiveName] = useState('');
  const [location, setLocation] = useState('');
  const [frames, setFrames] = useState('20');
  const [isNucleus, setIsNucleus] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [hasQueen, setHasQueen] = useState<boolean | null>(null);
  const [queenMarked, setQueenMarked] = useState<boolean | null>(null);
  const [queenColor, setQueenColor] = useState('');
  const [queenWingClipped, setQueenWingClipped] = useState<boolean | null>(null);

  const queenColors = [
    { id: 'white', name: 'Vit', color: '#FFFFFF', textColor: '#000000' },
    { id: 'yellow', name: 'Gul', color: '#FFD700', textColor: '#000000' },
    { id: 'red', name: 'Röd', color: '#FF0000', textColor: '#FFFFFF' },
    { id: 'green', name: 'Grön', color: '#008000', textColor: '#FFFFFF' },
    { id: 'blue', name: 'Blå', color: '#0000FF', textColor: '#FFFFFF' },
  ];

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
      Alert.alert('Fel', 'Ange om detta är en avläggare');
      return;
    }
    if (hasQueen === null) {
      Alert.alert('Fel', 'Ange om drottning finns');
      return;
    }
    if (hasQueen && queenMarked === null) {
      Alert.alert('Fel', 'Ange om drottningen är märkt');
      return;
    }
    if (hasQueen && queenMarked && !queenColor) {
      Alert.alert('Fel', 'Välj färg på drottningens märkning');
      return;
    }
    if (hasQueen && queenWingClipped === null) {
      Alert.alert('Fel', 'Ange om drottningen är vingklippt');
      return;
    }

    // Create new hive object with queen data
    const queenData = hasQueen ? {
      hasQueen: true,
      queenMarked,
      queenColor: queenMarked ? queenColor : null,
      queenWingClipped,
      queenAddedDate: new Date().toISOString(),
    } : {
      hasQueen: false,
      queenMarked: null,
      queenColor: null,
      queenWingClipped: null,
      queenAddedDate: null,
    };

    const newHive = {
      id: Date.now(), // Simple ID generation
      name: hiveName.trim(),
      location: location.trim(),
      frames: frameCount,
      isNucleus: frameCount <= 10 ? isNucleus : false,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      ...queenData,
    };

    // Save to localStorage (in real app, save to database)
    try {
      const existingHives = JSON.parse(localStorage.getItem('hives') || '[]');
      const updatedHives = [...existingHives, newHive];
      localStorage.setItem('hives', JSON.stringify(updatedHives));
    } catch (error) {
      console.log('Could not save to localStorage:', error);
    }

    Alert.alert(
      'Kupa sparad!', 
      `${hiveName} har lagts till på ${location}${frameCount <= 10 && isNucleus ? ' som avläggare' : ''}${hasQueen ? ' med drottning' : ''}`,
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
              <Text style={styles.label}>Drottning finns *</Text>
              <View style={styles.queenSelector}>
                <TouchableOpacity
                  style={[
                    styles.queenOption,
                    hasQueen === true && styles.queenOptionSelected
                  ]}
                  onPress={() => setHasQueen(true)}
                >
                  <Crown size={20} color={hasQueen === true ? 'white' : '#8B7355'} />
                  <Text style={[
                    styles.queenOptionText,
                    hasQueen === true && styles.queenOptionTextSelected
                  ]}>
                    Ja
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.queenOption,
                    hasQueen === false && styles.queenOptionSelected
                  ]}
                  onPress={() => setHasQueen(false)}
                >
                  <Text style={[
                    styles.queenOptionText,
                    hasQueen === false && styles.queenOptionTextSelected
                  ]}>
                    Nej
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {hasQueen && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Drottning märkt *</Text>
                  <View style={styles.queenSelector}>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        queenMarked === true && styles.queenOptionSelected
                      ]}
                      onPress={() => setQueenMarked(true)}
                    >
                      <Text style={[
                        styles.queenOptionText,
                        queenMarked === true && styles.queenOptionTextSelected
                      ]}>
                        Ja
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        queenMarked === false && styles.queenOptionSelected
                      ]}
                      onPress={() => setQueenMarked(false)}
                    >
                      <Text style={[
                        styles.queenOptionText,
                        queenMarked === false && styles.queenOptionTextSelected
                      ]}>
                        Nej
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {queenMarked && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Märkningsfärg *</Text>
                    <View style={styles.colorSelector}>
                      {queenColors.map((color) => (
                        <TouchableOpacity
                          key={color.id}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color.color },
                            queenColor === color.id && styles.colorOptionSelected
                          ]}
                          onPress={() => setQueenColor(color.id)}
                        >
                          <Text style={[styles.colorText, { color: color.textColor }]}>
                            {color.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Drottning vingklippt *</Text>
                  <View style={styles.queenSelector}>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        queenWingClipped === true && styles.queenOptionSelected
                      ]}
                      onPress={() => setQueenWingClipped(true)}
                    >
                      <Scissors size={20} color={queenWingClipped === true ? 'white' : '#8B7355'} />
                      <Text style={[
                        styles.queenOptionText,
                        queenWingClipped === true && styles.queenOptionTextSelected
                      ]}>
                        Ja
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        queenWingClipped === false && styles.queenOptionSelected
                      ]}
                      onPress={() => setQueenWingClipped(false)}
                    >
                      <Text style={[
                        styles.queenOptionText,
                        queenWingClipped === false && styles.queenOptionTextSelected
                      ]}>
                        Nej
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
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
  queenSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  queenOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
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
  queenOptionSelected: {
    backgroundColor: '#F7B801',
    borderColor: '#F7B801',
  },
  queenOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B7355',
    marginLeft: 8,
  },
  queenOptionTextSelected: {
    color: 'white',
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorOptionSelected: {
    borderColor: '#8B4513',
  },
  colorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
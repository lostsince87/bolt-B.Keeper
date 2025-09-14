import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Briefcase, Save, Crown, Scissors, Camera } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// ============================================
// HUVUDKOMPONENT (Main Component)
// ============================================

export default function AddHiveScreen() {
  // ============================================
  // STATE VARIABLER (State Variables)
  // ============================================
  
  // Grundläggande kupinformation
  const [hiveName, setHiveName] = useState('');
  const [location, setLocation] = useState('');
  const [frames, setFrames] = useState('20');
  const [isNucleus, setIsNucleus] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  
  // Drottninginformation
  const [hasQueen, setHasQueen] = useState<boolean | null>(null);
  const [queenMarked, setQueenMarked] = useState<boolean | null>(null);
  const [queenColor, setQueenColor] = useState('');
  const [queenWingClipped, setQueenWingClipped] = useState<boolean | null>(null);
  
  // Bildinformation
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ============================================
  // KONSTANTER (Constants)
  // ============================================
  
  // Tillgängliga färger för drottningmärkning
  const queenColors = [
    { id: 'white', name: 'Vit', color: '#FFFFFF', textColor: '#000000' },
    { id: 'yellow', name: 'Gul', color: '#FFD700', textColor: '#000000' },
    { id: 'red', name: 'Röd', color: '#FF0000', textColor: '#FFFFFF' },
    { id: 'green', name: 'Grön', color: '#008000', textColor: '#FFFFFF' },
    { id: 'blue', name: 'Blå', color: '#0000FF', textColor: '#FFFFFF' },
  ];

  // ============================================
  // HÄNDELSEHANTERARE (Event Handlers)
  // ============================================
  
  // Hantera bildval
  const handleImagePicker = async () => {
    try {
      // Be om tillstånd för kamerarulle
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Tillstånd krävs', 'Du behöver ge tillstånd för att välja bilder');
        return;
      }

      // Öppna bildväljare
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte välja bild');
    }
  };

  // Spara kupa
  const handleSave = () => {
    console.log('Starting to save hive...');
    
    // Validering av obligatoriska fält
    if (!hiveName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för kupan');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Fel', 'Ange en plats för kupan');
      return;
    }
    if (!frames || parseInt(frames) <= 0) {
      Alert.alert('Fel', 'Ange ett giltigt antal ramar');
      return;
    }

    console.log('Validation passed, creating hive...');

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

    console.log('Creating hive object...');

    // Skapa drottningdata
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

    // Skapa nytt kupobjekt
    const newHive = {
      id: Date.now(), // Enkel ID-generering
      name: hiveName.trim(),
      location: location.trim(),
      frames: `0/${frameCount}`, // Start with 0 brood frames
      isNucleus: frameCount <= 10 ? isNucleus : false,
      isWintered: false,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      lastInspection: new Date().toISOString().split('T')[0],
      status: hasQueen ? 'good' : 'critical',
      population: frameCount <= 10 ? 'Svag' : 'Medel',
      varroa: '0.0/dag',
      honey: '0 kg',
      image: selectedImage, // Spara bildväg
      ...queenData,
    };

    console.log('Saving hive to AsyncStorage...');

    // Spara till AsyncStorage
    const saveHive = async () => {
      try {
        const existingHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
        console.log('Existing hives:', existingHives.length);
        
        // Check if hive name already exists
        const nameExists = existingHives.some(hive => 
          hive.name.toLowerCase() === hiveName.trim().toLowerCase()
        );
        
        if (nameExists) {
          Alert.alert('Fel', 'En kupa med detta namn finns redan');
          return;
        }
        
        const updatedHives = [...existingHives, newHive];
        await AsyncStorage.setItem('hives', JSON.stringify(updatedHives));
        console.log('Hive saved successfully');
        
        Alert.alert(
          'Kupa sparad!', 
          `${hiveName} har lagts till på ${location}${frameCount <= 10 && isNucleus ? ' som avläggare' : ''}${hasQueen ? ' med drottning' : ''}`,
          [{ text: 'OK', onPress: () => router.push('/hives') }]
        );
      } catch (error) {
        console.error('Could not save hive:', error);
        Alert.alert('Fel', 'Kunde inte spara kupan. Försök igen.');
      }
    };

    saveHive();
  };

  // ============================================
  // RENDER (UI Rendering)
  // ============================================

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
            {/* GRUNDLÄGGANDE INFORMATION */}
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

            {/* BILDUPPLADDNING */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bild av kupan</Text>
              {!selectedImage ? (
                <TouchableOpacity style={styles.imageUploadButton} onPress={handleImagePicker}>
                  <Camera size={24} color="#8B7355" />
                  <Text style={styles.imageUploadText}>Lägg till bild</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreview}>
                  <Text style={styles.imagePreviewText}>Bild vald</Text>
                  <TouchableOpacity style={styles.changeImageButton} onPress={handleImagePicker}>
                    <Text style={styles.changeImageText}>Ändra</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* AVLÄGGARE-KONTROLL (visas bara om få ramar) */}
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

            {/* DROTTNINGINFORMATION */}
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

            {/* ANTECKNINGAR */}
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

            {/* SPARA-KNAPP */}
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
  imageSection: {
    marginBottom: 16,
  },
  imageUploadButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageUploadText: {
    fontSize: 16,
    color: '#8B7355',
    marginLeft: 12,
  },
  imagePreview: {
    backgroundColor: '#8FBC8F20',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  imagePreviewText: {
    fontSize: 16,
    color: '#8FBC8F',
    fontWeight: '600',
  },
  changeImageButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
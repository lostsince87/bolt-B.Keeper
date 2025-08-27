import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Thermometer, FileText, Save, Crown, Bug, Activity, Layers, Cloud, Snowflake, Shield, Scissors } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddInspectionScreen() {
  const [selectedHive, setSelectedHive] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState(''); // Will be auto-filled
  const [temperature, setTemperature] = useState('18');
  const [broodFrames, setBroodFrames] = useState('');
  const [totalFrames, setTotalFrames] = useState('');
  const [queenSeen, setQueenSeen] = useState<boolean | null>(null);
  const [temperament, setTemperament] = useState('');
  const [varroaCount, setVarroaCount] = useState('');
  const [varroaDays, setVarroaDays] = useState('');
  const [varroaPerDay, setVarroaPerDay] = useState<number | null>(null);
  const [varroaLevel, setVarroaLevel] = useState<'lågt' | 'normalt' | 'högt' | null>(null);
  const [notes, setNotes] = useState('');
  const [isWintering, setIsWintering] = useState(false);
  const [winterFeed, setWinterFeed] = useState('');
  const [isVarroaTreatment, setIsVarroaTreatment] = useState(false);
  const [treatmentType, setTreatmentType] = useState('');
  const [newQueenAdded, setNewQueenAdded] = useState(false);
  const [newQueenMarked, setNewQueenMarked] = useState<boolean | null>(null);
  const [newQueenColor, setNewQueenColor] = useState('');
  const [newQueenWingClipped, setNewQueenWingClipped] = useState<boolean | null>(null);

  const hives = ['Kupa Alpha', 'Kupa Beta', 'Kupa Gamma'];
  const temperamentOptions = ['Lugn', 'Normal', 'Aggressiv'];
  const treatmentOptions = ['Apiguard', 'Bayvarol', 'Apistan', 'Oxalsyra', 'Myrsyra', 'Annat'];
  const queenColors = [
    { id: 'white', name: 'Vit', color: '#FFFFFF', textColor: '#000000' },
    { id: 'yellow', name: 'Gul', color: '#FFD700', textColor: '#000000' },
    { id: 'red', name: 'Röd', color: '#FF0000', textColor: '#FFFFFF' },
    { id: 'green', name: 'Grön', color: '#008000', textColor: '#FFFFFF' },
    { id: 'blue', name: 'Blå', color: '#0000FF', textColor: '#FFFFFF' },
  ];

  // Auto-fill weather when component mounts
  useEffect(() => {
    // Simulate getting actual weather data
    const getWeatherData = async () => {
      // In a real app, you would call a weather API here
      // For now, we'll simulate different weather conditions
      const weatherConditions = [
        'Soligt, 18°C',
        'Molnigt, 15°C',
        'Lätt regn, 12°C',
        'Delvis molnigt, 20°C',
        'Klart, 22°C'
      ];
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      setWeather(randomWeather);
      
      // Extract temperature from weather string
      const tempMatch = randomWeather.match(/(\d+)°C/);
      if (tempMatch) {
        setTemperature(tempMatch[1]);
      }
    };
    
    getWeatherData();
  }, []);

  // Calculate varroa per day when count or days change
  const calculateVarroaPerDay = (count: string, days: string) => {
    const countNum = parseFloat(count);
    const daysNum = parseFloat(days);
    
    if (countNum >= 0 && daysNum > 0) {
      const perDay = countNum / daysNum;
      setVarroaPerDay(perDay);
      
      if (perDay <= 2) {
        setVarroaLevel('lågt');
      } else if (perDay <= 5) {
        setVarroaLevel('normalt');
      } else {
        setVarroaLevel('högt');
      }
    } else {
      setVarroaPerDay(null);
      setVarroaLevel(null);
    }
  };

  const handleVarroaCountChange = (value: string) => {
    setVarroaCount(value);
    calculateVarroaPerDay(value, varroaDays);
  };

  const handleVarroaDaysChange = (value: string) => {
    setVarroaDays(value);
    calculateVarroaPerDay(varroaCount, value);
  };

  const getVarroaLevelColor = (level: string | null) => {
    switch (level) {
      case 'lågt': return '#8FBC8F';
      case 'normalt': return '#F7B801';
      case 'högt': return '#E74C3C';
      default: return '#8B7355';
    }
  };

  const handleSave = () => {
    if (!selectedHive) {
      Alert.alert('Fel', 'Välj en kupa att inspektera');
      return;
    }
    if (!broodFrames || !totalFrames) {
      Alert.alert('Fel', 'Ange antal yngel- och totalramar');
      return;
    }

    // Create inspection object
    const newInspection = {
      id: Date.now(),
      hive: selectedHive,
      date,
      weather,
      temperature: parseFloat(temperature),
      broodFrames: parseInt(broodFrames),
      totalFrames: parseInt(totalFrames),
      queenSeen,
      temperament,
      varroaCount: varroaCount ? parseFloat(varroaCount) : null,
      varroaDays: varroaDays ? parseFloat(varroaDays) : null,
      varroaPerDay,
      varroaLevel,
      notes: notes.trim(),
      isWintering,
      winterFeed: winterFeed ? parseFloat(winterFeed) : null,
      isVarroaTreatment,
      treatmentType: treatmentType || null,
      newQueenAdded,
      newQueenMarked: newQueenAdded ? newQueenMarked : null,
      newQueenColor: newQueenAdded && newQueenMarked ? newQueenColor : null,
      newQueenWingClipped: newQueenAdded ? newQueenWingClipped : null,
      createdAt: new Date().toISOString(),
    };

    // Save inspection to AsyncStorage
    const saveInspection = async () => {
      try {
        const existingInspections = JSON.parse(await AsyncStorage.getItem('inspections') || '[]');
        const updatedInspections = [...existingInspections, newInspection];
        await AsyncStorage.setItem('inspections', JSON.stringify(updatedInspections));

        // If new queen was added, update the hive data
        if (newQueenAdded) {
          const existingHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
          const updatedHives = existingHives.map(hive => {
            if (hive.name === selectedHive) {
              return {
                ...hive,
                hasQueen: true,
                queenMarked: newQueenMarked,
                queenColor: newQueenMarked ? newQueenColor : null,
                queenWingClipped: newQueenWingClipped,
                queenAddedDate: new Date().toISOString(),
                isWintered: isWintering ? true : hive.isWintered,
              };
            }
            return hive;
          });
          
          // Update wintering status for all hives if this is a wintering inspection
          if (isWintering) {
            const winteringHives = updatedHives.map(hive => ({
              ...hive,
              isWintered: true
            }));
            await AsyncStorage.setItem('hives', JSON.stringify(winteringHives));
          } else {
            await AsyncStorage.setItem('hives', JSON.stringify(updatedHives));
          }
        } else if (isWintering) {
          // Update wintering status even if no new queen
          const existingHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
          const winteringHives = existingHives.map(hive => ({
            ...hive,
            isWintered: true
          }));
          await AsyncStorage.setItem('hives', JSON.stringify(winteringHives));
        }
      } catch (error) {
        console.log('Could not save inspection:', error);
        Alert.alert('Fel', 'Kunde inte spara inspektionen. Försök igen.');
        return;
      } catch (error) {
        console.log('Could not save inspection:', error);
      }
    };

    saveInspection().then(() => {
      Alert.alert(
        'Inspektion sparad!', 
        `Inspektion av ${selectedHive} har registrerats${newQueenAdded ? ' med ny drottning' : ''}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    });
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
          <Text style={styles.title}>Ny inspektion</Text>
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

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
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

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Temperatur</Text>
                <View style={styles.inputContainer}>
                  <Thermometer size={20} color="#8B7355" />
                  <TextInput
                    style={styles.input}
                    value={temperature}
                    onChangeText={setTemperature}
                    placeholder="18"
                    placeholderTextColor="#8B7355"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Väder</Text>
              <View style={[styles.inputContainer, { backgroundColor: weather ? '#F0F8E8' : 'white' }]}>
                <Cloud size={20} color="#8FBC8F" />
                <TextInput
                  style={styles.input}
                  value={weather}
                  onChangeText={setWeather}
                  placeholder="Hämtar väderdata..."
                  editable={true}
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Yngelramar *</Text>
                <View style={styles.inputContainer}>
                  <Layers size={20} color="#8B7355" />
                  <TextInput
                    style={styles.input}
                    value={broodFrames}
                    onChangeText={setBroodFrames}
                    placeholder="8"
                    keyboardType="numeric"
                    placeholderTextColor="#8B7355"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Totala ramar *</Text>
                <View style={styles.inputContainer}>
                  <Layers size={20} color="#8B7355" />
                  <TextInput
                    style={styles.input}
                    value={totalFrames}
                    onChangeText={setTotalFrames}
                    placeholder="18"
                    keyboardType="numeric"
                    placeholderTextColor="#8B7355"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drottning sedd</Text>
              <View style={styles.queenSelector}>
                <TouchableOpacity
                  style={[
                    styles.queenOption,
                    queenSeen === true && styles.queenOptionSelected
                  ]}
                  onPress={() => setQueenSeen(true)}
                >
                  <Crown size={20} color={queenSeen === true ? 'white' : '#8B7355'} />
                  <Text style={[
                    styles.queenOptionText,
                    queenSeen === true && styles.queenOptionTextSelected
                  ]}>
                    Ja
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.queenOption,
                    queenSeen === false && styles.queenOptionSelected
                  ]}
                  onPress={() => setQueenSeen(false)}
                >
                  <Text style={[
                    styles.queenOptionText,
                    queenSeen === false && styles.queenOptionTextSelected
                  ]}>
                    Nej
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.queenOption,
                    queenSeen === null && styles.queenOptionSelected
                  ]}
                  onPress={() => setQueenSeen(null)}
                >
                  <Text style={[
                    styles.queenOptionText,
                    queenSeen === null && styles.queenOptionTextSelected
                  ]}>
                    Osäker
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temperament</Text>
              <View style={styles.temperamentSelector}>
                {temperamentOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.temperamentOption,
                      temperament === option && styles.temperamentOptionSelected
                    ]}
                    onPress={() => setTemperament(option)}
                  >
                    <Activity size={16} color={temperament === option ? 'white' : '#8B7355'} />
                    <Text style={[
                      styles.temperamentOptionText,
                      temperament === option && styles.temperamentOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Varroa-räkning</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12, marginBottom: 0 }]}>
                  <Text style={styles.subLabel}>Antal varroa</Text>
                  <View style={styles.inputContainer}>
                    <Bug size={20} color="#E74C3C" />
                    <TextInput
                      style={styles.input}
                      value={varroaCount}
                      onChangeText={handleVarroaCountChange}
                      placeholder="15"
                      keyboardType="numeric"
                      placeholderTextColor="#8B7355"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12, marginBottom: 0 }]}>
                  <Text style={styles.subLabel}>Antal dagar</Text>
                  <View style={styles.inputContainer}>
                    <Calendar size={20} color="#8B7355" />
                    <TextInput
                      style={styles.input}
                      value={varroaDays}
                      onChangeText={handleVarroaDaysChange}
                      placeholder="7"
                      keyboardType="numeric"
                      placeholderTextColor="#8B7355"
                    />
                  </View>
                </View>
              </View>
              
              {varroaPerDay !== null && (
                <View style={[styles.varroaResult, { backgroundColor: getVarroaLevelColor(varroaLevel) + '20' }]}>
                  <Bug size={20} color={getVarroaLevelColor(varroaLevel)} />
                  <View style={styles.varroaResultText}>
                    <Text style={[styles.varroaPerDay, { color: getVarroaLevelColor(varroaLevel) }]}>
                      {varroaPerDay.toFixed(1)} varroa/dag
                    </Text>
                    <Text style={[styles.varroaLevelText, { color: getVarroaLevelColor(varroaLevel) }]}>
                      {varroaLevel?.toUpperCase()} NIVÅ
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialåtgärder</Text>
              <View style={styles.specialActionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.specialActionButton,
                    isWintering && styles.specialActionButtonActive
                  ]}
                  onPress={() => setIsWintering(!isWintering)}
                >
                  <Snowflake size={20} color={isWintering ? 'white' : '#8B7355'} />
                  <Text style={[
                    styles.specialActionText,
                    isWintering && styles.specialActionTextActive
                  ]}>
                    Invintring
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.specialActionButton,
                    isVarroaTreatment && styles.specialActionButtonActive
                  ]}
                  onPress={() => setIsVarroaTreatment(!isVarroaTreatment)}
                >
                  <Shield size={20} color={isVarroaTreatment ? 'white' : '#8B7355'} />
                  <Text style={[
                    styles.specialActionText,
                    isVarroaTreatment && styles.specialActionTextActive
                  ]}>
                    Varroabehandling
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.specialActionButton,
                    newQueenAdded && styles.specialActionButtonActive
                  ]}
                  onPress={() => setNewQueenAdded(!newQueenAdded)}
                >
                  <Crown size={20} color={newQueenAdded ? 'white' : '#8B7355'} />
                  <Text style={[
                    styles.specialActionText,
                    newQueenAdded && styles.specialActionTextActive
                  ]}>
                    Ny drottning
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isWintering && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vinterfoder (kg)</Text>
                <View style={styles.inputContainer}>
                  <Snowflake size={20} color="#8B7355" />
                  <TextInput
                    style={styles.input}
                    value={winterFeed}
                    onChangeText={setWinterFeed}
                    placeholder="15"
                    keyboardType="numeric"
                    placeholderTextColor="#8B7355"
                  />
                </View>
              </View>
            )}

            {isVarroaTreatment && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Typ av behandling</Text>
                <View style={styles.treatmentSelector}>
                  {treatmentOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.treatmentOption,
                        treatmentType === option && styles.treatmentOptionSelected
                      ]}
                      onPress={() => setTreatmentType(option)}
                    >
                      <Text style={[
                        styles.treatmentOptionText,
                        treatmentType === option && styles.treatmentOptionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {newQueenAdded && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ny drottning märkt</Text>
                  <View style={styles.queenSelector}>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        newQueenMarked === true && styles.queenOptionSelected
                      ]}
                      onPress={() => setNewQueenMarked(true)}
                    >
                      <Text style={[
                        styles.queenOptionText,
                        newQueenMarked === true && styles.queenOptionTextSelected
                      ]}>
                        Ja
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        newQueenMarked === false && styles.queenOptionSelected
                      ]}
                      onPress={() => setNewQueenMarked(false)}
                    >
                      <Text style={[
                        styles.queenOptionText,
                        newQueenMarked === false && styles.queenOptionTextSelected
                      ]}>
                        Nej
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {newQueenMarked && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Märkningsfärg</Text>
                    <View style={styles.colorSelector}>
                      {queenColors.map((color) => (
                        <TouchableOpacity
                          key={color.id}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color.color },
                            newQueenColor === color.id && styles.colorOptionSelected
                          ]}
                          onPress={() => setNewQueenColor(color.id)}
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
                  <Text style={styles.label}>Ny drottning vingklippt</Text>
                  <View style={styles.queenSelector}>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        newQueenWingClipped === true && styles.queenOptionSelected
                      ]}
                      onPress={() => setNewQueenWingClipped(true)}
                    >
                      <Scissors size={20} color={newQueenWingClipped === true ? 'white' : '#8B7355'} />
                      <Text style={[
                        styles.queenOptionText,
                        newQueenWingClipped === true && styles.queenOptionTextSelected
                      ]}>
                        Ja
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.queenOption,
                        newQueenWingClipped === false && styles.queenOptionSelected
                      ]}
                      onPress={() => setNewQueenWingClipped(false)}
                    >
                      <Text style={[
                        styles.queenOptionText,
                        newQueenWingClipped === false && styles.queenOptionTextSelected
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
                value={notes}
                onChangeText={setNotes}
                placeholder="Observationer, åtgärder, planerade aktiviteter..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#8B7355"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={24} color="white" />
              <Text style={styles.saveButtonText}>Spara inspektion</Text>
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
  subLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 6,
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
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
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
  queenSelector: {
    flexDirection: 'row',
    gap: 8,
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
  },
  queenOptionSelected: {
    backgroundColor: '#F7B801',
    borderColor: '#F7B801',
  },
  queenOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginLeft: 8,
  },
  queenOptionTextSelected: {
    color: 'white',
  },
  temperamentSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  temperamentOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8D5B7',
  },
  temperamentOptionSelected: {
    backgroundColor: '#F7B801',
    borderColor: '#F7B801',
  },
  temperamentOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7355',
    marginLeft: 4,
  },
  temperamentOptionTextSelected: {
    color: 'white',
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
  varroaResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  varroaResultText: {
    marginLeft: 12,
  },
  varroaPerDay: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  varroaLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  specialActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  specialActionButton: {
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
  specialActionButtonActive: {
    backgroundColor: '#8FBC8F',
    borderColor: '#8FBC8F',
  },
  specialActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginLeft: 8,
  },
  specialActionTextActive: {
    color: 'white',
  },
  treatmentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  treatmentOption: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    marginBottom: 8,
  },
  treatmentOptionSelected: {
    backgroundColor: '#F7B801',
    borderColor: '#F7B801',
  },
  treatmentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  treatmentOptionTextSelected: {
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
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Thermometer, FileText, Save, Crown, Bug, Activity, Layers, Cloud, Snowflake, Shield, Scissors } from 'lucide-react-native';
import { Eye, Heart, Zap, Droplets, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// OpenAI integration for inspection analysis
const OPENAI_API_KEY = 'your-openai-api-key-here'; // This should be in environment variables

const analyzeInspectionWithAI = async (inspectionData) => {
  try {
    const prompt = `
Analysera denna biodlarinspektionsdata och ge konkreta iakttagelser och rekommendationer på svenska:

Kupa: ${inspectionData.hive}
Datum: ${inspectionData.date}
Väder: ${inspectionData.weather}
Yngelramar: ${inspectionData.broodFrames}/${inspectionData.totalFrames}
Drottning sedd: ${inspectionData.queenSeen === true ? 'Ja' : inspectionData.queenSeen === false ? 'Nej' : 'Osäker'}
Temperament: ${inspectionData.temperament || 'Ej angivet'}
Varroa/dag: ${inspectionData.varroaPerDay || 'Ej mätt'}
Invintring: ${inspectionData.isWintering ? 'Ja' : 'Nej'}
Varroabehandling: ${inspectionData.isVarroaTreatment ? 'Ja' : 'Nej'}
Anteckningar: ${inspectionData.notes || 'Inga'}

Ge svar i följande JSON-format:
{
  "observations": ["observation1", "observation2", ...],
  "recommendations": ["rekommendation1", "rekommendation2", ...],
  "status": "excellent|good|warning|critical",
  "priority_actions": ["åtgärd1", "åtgärd2", ...],
  "next_inspection": "antal_dagar"
}

Fokusera på praktiska biodlarråd baserat på säsong, väder och kupens tillstånd.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du är en erfaren biodlarexpert som ger praktiska råd baserat på inspektionsdata.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return analysis;
  } catch (error) {
    console.log('AI analysis failed:', error);
    // Fallback to basic analysis
    return generateBasicAnalysis(inspectionData);
  }
};

const generateBasicAnalysis = (inspectionData) => {
  const observations = [];
  const recommendations = [];
  let status = 'good';
  const priority_actions = [];
  
  // Basic analysis logic
  if (inspectionData.queenSeen === false) {
    observations.push('Drottning ej sedd - kan vara drottninglös');
    recommendations.push('Kontrollera för drottningceller eller lägg till ny drottning');
    status = 'critical';
    priority_actions.push('Drottningkontroll inom 3 dagar');
  }
  
  if (inspectionData.varroaPerDay > 5) {
    observations.push(`Hög varroabelastning (${inspectionData.varroaPerDay}/dag)`);
    recommendations.push('Genomför varroabehandling omedelbart');
    status = 'critical';
    priority_actions.push('Varroabehandling inom 1 vecka');
  }
  
  if (inspectionData.broodFrames < inspectionData.totalFrames * 0.3) {
    observations.push('Låg yngelproduktion');
    recommendations.push('Kontrollera drottningens äggläggning och näringstillgång');
  }
  
  return {
    observations,
    recommendations,
    status,
    priority_actions,
    next_inspection: status === 'critical' ? '3' : status === 'warning' ? '7' : '14'
  };
};
export default function AddInspectionScreen() {
  const [selectedHive, setSelectedHive] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState('Hämtar väderdata...');
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
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [customObservation, setCustomObservation] = useState('');

  const [availableHives, setAvailableHives] = useState<string[]>([]);

  // Load available hives when component mounts
  useEffect(() => {
    const loadHives = async () => {
      try {
        const savedHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
        const hiveNames = savedHives.map(hive => hive.name);
        if (hiveNames.length === 0) {
          // Default hives if none exist
          setAvailableHives(['Kupa Alpha', 'Kupa Beta', 'Kupa Gamma']);
        } else {
          setAvailableHives(hiveNames);
        }
      } catch (error) {
        console.log('Could not load hives:', error);
        setAvailableHives(['Kupa Alpha', 'Kupa Beta', 'Kupa Gamma']);
      }
    };
    
    loadHives();
  }, []);

  // Convert Open-Meteo weather codes to Swedish descriptions
  const getWeatherDescription = (code: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Klart',
      1: 'Mestadels klart',
      2: 'Delvis molnigt',
      3: 'Molnigt',
      45: 'Dimma',
      48: 'Rimfrost',
      51: 'Lätt duggregn',
      53: 'Måttligt duggregn',
      55: 'Kraftigt duggregn',
      56: 'Lätt frysande duggregn',
      57: 'Kraftigt frysande duggregn',
      61: 'Lätt regn',
      63: 'Måttligt regn',
      65: 'Kraftigt regn',
      66: 'Lätt frysande regn',
      67: 'Kraftigt frysande regn',
      71: 'Lätt snöfall',
      73: 'Måttligt snöfall',
      75: 'Kraftigt snöfall',
      77: 'Snökorn',
      80: 'Lätta regnskurar',
      81: 'Måttliga regnskurar',
      82: 'Kraftiga regnskurar',
      85: 'Lätta snöskurar',
      86: 'Kraftiga snöskurar',
      95: 'Åska',
      96: 'Åska med lätt hagel',
      99: 'Åska med kraftigt hagel'
    };
    
    return weatherCodes[code] || 'Okänt väder';
  };

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
    const getWeatherData = async () => {
      try {
        // Request location permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setWeather('Platsåtkomst nekad - ange väder manuellt');
          return;
        }

        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Fetch weather from Open-Meteo
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Stockholm`
        );
        
        if (!response.ok) {
          throw new Error('Kunde inte hämta väderdata');
        }

        const data = await response.json();
        const current = data.current;
        
        // Convert weather code to Swedish description
        const weatherDescription = getWeatherDescription(current.weather_code);
        const temp = Math.round(current.temperature_2m);
        const windSpeed = Math.round(current.wind_speed_10m);
        
        const weatherString = `${weatherDescription}, ${temp}°C, vind ${windSpeed} m/s`;
        setWeather(weatherString);
        setTemperature(temp.toString());
        
      } catch (error) {
        console.log('Weather fetch error:', error);
        setWeather('Kunde inte hämta väder - ange manuellt');
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
    console.log('Starting to save inspection...');
    
    if (!selectedHive) {
      Alert.alert('Fel', 'Välj en kupa att inspektera');
      return;
    }
    if (!broodFrames || !totalFrames) {
      Alert.alert('Fel', 'Ange antal yngel- och totalramar');
      return;
    }

    console.log('Validation passed, creating inspection...');

    const broodFramesNum = parseInt(broodFrames);
    const totalFramesNum = parseInt(totalFrames);
    
    if (broodFramesNum > totalFramesNum) {
      Alert.alert('Fel', 'Antal yngelramar kan inte vara fler än totala ramar');
      return;
    }

    console.log('Creating inspection object...');

    // Create inspection object
    const newInspection = {
      id: Date.now(),
      hive: selectedHive,
      date,
      time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
      weather,
      temperature: parseFloat(temperature),
      duration: '30 min', // Default duration
      broodFrames: broodFramesNum,
      totalFrames: totalFramesNum,
      queenSeen,
      temperament,
      varroaCount: varroaCount ? parseFloat(varroaCount) : null,
      varroaDays: varroaDays ? parseFloat(varroaDays) : null,
      varroaPerDay,
      varroaLevel,
      observations: selectedObservations,
      customObservation: customObservation.trim() || null,
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
      rating: 3, // Will be updated by AI analysis
      findings: [], // Will be populated by AI analysis
      aiAnalysis: null, // Will be populated by AI
    };

    console.log('Analyzing inspection with AI...');

    // Save inspection to AsyncStorage
    const saveInspection = async () => {
      try {
        // Get AI analysis
        const aiAnalysis = await analyzeInspectionWithAI(newInspection);
        
        // Update inspection with AI analysis
        newInspection.aiAnalysis = aiAnalysis;
        newInspection.findings = aiAnalysis.observations || [];
        newInspection.rating = aiAnalysis.status === 'excellent' ? 5 : 
                              aiAnalysis.status === 'good' ? 4 : 
                              aiAnalysis.status === 'warning' ? 3 : 2;
        
        const existingInspections = JSON.parse(await AsyncStorage.getItem('inspections') || '[]');
        console.log('Existing inspections:', existingInspections.length);
        
        const updatedInspections = [...existingInspections, newInspection];
        await AsyncStorage.setItem('inspections', JSON.stringify(updatedInspections));
        console.log('Inspection saved successfully');

        // Calculate hive status and population based on AI analysis
        const calculateHiveStatus = () => {
          return aiAnalysis.status || 'good';
        };

        const calculatePopulation = (broodFrames) => {
          if (broodFrames >= 8) return 'Stark';
          if (broodFrames >= 5) return 'Medel';
          return 'Svag';
        };

        // If new queen was added, update the hive data
        if (newQueenAdded) {
          console.log('Updating hive with new queen...');
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
                lastInspection: date,
                status: calculateHiveStatus(),
                population: calculatePopulation(broodFramesNum),
                varroa: varroaPerDay ? `${varroaPerDay.toFixed(1)}/dag` : hive.varroa,
                frames: `${broodFramesNum}/${totalFramesNum}`,
              };
            }
            return hive;
          });
          await AsyncStorage.setItem('hives', JSON.stringify(updatedHives));
        } else {
          console.log('Updating hive data...');
          // Update hive data even if no new queen
          const existingHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
          const updatedHives = existingHives.map(hive => {
            if (hive.name === selectedHive) {
              return {
                ...hive,
                lastInspection: date,
                status: calculateHiveStatus(),
                population: calculatePopulation(broodFramesNum),
                varroa: varroaPerDay ? `${varroaPerDay.toFixed(1)}/dag` : hive.varroa,
                frames: `${broodFramesNum}/${totalFramesNum}`,
              };
            }
            return hive;
          });
          await AsyncStorage.setItem('hives', JSON.stringify(updatedHives));
        }
        
        console.log('All data saved successfully');
        
        // Show AI recommendations in alert
        const recommendationsText = aiAnalysis.recommendations ? 
          aiAnalysis.recommendations.slice(0, 2).join('\n• ') : 
          'Inga specifika rekommendationer';
          
        Alert.alert(
          'Inspektion analyserad!', 
          `AI-analys för ${selectedHive}:\n\n• ${recommendationsText}${aiAnalysis.priority_actions?.length > 0 ? '\n\nPrioriterade åtgärder:\n• ' + aiAnalysis.priority_actions[0] : ''}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } catch (error) {
        console.error('Could not save inspection:', error);
        Alert.alert('Fel', 'Kunde inte spara inspektionen. Försök igen.');
      }
    };

    saveInspection();
  };

  // Calculate inspection rating based on observations and data
  const calculateInspectionRating = () => {
    let score = 3; // Start with neutral
    
    // Positive factors
    if (queenSeen === true) score += 1;
    if (varroaPerDay && varroaPerDay <= 2) score += 1;
    if (temperament === 'Lugn') score += 0.5;
    if (selectedObservations.includes('brood-pattern')) score += 0.5;
    if (selectedObservations.includes('pop-strong')) score += 0.5;
    
    // Negative factors
    if (queenSeen === false) score -= 1;
    if (varroaPerDay && varroaPerDay > 5) score -= 1;
    if (temperament === 'Aggressiv') score -= 0.5;
    if (selectedObservations.includes('brood-disease')) score -= 2;
    if (selectedObservations.includes('pop-weak')) score -= 1;
    
    return Math.max(1, Math.min(5, Math.round(score)));
  };

  // Calculate hive status based on inspection data
  const calculateHiveStatus = (inspection) => {
    if (inspection.varroaPerDay > 5 || inspection.queenSeen === false) {
      return 'critical';
    }
    if (inspection.varroaPerDay > 2 || inspection.temperament === 'Aggressiv') {
      return 'warning';
    }
    if (inspection.queenSeen === true && inspection.varroaPerDay <= 2) {
      return 'excellent';
    }
    return 'good';
  };

  // Calculate population based on brood frames
  const calculatePopulation = (broodFrames) => {
    if (broodFrames >= 8) return 'Stark';
    if (broodFrames >= 5) return 'Medel';
    return 'Svag';
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
                {availableHives.map((hive) => (
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
              <View style={[styles.inputContainer, { backgroundColor: weather.includes('Hämtar') || weather.includes('Kunde inte') ? '#FFF8E1' : '#F0F8E8' }]}>
                <Cloud size={20} color="#8FBC8F" />
                <TextInput
                  style={styles.input}
                  value={weather}
                  onChangeText={setWeather}
                  placeholder="Väderdata..."
                  editable={true}
                  placeholderTextColor="#8B7355"
                />
              </View>
              <Text style={styles.weatherNote}>
                Väderdata hämtas automatiskt från din plats. Du kan redigera om det behövs.
              </Text>
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
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 50,
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
    fontSize: 11,
    fontWeight: '600',
    color: '#8B7355',
    marginLeft: 6,
    textAlign: 'center',
    flexShrink: 1,
    lineHeight: 14,
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
  weatherNote: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 4,
    fontStyle: 'italic',
  },
  observationCategory: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  observationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  observationButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  observationButtonSelected: {
    backgroundColor: '#8FBC8F',
    borderColor: '#8FBC8F',
  },
  observationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  observationText: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  observationTextSelected: {
    color: 'white',
  },
});
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, MapPin, Thermometer, Droplets, Activity, TriangleAlert as AlertTriangle, Crown, Scissors, Trash2, ChevronRight } from 'lucide-react-native';
import { Snowflake, Baby, OctagonAlert as AlertOctagon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// HJÄLPFUNKTIONER (Helper Functions)
// ============================================

// Beräkna drottningens ålder baserat på när den lades till
const calculateQueenAge = (addedDate: string) => {
  if (!addedDate) return null;
  const added = new Date(addedDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - added.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} dagar`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} månad${months > 1 ? 'er' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} år${remainingMonths > 0 ? ` ${remainingMonths} mån` : ''}`;
  }
};

// Få färg baserat på kupstatus
const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return '#8FBC8F'; // Grön
    case 'good': return '#F7B801';      // Gul
    case 'warning': return '#FF8C42';   // Orange
    case 'critical': return '#E74C3C';  // Röd
    default: return '#8B7355';          // Grå
  }
};

// Få text baserat på kupstatus
const getStatusText = (status: string) => {
  switch (status) {
    case 'excellent': return 'Utmärkt';
    case 'good': return 'Bra';
    case 'warning': return 'Varning';
    case 'critical': return 'Kritisk';
    default: return 'Okänd';
  }
};

// ============================================
// HUVUDKOMPONENT (Main Component)
// ============================================

export default function HivesScreen() {
  // ============================================
  // STATE VARIABLER (State Variables)
  // ============================================
  const [hives, setHives] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // ============================================
  // DATA LADDNING (Data Loading)
  // ============================================
  useEffect(() => {
    const loadHives = async () => {
      try {
        const savedHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
        if (savedHives.length === 0) {
          // Standardkupor om inga är sparade
          const defaultHives = [
            {
              id: 1,
              name: 'Kupa Alpha',
              location: 'Norra ängen',
              lastInspection: '2024-01-15',
              status: 'excellent',
              population: 'Stark',
              varroa: '1.2/dag',
              honey: '25 kg',
              frames: '18/20',
              hasQueen: true,
              queenMarked: true,
              queenColor: 'yellow',
              queenWingClipped: false,
              queenAddedDate: '2024-01-01',
            },
            {
              id: 2,
              name: 'Kupa Beta',
              location: 'Södra skogen',
              lastInspection: '2024-01-12',
              status: 'good',
              population: 'Medel',
              varroa: '3.2/dag',
              honey: '18 kg',
              frames: '14/20',
              hasQueen: true,
              queenMarked: false,
              queenColor: null,
              queenWingClipped: true,
              queenAddedDate: '2023-12-15',
            },
            {
              id: 3,
              name: 'Kupa Gamma',
              location: 'Östra fältet',
              lastInspection: '2024-01-10',
              status: 'warning',
              population: 'Svag',
              varroa: '6.8/dag',
              honey: '8 kg',
              frames: '10/20',
              hasQueen: false,
              queenMarked: null,
              queenColor: null,
              queenWingClipped: null,
              queenAddedDate: null,
            },
          ];
          setHives(defaultHives);
          await AsyncStorage.setItem('hives', JSON.stringify(defaultHives));
        } else {
          setHives(savedHives);
        }
      } catch (error) {
        console.log('Could not load hives from AsyncStorage:', error);
        setHives([]);
      }
    };
    
    loadHives();
  }, []);

  // ============================================
  // KONSTANTER (Constants)
  // ============================================
  
  // Färger för drottningmärkning
  const queenColors = {
    white: '#FFFFFF',
    yellow: '#FFD700',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
  };

  // ============================================
  // HÄNDELSEHANTERARE (Event Handlers)
  // ============================================

  // Hantera radering av kupa
  const handleDeleteHive = (hiveId: number, hiveName: string) => {
    Alert.alert(
      'Radera kupa',
      `Är du säker på att du vill radera ${hiveName}? Detta kan inte ångras.`,
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Radera',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedHives = hives.filter(hive => hive.id !== hiveId);
              setHives(updatedHives);
              await AsyncStorage.setItem('hives', JSON.stringify(updatedHives));
              
              // Also remove related inspections
              const existingInspections = JSON.parse(await AsyncStorage.getItem('inspections') || '[]');
              const updatedInspections = existingInspections.filter(inspection => inspection.hive !== hiveName);
              await AsyncStorage.setItem('inspections', JSON.stringify(updatedInspections));
              
            } catch (error) {
              console.log('Could not delete hive:', error);
            }
          },
        },
      ]
    );
  };

  // Hantera klick på plats
  const handleLocationPress = (location: string) => {
    setSelectedLocation(location);
  };

  // Gå tillbaka till platsvy
  const handleBackToLocations = () => {
    setSelectedLocation('');
  };

  // ============================================
  // BERÄKNADE VÄRDEN (Calculated Values)
  // ============================================
  
  // Få unika platser från kupor
  const locations = [...new Set(hives.map(hive => hive.location))];
  
  // Få kupor för vald plats
  const hivesInLocation = selectedLocation 
    ? hives.filter(hive => hive.location === selectedLocation)
    : [];

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
          <View style={styles.headerLeft}>
            {selectedLocation && (
              <TouchableOpacity style={styles.backToLocationsButton} onPress={handleBackToLocations}>
                <Text style={styles.backToLocationsText}>← Platser</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>
              {selectedLocation ? selectedLocation : 'Mina kupor'}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-hive')}>
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {!selectedLocation ? (
            // Show locations
            <>
              {locations.map((location) => {
                const hivesAtLocation = hives.filter(hive => hive.location === location);
                return (
                  <TouchableOpacity 
                    key={location} 
                    style={styles.locationCard}
                    onPress={() => handleLocationPress(location)}
                  >
                    <View style={styles.locationHeader}>
                      <View>
                        <Text style={styles.locationName}>{location}</Text>
                        <Text style={styles.locationCount}>
                          {hivesAtLocation.length} kup{hivesAtLocation.length !== 1 ? 'or' : 'a'}
                        </Text>
                        {/* Visa indikatorer för speciella kupor på denna plats */}
                        <View style={styles.hiveIndicators}>
                          {hivesAtLocation.some(hive => hive.isNucleus) && (
                            <View style={styles.indicator}>
                              <Baby size={12} color="#8FBC8F" />
                            </View>
                          )}
                          {hivesAtLocation.some(hive => hive.isWintered) && (
                            <View style={styles.indicator}>
                              <Snowflake size={12} color="#87CEEB" />
                            </View>
                          )}
                          {hivesAtLocation.some(hive => !hive.hasQueen) && (
                            <View style={styles.indicator}>
                              <AlertOctagon size={12} color="#E74C3C" />
                            </View>
                          )}
                        </View>
                      </View>
                      <ChevronRight size={24} color="#8B7355" />
                    </View>
                    
                    <View style={styles.locationStats}>
                      {hivesAtLocation.slice(0, 3).map((hive, index) => (
                        <View key={hive.id} style={styles.locationHivePreview}>
                          <Text style={styles.previewHiveName}>{hive.name}</Text>
                          <View style={[styles.previewStatus, { backgroundColor: getStatusColor(hive.status) }]} />
                        </View>
                      ))}
                      {hivesAtLocation.length > 3 && (
                        <Text style={styles.moreHives}>+{hivesAtLocation.length - 3} till</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              <TouchableOpacity style={styles.addHiveCard} onPress={() => router.push('/add-hive')}>
                <Plus size={32} color="#8B7355" />
                <Text style={styles.addHiveText}>Lägg till ny kupa</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Show hives for selected location
            <>
              {hivesInLocation.map((hive) => (
                <TouchableOpacity 
                  key={hive.id} 
                  style={styles.hiveCard}
                  onPress={() => router.push({
                    pathname: '/hive-details',
                    params: { hiveId: hive.id }
                  })}
                >
                  <View style={styles.hiveHeader}>
                    <View>
                      <Text style={styles.hiveName}>{hive.name}</Text>
                      <View style={styles.locationRow}>
                        <MapPin size={14} color="#8B7355" />
                        <Text style={styles.location}>{hive.location}</Text>
                        {hive.hasQueen && (
                          <View style={styles.queenInfo}>
                            <Crown 
                              size={14} 
                              color={hive.queenMarked && hive.queenColor ? queenColors[hive.queenColor] : '#F7B801'} 
                              fill={hive.queenMarked && hive.queenColor ? queenColors[hive.queenColor] : '#F7B801'}
                            />
                            {hive.queenWingClipped && (
                              <Scissors size={12} color="#8B7355" style={{ marginLeft: 4 }} />
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(hive.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(hive.status) }]}>
                        {getStatusText(hive.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Activity size={16} color="#8B7355" />
                      <Text style={styles.statLabel}>Population</Text>
                      <Text style={styles.statValue}>{hive.population}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <AlertTriangle size={16} color="#E74C3C" />
                      <Text style={styles.statLabel}>Varroa</Text>
                      <Text style={[styles.statValue, { color: parseFloat(hive.varroa) > 5 ? '#E74C3C' : parseFloat(hive.varroa) > 2 ? '#FF8C42' : '#8FBC8F' }]}>
                        {hive.varroa}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Droplets size={16} color="#F7B801" />
                      <Text style={styles.statLabel}>Honung</Text>
                      <Text style={styles.statValue}>{hive.honey}</Text>
                    </View>
                  </View>

                  <View style={styles.hiveFooter}>
                    <Text style={styles.lastInspection}>
                      Senaste inspektion: {hive.lastInspection}
                    </Text>
                    <View style={styles.footerRight}>
                      <Text style={styles.frames}>Ramar: {hive.frames}</Text>
                      {hive.hasQueen && hive.queenAddedDate && (
                        <Text style={styles.queenAge}>
                          Drottning: {calculateQueenAge(hive.queenAddedDate)}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity style={styles.addHiveCard} onPress={() => router.push('/add-hive')}>
                <Plus size={32} color="#8B7355" />
                <Text style={styles.addHiveText}>Lägg till ny kupa</Text>
              </TouchableOpacity>
            </>
          )}
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
  headerLeft: {
    flex: 1,
  },
  backToLocationsButton: {
    marginBottom: 4,
  },
  backToLocationsText: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  addButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hiveCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  hiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hiveName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#8B7355',
    marginLeft: 4,
  },
  queenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  hiveFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8D5B7',
  },
  lastInspection: {
    fontSize: 12,
    color: '#8B7355',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  frames: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  queenAge: {
    fontSize: 10,
    color: '#8B7355',
    marginTop: 2,
  },
  hiveIndicators: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 4,
  },
  indicator: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addHiveCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    borderStyle: 'dashed',
  },
  addHiveText: {
    fontSize: 16,
    color: '#8B7355',
    marginTop: 8,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  locationCount: {
    fontSize: 14,
    color: '#8B7355',
  },
  locationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationHivePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewHiveName: {
    fontSize: 12,
    color: '#8B7355',
    marginRight: 8,
  },
  previewStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreHives: {
    fontSize: 12,
    color: '#8B7355',
    fontStyle: 'italic',
  },
});
// ============================================
// STILAR (Styles)
// ============================================
// Alla stilar är organiserade logiskt efter komponentstruktur
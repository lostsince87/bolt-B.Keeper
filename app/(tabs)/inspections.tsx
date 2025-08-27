import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Calendar, Cloud, FileText, Star, MapPin, ChevronDown, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function InspectionsScreen() {
  const [searchText, setSearchText] = useState('');
  const [inspections, setInspections] = useState([]);
  const [hives, setHives] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedHive, setSelectedHive] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showHivePicker, setShowHivePicker] = useState(false);

  useEffect(() => {
    // Load inspections and hives from localStorage
    try {
      const savedInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
      const savedHives = JSON.parse(localStorage.getItem('hives') || '[]');
      
      if (savedInspections.length === 0) {
        // Default inspections if none saved
        const defaultInspections = [
          {
            id: 1,
            hive: 'Kupa Alpha',
            date: '2024-01-15',
            time: '14:30',
            weather: 'Soligt, 18°C',
            duration: '45 min',
            rating: 5,
            notes: 'Mycket aktiv samhälle. Drottningen sedd och märkt. God byggtakt på nya ramar.',
            findings: ['Drottning sedd', 'Yngel i alla stadier', 'Varroa: 1.2/dag (lågt)'],
          },
          {
            id: 2,
            hive: 'Kupa Beta',
            date: '2024-01-12',
            time: '10:15',
            weather: 'Molnigt, 15°C',
            duration: '30 min',
            rating: 4,
            notes: 'Normalt beteende. Lite varroamiter upptäckta på botten. Planera behandling.',
            findings: ['Varroa: 3.2/dag (normalt)', 'Honung i övre magasin', 'Behöver mer plats'],
          },
          {
            id: 3,
            hive: 'Kupa Gamma',
            date: '2024-01-10',
            time: '16:00',
            weather: 'Regnigt, 12°C',
            duration: '20 min',
            rating: 2,
            notes: 'Svag aktivitet. Drottningen inte sedd. Misstänker drottninglöshet.',
            findings: ['Drottning ej sedd', 'Få bin', 'Varroa: 6.8/dag (högt)'],
          },
        ];
        setInspections(defaultInspections);
        localStorage.setItem('inspections', JSON.stringify(defaultInspections));
      } else {
        setInspections(savedInspections);
      }
      
      setHives(savedHives);
    } catch (error) {
      console.log('Could not load inspections from localStorage:', error);
      setInspections([]);
    }
  }, []);

  // Get unique locations from hives
  const locations = [...new Set(hives.map(hive => hive.location))];
  
  // Get hives for selected location
  const hivesInLocation = selectedLocation 
    ? hives.filter(hive => hive.location === selectedLocation)
    : [];
  
  // Filter inspections based on selected hive
  const filteredInspections = selectedHive 
    ? inspections.filter(inspection => inspection.hive === selectedHive)
    : inspections;

  const handleInspectionPress = (inspection) => {
    router.push({
      pathname: '/inspection-details',
      params: { 
        inspectionId: inspection.id,
        fromHiveId: null // No hive context from inspections list
      }
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#8FBC8F';
    if (rating >= 3) return '#F7B801';
    return '#FF8C42';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? '#F7B801' : '#E8D5B7'}
        fill={index < rating ? '#F7B801' : 'transparent'}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Inspektioner</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-inspection')}>
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedLocation && styles.filterButtonActive]}
              onPress={() => setShowLocationPicker(!showLocationPicker)}
            >
              <MapPin size={16} color={selectedLocation ? 'white' : '#8B7355'} />
              <Text style={[styles.filterText, selectedLocation && styles.filterTextActive]}>
                {selectedLocation || 'Välj plats'}
              </Text>
              <ChevronDown size={16} color={selectedLocation ? 'white' : '#8B7355'} />
            </TouchableOpacity>
            
            {selectedLocation && (
              <TouchableOpacity 
                style={[styles.filterButton, selectedHive && styles.filterButtonActive]}
                onPress={() => setShowHivePicker(!showHivePicker)}
              >
                <Text style={[styles.filterText, selectedHive && styles.filterTextActive]}>
                  {selectedHive || 'Välj kupa'}
                </Text>
                <ChevronDown size={16} color={selectedHive ? 'white' : '#8B7355'} />
              </TouchableOpacity>
            )}
          </View>
          
          {showLocationPicker && (
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={styles.pickerOption}
                onPress={() => {
                  setSelectedLocation('');
                  setSelectedHive('');
                  setShowLocationPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>Alla platser</Text>
              </TouchableOpacity>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedLocation(location);
                    setSelectedHive('');
                    setShowLocationPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{location}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {showHivePicker && selectedLocation && (
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={styles.pickerOption}
                onPress={() => {
                  setSelectedHive('');
                  setShowHivePicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>Alla kupor</Text>
              </TouchableOpacity>
              {hivesInLocation.map((hive) => (
                <TouchableOpacity
                  key={hive.id}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSelectedHive(hive.name);
                    setShowHivePicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{hive.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredInspections.length === 0 ? (
            <View style={styles.noInspections}>
              <FileText size={32} color="#8B7355" />
              <Text style={styles.noInspectionsText}>
                {selectedHive 
                  ? `Inga inspektioner för ${selectedHive}`
                  : 'Inga inspektioner hittades'
                }
              </Text>
            </View>
          ) : (
            filteredInspections.map((inspection) => (
              <TouchableOpacity 
                key={inspection.id} 
                style={styles.inspectionCard}
                onPress={() => handleInspectionPress(inspection)}
              >
              <View style={styles.inspectionHeader}>
                <View>
                  <Text style={styles.hiveName}>{inspection.hive}</Text>
                  <View style={styles.dateRow}>
                    <Calendar size={14} color="#8B7355" />
                    <Text style={styles.date}>{inspection.date}</Text>
                    <Text style={styles.time}>{inspection.time}</Text>
                  </View>
                </View>
                <View style={styles.ratingContainer}>
                  <View style={styles.starsRow}>
                    {renderStars(inspection.rating)}
                  </View>
                  <Text style={styles.duration}>{inspection.duration}</Text>
                </View>
              </View>

              <View style={styles.weatherRow}>
                <Cloud size={16} color="#8B7355" />
                <Text style={styles.weather}>{inspection.weather}</Text>
              </View>

              <View style={styles.findingsContainer}>
                <Text style={styles.findingsTitle}>Iakttagelser:</Text>
                <View style={styles.findingsList}>
                  {inspection.findings.map((finding, index) => (
                    <View key={index} style={styles.findingItem}>
                      <View style={styles.findingDot} />
                      <Text style={styles.findingText}>{finding}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.notesContainer}>
                <View style={styles.notesHeader}>
                  <FileText size={16} color="#8B7355" />
                  <Text style={styles.notesTitle}>Anteckningar:</Text>
                </View>
                <Text style={styles.notes}>{inspection.notes}</Text>
              </View>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={styles.addInspectionCard} onPress={() => router.push('/add-inspection')}>
            <Plus size={32} color="#8B7355" />
            <Text style={styles.addInspectionText}>Lägg till ny inspektion</Text>
          </TouchableOpacity>
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
    paddingBottom: 10,
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
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#F7B801',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginHorizontal: 8,
  },
  filterTextActive: {
    color: 'white',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#8B4513',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inspectionCard: {
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
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hiveName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#8B7355',
    marginLeft: 4,
  },
  time: {
    fontSize: 14,
    color: '#8B7355',
    marginLeft: 8,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#8B7355',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D5B7',
  },
  weather: {
    fontSize: 14,
    color: '#8B7355',
    marginLeft: 6,
  },
  findingsContainer: {
    marginBottom: 16,
  },
  findingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  findingsList: {
    paddingLeft: 8,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  findingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F7B801',
    marginRight: 8,
  },
  findingText: {
    fontSize: 14,
    color: '#8B7355',
  },
  notesContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginLeft: 6,
  },
  notes: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
  },
  addInspectionCard: {
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
  addInspectionText: {
    fontSize: 16,
    color: '#8B7355',
    marginTop: 8,
    fontWeight: '600',
  },
  noInspections: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noInspectionsText: {
    fontSize: 16,
    color: '#8B7355',
    marginTop: 12,
    textAlign: 'center',
  },
});
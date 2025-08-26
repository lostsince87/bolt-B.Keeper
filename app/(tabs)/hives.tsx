import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, MapPin, Thermometer, Droplets, Activity, TriangleAlert as AlertTriangle, Crown, Scissors, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export default function HivesScreen() {
  const [hives, setHives] = useState([]);

  useEffect(() => {
    // Load hives from localStorage
    try {
      const savedHives = JSON.parse(localStorage.getItem('hives') || '[]');
      if (savedHives.length === 0) {
        // Default hives if none saved
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
        localStorage.setItem('hives', JSON.stringify(defaultHives));
      } else {
        setHives(savedHives);
      }
    } catch (error) {
      console.log('Could not load hives from localStorage:', error);
      setHives([]);
    }
  }, []);

  const queenColors = {
    white: '#FFFFFF',
    yellow: '#FFD700',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#8FBC8F';
      case 'good': return '#F7B801';
      case 'warning': return '#FF8C42';
      case 'critical': return '#E74C3C';
      default: return '#8B7355';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Utmärkt';
      case 'good': return 'Bra';
      case 'warning': return 'Varning';
      case 'critical': return 'Kritisk';
      default: return 'Okänd';
    }
  };

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
          onPress: () => {
            try {
              const updatedHives = hives.filter(hive => hive.id !== hiveId);
              setHives(updatedHives);
              localStorage.setItem('hives', JSON.stringify(updatedHives));
              
              // Also remove related inspections
              const existingInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
              const updatedInspections = existingInspections.filter(inspection => inspection.hive !== hiveName);
              localStorage.setItem('inspections', JSON.stringify(updatedInspections));
              
            } catch (error) {
              console.log('Could not delete hive:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mina kupor</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-hive')}>
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {hives.map((hive) => (
            <TouchableOpacity 
              key={hive.id} 
              style={styles.hiveCard}
              onPress={() => router.push({
                pathname: '/hive-details',
                params: { hiveId: hive.id }
              })}
            >
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteHive(hive.id, hive.name)}
              >
                <Trash2 size={16} color="#E74C3C" />
              </TouchableOpacity>
              
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
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
});
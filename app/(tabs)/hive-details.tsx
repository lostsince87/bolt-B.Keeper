import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Calendar, Crown, Scissors, Activity, Droplets, Bug, FileText, CreditCard as Edit, Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HiveDetailsScreen() {
  const { hiveId } = useLocalSearchParams();
  const [hive, setHive] = useState(null);
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    // Load hive data
    const loadHiveData = async () => {
      try {
        const savedHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
        const foundHive = savedHives.find(h => h.id.toString() === hiveId);
        setHive(foundHive);

        // Load inspections for this hive
        const savedInspections = JSON.parse(await AsyncStorage.getItem('inspections') || '[]');
        const hiveInspections = savedInspections
          .filter(inspection => inspection.hive === foundHive?.name)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setInspections(hiveInspections);
      } catch (error) {
        console.log('Could not load hive data:', error);
      }
    };
    
    loadHiveData();
  }, [hiveId]);

  if (!hive) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
          <Text>Kupa hittades inte</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const queenColors = {
    white: '#FFFFFF',
    yellow: '#FFD700',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
  };

  const calculateQueenAge = (addedDate) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#8FBC8F';
      case 'good': return '#F7B801';
      case 'warning': return '#FF8C42';
      case 'critical': return '#E74C3C';
      default: return '#8B7355';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'excellent': return 'Utmärkt';
      case 'good': return 'Bra';
      case 'warning': return 'Varning';
      case 'critical': return 'Kritisk';
      default: return 'Ny kupa';
    }
  };

  // Få detaljerad statustext baserat på kupdata
  const getDetailedStatusText = (hive) => {
    if (hive.status === 'critical') {
      if (hive.hasQueen === false) {
        return 'Drottninglös - Behöver ny drottning';
      }
      const varroaValue = parseFloat(hive.varroa);
      if (varroaValue > 5) {
        return `Kritisk varroa (${hive.varroa}) - Behandling krävs omedelbart`;
      }
      return 'Kritisk situation - Kräver omedelbar åtgärd';
    }
    
    if (hive.status === 'warning') {
      const issues = [];
      const varroaValue = parseFloat(hive.varroa);
      
      if (varroaValue > 2 && varroaValue <= 5) {
        issues.push(`Förhöjd varroa (${hive.varroa}) - Övervaka noga`);
      }
      if (hive.population === 'Svag') {
        issues.push('Svag population - Kontrollera näring och sjukdomar');
      }
      if (hive.frames) {
        const [brood, total] = hive.frames.split('/').map(Number);
        if (brood < total * 0.3) {
          issues.push('Lite yngel - Kontrollera drottningens äggläggning');
        }
      }
      
      return issues.length > 0 ? issues.join('\n• ') : 'Varning - Kräver uppmärksamhet';
    }
    
    if (hive.status === 'excellent') return 'Utmärkt tillstånd';
    if (hive.status === 'good') return 'Bra tillstånd';
    return 'Ny kupa - Väntar på första inspektion för att bedöma tillstånd';
  };

  const handleInspectionPress = (inspection) => {
    router.push({
      pathname: '/inspection-details',
      params: { 
        inspectionId: inspection.id,
        fromHiveId: hive.id
      }
    });
  };

  const handleBack = () => {
    router.push('/hives');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.title}>{hive.name}</Text>
          <TouchableOpacity 
            style={styles.addInspectionButton}
            onPress={() => router.push('/add-inspection')}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hive Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View>
                <Text style={styles.hiveName}>{hive.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={16} color="#8B7355" />
                  <Text style={styles.location}>{hive.location}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(hive.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(hive.status) }]}>
                  {hive.status === 'critical' && hive.hasQueen === false ? 'Drottninglös' : 
                   hive.status === 'warning' ? 'Varning' : 
                   hive.status === 'excellent' ? 'Utmärkt' : 
                   hive.status === 'good' ? 'Bra' : 'Okänd'}
                </Text>
              </View>
            </View>

            {(hive.status === 'warning' || hive.status === 'critical') && (
              <View style={[styles.warningDetails, { 
                backgroundColor: getStatusColor(hive.status) + '10',
                borderLeftColor: getStatusColor(hive.status)
              }]}>
                <Text style={[styles.warningText, { color: getStatusColor(hive.status) }]}>
                  {getDetailedStatusText(hive)}
                </Text>
              </View>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Activity size={20} color="#8B7355" />
                <Text style={styles.statValue}>{hive.population}</Text>
                <Text style={styles.statLabel}>Population</Text>
              </View>
              <View style={styles.statCard}>
                <Bug size={20} color="#E74C3C" />
                <Text style={[styles.statValue, { 
                  color: parseFloat(hive.varroa) > 5 ? '#E74C3C' : 
                         parseFloat(hive.varroa) > 2 ? '#FF8C42' : '#8FBC8F' 
                }]}>
                  {hive.varroa}
                </Text>
                <Text style={styles.statLabel}>Varroa</Text>
              </View>
              <View style={styles.statCard}>
                <Droplets size={20} color="#F7B801" />
                <Text style={styles.statValue}>{hive.honey}</Text>
                <Text style={styles.statLabel}>Honung</Text>
              </View>
              <View style={styles.statCard}>
                <FileText size={20} color="#8B7355" />
                <Text style={styles.statValue}>{hive.frames}</Text>
                <Text style={styles.statLabel}>Ramar</Text>
              </View>
            </View>

            {hive.hasQueen && (
              <View style={styles.queenSection}>
                <Text style={styles.sectionTitle}>Drottninginformation</Text>
                <View style={styles.queenInfo}>
                  <Crown 
                    size={24} 
                    color={hive.queenMarked && hive.queenColor ? queenColors[hive.queenColor] : '#F7B801'} 
                    fill={hive.queenMarked && hive.queenColor ? queenColors[hive.queenColor] : '#F7B801'}
                  />
                  <View style={styles.queenDetails}>
                    <Text style={styles.queenText}>
                      Drottning finns {hive.queenMarked ? '(märkt)' : '(omärkt)'}
                    </Text>
                    {hive.queenAddedDate && (
                      <Text style={styles.queenAge}>
                        Ålder: {calculateQueenAge(hive.queenAddedDate)}
                      </Text>
                    )}
                    {hive.queenWingClipped && (
                      <View style={styles.queenFeature}>
                        <Scissors size={16} color="#8B7355" />
                        <Text style={styles.queenFeatureText}>Vingklippt</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Inspections Section */}
          <View style={styles.inspectionsSection}>
            <Text style={styles.sectionTitle}>Inspektioner ({inspections.length})</Text>
            {inspections.length === 0 ? (
              <View style={styles.noInspections}>
                <FileText size={32} color="#8B7355" />
                <Text style={styles.noInspectionsText}>Inga inspektioner registrerade</Text>
                <TouchableOpacity 
                  style={styles.addFirstInspectionButton}
                  onPress={() => router.push('/add-inspection')}
                >
                  <Text style={styles.addFirstInspectionText}>Lägg till första inspektion</Text>
                </TouchableOpacity>
              </View>
            ) : (
              inspections.map((inspection) => (
                <TouchableOpacity 
                  key={inspection.id} 
                  style={styles.inspectionCard}
                  onPress={() => handleInspectionPress(inspection)}
                >
                  <View style={styles.inspectionHeader}>
                    <View>
                      <View style={styles.inspectionDate}>
                        <Calendar size={16} color="#8B7355" />
                        <Text style={styles.dateText}>{inspection.date}</Text>
                      </View>
                      <Text style={styles.weatherText}>{inspection.weather}</Text>
                    </View>
                    <View style={styles.inspectionStats}>
                      <Text style={styles.framesText}>
                        {inspection.broodFrames}/{inspection.totalFrames} ramar
                      </Text>
                      {inspection.varroaPerDay && (
                        <Text style={[styles.varroaText, {
                          color: inspection.varroaPerDay > 5 ? '#E74C3C' : 
                                 inspection.varroaPerDay > 2 ? '#FF8C42' : '#8FBC8F'
                        }]}>
                          {inspection.varroaPerDay.toFixed(1)} varroa/dag
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {inspection.notes && (
                    <Text style={styles.inspectionNotes} numberOfLines={2}>
                      {inspection.notes}
                    </Text>
                  )}
                  
                  <View style={styles.inspectionFooter}>
                    <View style={styles.inspectionTags}>
                      {inspection.queenSeen === true && (
                        <View style={styles.tag}>
                          <Crown size={12} color="#F7B801" />
                          <Text style={styles.tagText}>Drottning sedd</Text>
                        </View>
                      )}
                      {inspection.isVarroaTreatment && (
                        <View style={[styles.tag, { backgroundColor: '#E74C3C20' }]}>
                          <Text style={[styles.tagText, { color: '#E74C3C' }]}>Behandling</Text>
                        </View>
                      )}
                      {inspection.isWintering && (
                        <View style={[styles.tag, { backgroundColor: '#8FBC8F20' }]}>
                          <Text style={[styles.tagText, { color: '#8FBC8F' }]}>Invintring</Text>
                        </View>
                      )}
                    </View>
                    <Edit size={16} color="#8B7355" />
                  </View>
                </TouchableOpacity>
              ))
            )}
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
  addInspectionButton: {
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  hiveName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#8B7355',
    marginLeft: 4,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B7355',
  },
  queenSection: {
    borderTopWidth: 1,
    borderTopColor: '#E8D5B7',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
  },
  queenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queenDetails: {
    marginLeft: 12,
    flex: 1,
  },
  queenText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  queenAge: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 4,
  },
  queenFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queenFeatureText: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 4,
  },
  warningDetails: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  inspectionsSection: {
    marginBottom: 100,
  },
  noInspections: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
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
    marginBottom: 16,
  },
  addFirstInspectionButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addFirstInspectionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inspectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inspectionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginLeft: 4,
  },
  weatherText: {
    fontSize: 12,
    color: '#8B7355',
  },
  inspectionStats: {
    alignItems: 'flex-end',
  },
  framesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 2,
  },
  varroaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inspectionNotes: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 12,
    lineHeight: 20,
  },
  inspectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectionTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7B80120',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F7B801',
    marginLeft: 4,
  },
});
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Thermometer, Cloud, Crown, Scissors, Bug, Activity, Layers, FileText, Edit, Snowflake, Shield } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

export default function InspectionDetailsScreen() {
  const { inspectionId } = useLocalSearchParams();
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    // Load inspection data
    try {
      const savedInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
      const foundInspection = savedInspections.find(i => i.id.toString() === inspectionId);
      setInspection(foundInspection);
    } catch (error) {
      console.log('Could not load inspection data:', error);
    }
  }, [inspectionId]);

  if (!inspection) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
          <Text>Inspektion hittades inte</Text>
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

  const getVarroaLevelColor = (level) => {
    switch (level) {
      case 'lågt': return '#8FBC8F';
      case 'normalt': return '#F7B801';
      case 'högt': return '#E74C3C';
      default: return '#8B7355';
    }
  };

  const handleEdit = () => {
    Alert.alert(
      'Redigera inspektion',
      'Redigeringsfunktion kommer snart!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.title}>Inspektionsdetaljer</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Edit size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Basic Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Grundinformation</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Kupa</Text>
                <Text style={styles.infoValue}>{inspection.hive}</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={20} color="#8B7355" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Datum</Text>
                  <Text style={styles.infoValue}>{inspection.date}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.weatherSection}>
              <Cloud size={20} color="#8B7355" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Väder</Text>
                <Text style={styles.infoValue}>{inspection.weather}</Text>
              </View>
              <Thermometer size={20} color="#8B7355" />
              <Text style={styles.temperatureText}>{inspection.temperature}°C</Text>
            </View>
          </View>

          {/* Hive Stats Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kupstatistik</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Layers size={24} color="#8B7355" />
                <Text style={styles.statValue}>{inspection.broodFrames}</Text>
                <Text style={styles.statLabel}>Yngelramar</Text>
              </View>
              <View style={styles.statCard}>
                <Layers size={24} color="#8B7355" />
                <Text style={styles.statValue}>{inspection.totalFrames}</Text>
                <Text style={styles.statLabel}>Totala ramar</Text>
              </View>
              {inspection.temperament && (
                <View style={styles.statCard}>
                  <Activity size={24} color="#8B7355" />
                  <Text style={styles.statValue}>{inspection.temperament}</Text>
                  <Text style={styles.statLabel}>Temperament</Text>
                </View>
              )}
            </View>
          </View>

          {/* Queen Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Drottninginformation</Text>
            <View style={styles.queenSection}>
              <View style={styles.queenStatus}>
                <Crown 
                  size={24} 
                  color={inspection.queenSeen === true ? '#F7B801' : '#8B7355'} 
                  fill={inspection.queenSeen === true ? '#F7B801' : 'transparent'}
                />
                <Text style={styles.queenStatusText}>
                  {inspection.queenSeen === true ? 'Drottning sedd' : 
                   inspection.queenSeen === false ? 'Drottning ej sedd' : 'Osäker'}
                </Text>
              </View>
              
              {inspection.newQueenAdded && (
                <View style={styles.newQueenSection}>
                  <Text style={styles.newQueenTitle}>Ny drottning tillagd</Text>
                  <View style={styles.queenDetails}>
                    <Text style={styles.queenDetailText}>
                      Märkt: {inspection.newQueenMarked ? 'Ja' : 'Nej'}
                    </Text>
                    {inspection.newQueenMarked && inspection.newQueenColor && (
                      <View style={styles.colorIndicator}>
                        <View 
                          style={[
                            styles.colorDot, 
                            { backgroundColor: queenColors[inspection.newQueenColor] }
                          ]} 
                        />
                        <Text style={styles.colorText}>
                          {inspection.newQueenColor.charAt(0).toUpperCase() + inspection.newQueenColor.slice(1)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.queenFeature}>
                      <Scissors size={16} color="#8B7355" />
                      <Text style={styles.queenDetailText}>
                        Vingklippt: {inspection.newQueenWingClipped ? 'Ja' : 'Nej'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Varroa Card */}
          {inspection.varroaPerDay && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Varroaanalys</Text>
              <View style={styles.varroaSection}>
                <Bug size={32} color={getVarroaLevelColor(inspection.varroaLevel)} />
                <View style={styles.varroaInfo}>
                  <Text style={[styles.varroaValue, { color: getVarroaLevelColor(inspection.varroaLevel) }]}>
                    {inspection.varroaPerDay.toFixed(1)} varroa/dag
                  </Text>
                  <Text style={[styles.varroaLevel, { color: getVarroaLevelColor(inspection.varroaLevel) }]}>
                    {inspection.varroaLevel?.toUpperCase()} NIVÅ
                  </Text>
                  <Text style={styles.varroaDetails}>
                    {inspection.varroaCount} varroa på {inspection.varroaDays} dagar
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Special Actions Card */}
          {(inspection.isWintering || inspection.isVarroaTreatment) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Specialåtgärder</Text>
              <View style={styles.specialActions}>
                {inspection.isWintering && (
                  <View style={styles.specialAction}>
                    <Snowflake size={24} color="#8FBC8F" />
                    <View style={styles.actionInfo}>
                      <Text style={styles.actionTitle}>Invintring</Text>
                      {inspection.winterFeed && (
                        <Text style={styles.actionDetail}>
                          Vinterfoder: {inspection.winterFeed} kg
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                
                {inspection.isVarroaTreatment && (
                  <View style={styles.specialAction}>
                    <Shield size={24} color="#E74C3C" />
                    <View style={styles.actionInfo}>
                      <Text style={styles.actionTitle}>Varroabehandling</Text>
                      {inspection.treatmentType && (
                        <Text style={styles.actionDetail}>
                          Typ: {inspection.treatmentType}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Notes Card */}
          {inspection.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Anteckningar</Text>
              <View style={styles.notesSection}>
                <FileText size={20} color="#8B7355" />
                <Text style={styles.notesText}>{inspection.notes}</Text>
              </View>
            </View>
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
  editButton: {
    backgroundColor: '#F7B801',
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
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  weatherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
  },
  temperatureText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 'auto',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    gap: 16,
  },
  queenStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
  },
  queenStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginLeft: 12,
  },
  newQueenSection: {
    backgroundColor: '#F7B80110',
    borderRadius: 12,
    padding: 16,
  },
  newQueenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7B801',
    marginBottom: 12,
  },
  queenDetails: {
    gap: 8,
  },
  queenDetailText: {
    fontSize: 14,
    color: '#8B7355',
  },
  colorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#8B7355',
  },
  colorText: {
    fontSize: 14,
    color: '#8B7355',
  },
  queenFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  varroaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  varroaInfo: {
    marginLeft: 16,
    flex: 1,
  },
  varroaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  varroaLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  varroaDetails: {
    fontSize: 12,
    color: '#8B7355',
  },
  specialActions: {
    gap: 16,
  },
  specialAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  actionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  actionDetail: {
    fontSize: 14,
    color: '#8B7355',
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, MapPin, Thermometer, Droplets, Activity, TriangleAlert as AlertTriangle, Crown, Scissors, Trash2, ChevronRight, Share2, Users, LogOut } from 'lucide-react-native';
import { Snowflake, Baby, OctagonAlert as AlertOctagon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Alert, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

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
    default: return 'Ny kupa';
  }
};

// Få detaljerad statustext baserat på kupdata
const getDetailedStatusText = (hive) => {
  if (hive.status === 'critical') {
    if (hive.hasQueen === false) {
      return 'Drottninglöst';
    }
    const varroaValue = parseFloat(hive.varroa);
    if (varroaValue > 5) {
      return `Kritisk varroa (${hive.varroa})`;
    }
    return 'Kritisk';
  }
  
  if (hive.status === 'warning') {
    const issues = [];
    const varroaValue = parseFloat(hive.varroa);
    
    if (varroaValue > 2 && varroaValue <= 5) {
      issues.push(`Förhöjd varroa (${hive.varroa})`);
    }
    if (hive.population === 'Svag') {
      issues.push('Svag population');
    }
    if (hive.frames) {
      const [brood, total] = hive.frames.split('/').map(Number);
      if (brood < total * 0.3) {
        issues.push('Lite yngel');
      }
    }
    
    return issues.length > 0 ? issues.join(', ') : 'Varning';
  }
  
  if (hive.status === 'excellent') return 'Utmärkt';
  if (hive.status === 'good') return 'Bra';
  return 'Ny kupa - Väntar på första inspektion';
};
// ============================================
// HUVUDKOMPONENT (Main Component)
// ============================================

export default function HivesScreen() {
  // ============================================
  // STATE VARIABLER (State Variables)
  // ============================================
  const [apiaries, setApiaries] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedApiary, setSelectedApiary] = useState(null);
  const mountedRef = useRef(true);

  // ============================================
  // DATA LADDNING (Data Loading)
  // ============================================
  useEffect(() => {
    mountedRef.current = true;
    
    const loadApiaries = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Load apiaries from Supabase if user is logged in
          await loadApiariesFromSupabase();
        } else {
          // Load from AsyncStorage if not logged in
          await loadApiariesFromStorage();
        }
      } catch (error) {
        console.log('Could not load apiaries from AsyncStorage:', error);
        await loadApiariesFromStorage(); // Fallback to local storage
      }
    };
    
    loadApiaries();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadApiariesFromSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Hämta användarens profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Hämta bigårdar där användaren är medlem
      const { data: membershipData } = await supabase
        .from('apiary_members')
        .select(`
          role,
          apiaries (
            id,
            name,
            description,
            location,
            owner_id,
            invite_code,
            created_at
          )
        `)
        .eq('profile_id', profile.id);

      // Hämta bigårdar från delad åtkomst
      const { data: sharedApiaries } = await supabase
        .from('shared_access')
        .select(`
          access_level,
          apiaries (
            id,
            name,
            description,
            location,
            owner_id,
            invite_code,
            created_at
          )
        `)
        .eq('profile_id', profile.id)
        .eq('resource_type', 'apiary');

      // Kombinera alla bigårdar
      const allApiaries = [];
      
      // Lägg till medlemskap-bigårdar
      if (membershipData) {
        membershipData.forEach(membership => {
          if (membership.apiaries) {
            allApiaries.push({
              ...membership.apiaries,
              role: membership.role,
              isOwner: membership.apiaries.owner_id === profile.id,
              isShared: membership.apiaries.owner_id !== profile.id,
              hives: [] // Kommer laddas senare när bigård väljs
            });
          }
        });
      }

      // Lägg till delade bigårdar
      if (sharedApiaries) {
        sharedApiaries.forEach(shared => {
          if (shared.apiaries) {
            allApiaries.push({
              ...shared.apiaries,
              role: shared.access_level,
              isOwner: false,
              isShared: true,
              hives: [] // Kommer laddas senare när bigård väljs
            });
          }
        });
      }

      if (mountedRef.current) {
        setApiaries(allApiaries);
      }
    } catch (error) {
      console.error('Error loading apiaries from Supabase:', error);
      if (mountedRef.current) {
        await loadApiariesFromStorage(); // Fallback
      }
    }
  };

  const loadApiariesFromStorage = async () => {
    try {
      const savedHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
      const validHives = savedHives.filter(hive => hive && typeof hive === 'object' && hive.id);
      
      if (validHives.length === 0) {
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
            isNucleus: false,
            isWintered: false,
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
            isNucleus: false,
            isWintered: true,
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
            isNucleus: false,
            isWintered: false,
          },
        ];
        
        // Gruppera i en default bigård
        const defaultApiary = {
          id: 'local-default',
          name: 'Min bigård',
          location: 'Lokal lagring',
          isOwner: true,
          isShared: false,
          role: 'owner',
          hives: defaultHives
        };
        
        if (mountedRef.current) {
          setApiaries([defaultApiary]);
        }
        await AsyncStorage.setItem('hives', JSON.stringify(defaultHives));
      } else {
        const localApiary = {
          id: 'local',
          name: 'Mina kupor',
          location: 'Lokal lagring',
          isOwner: true,
          isShared: false,
          role: 'owner',
          hives: validHives
        };
        if (mountedRef.current) {
          setApiaries([localApiary]);
        }
      }
    } catch (error) {
      console.log('Error loading from storage:', error);
      if (mountedRef.current) {
        setApiaries([]);
      }
    }
  };

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
              const updatedApiaries = apiaries.map(apiary => ({
                ...apiary,
                hives: apiary.hives.filter(hive => hive.id !== hiveId)
              }));
              setApiaries(updatedApiaries);
              
              const allHives = updatedApiaries.flatMap(a => a.hives);
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

  // Hantera klick på bigård
  const handleApiaryPress = async (apiary) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && apiary.id !== 'local' && apiary.id !== 'local-default') {
        // Ladda kupor för vald bigård från Supabase
        const { data: hiveData } = await supabase
          .from('hives')
          .select('*')
          .eq('apiary_id', apiary.id);

        // Hämta även individuellt delade kupor
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        const { data: sharedHives } = await supabase
          .from('shared_access')
          .select(`
            hives (*)
          `)
          .eq('profile_id', profile?.id)
          .eq('resource_type', 'hive');

        const allHives = [
          ...(hiveData || []).map(hive => ({
            id: hive.id,
            name: hive.name,
            location: hive.location || apiary.location || 'Okänd plats',
            lastInspection: hive.last_inspection,
            status: hive.status,
            population: hive.population,
            varroa: hive.varroa,
            honey: hive.honey,
            frames: hive.frames,
            hasQueen: hive.has_queen,
            queenMarked: hive.queen_marked,
            queenColor: hive.queen_color,
            queenWingClipped: hive.queen_wing_clipped,
            queenAddedDate: hive.queen_added_date,
            isNucleus: hive.is_nucleus,
            isWintered: hive.is_wintered,
            notes: hive.notes,
            isShared: false
          })),
          ...(sharedHives?.map(sh => sh.hives).filter(Boolean) || []).map(hive => ({
            id: hive.id,
            name: hive.name,
            location: hive.location || 'Okänd plats',
            lastInspection: hive.last_inspection,
            status: hive.status,
            population: hive.population,
            varroa: hive.varroa,
            honey: hive.honey,
            frames: hive.frames,
            hasQueen: hive.has_queen,
            queenMarked: hive.queen_marked,
            queenColor: hive.queen_color,
            queenWingClipped: hive.queen_wing_clipped,
            queenAddedDate: hive.queen_added_date,
            isNucleus: hive.is_nucleus,
            isWintered: hive.is_wintered,
            notes: hive.notes,
            isShared: true
          }))
        ];

        if (mountedRef.current) {
          setSelectedApiary({
            ...apiary,
            hives: allHives
          });
        }
      } else {
        // Lokal bigård - använd befintliga kupor
        if (mountedRef.current) {
          setSelectedApiary(apiary);
        }
      }
    } catch (error) {
      console.error('Error loading hives for apiary:', error);
      if (mountedRef.current) {
        setSelectedApiary(apiary); // Fallback
      }
    }
  };

  // Gå tillbaka till bigårdsvy
  const handleBackToApiaries = () => {
    if (mountedRef.current) {
      setSelectedApiary(null);
    }
  };

  // Lämna delad bigård/kupa
  const leaveSharedResource = async (apiary) => {
    Alert.alert(
      'Lämna delning',
      `Är du säker på att du vill lämna "${apiary.name}"? Du kommer inte längre ha åtkomst till denna bigård.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Lämna', style: 'destructive', onPress: () => {
          // Implementera leave-funktionalitet här
          Alert.alert('Info', 'Funktionen kommer snart!');
        }}
      ]
    );
  };

  // Skapa och dela kod för specifik kupa
  const createAndShareHiveCode = async (hive) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Fel', 'Du måste vara inloggad för att dela kupor');
        return;
      }

      // Hämta användarens profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        Alert.alert('Fel', 'Användarprofil hittades inte');
        return;
      }

      // Skapa delningskod för kupan
      const { data: sharingCode, error } = await supabase
        .from('sharing_codes')
        .insert({
          resource_type: 'hive',
          resource_id: hive.id,
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      // Dela koden
      const shareResult = await Share.share({
        message: `Gå med och hjälp till med min bikupa "${hive.name}"!\n\nAnvänd delningskoden: ${sharingCode.code}\n\nLadda ner B.Keeper appen och gå till Inställningar > Gå med i bigård`,
        title: `Inbjudan till ${hive.name}`
      });
      
      console.log('Hive share result:', shareResult);
    } catch (error) {
      console.error('Error creating hive sharing code:', error);
      Alert.alert('Fel', 'Kunde inte skapa delningskod för kupan: ' + error.message);
    }
  };

  // Skapa och dela kod för bigård
  const createAndShareApiaryCode = async (apiary) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Fel', 'Du måste vara inloggad för att dela bigårdar');
        return;
      }

      // Hämta användarens profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        Alert.alert('Fel', 'Användarprofil hittades inte');
        return;
      }

      // Skapa delningskod för bigården
      const { data: sharingCode, error } = await supabase
        .from('sharing_codes')
        .insert({
          resource_type: 'apiary',
          resource_id: apiary.id,
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      // Dela koden
      const shareResult = await Share.share({
        message: `Gå med i min B.Keeper bigård "${apiary.name}"!\n\nAnvänd delningskoden: ${sharingCode.code}\n\nLadda ner B.Keeper appen och gå till Inställningar > Gå med i bigård`,
        title: `Inbjudan till ${apiary.name}`
      });
      
      console.log('Apiary share result:', shareResult);
    } catch (error) {
      console.error('Error sharing apiary:', error);
      Alert.alert('Fel', 'Kunde inte skapa delningskod för bigården: ' + error.message);
    }
  };

  // ============================================
  // BERÄKNADE VÄRDEN (Calculated Values)
  // ============================================
  
  // Få alla kupor från vald bigård
  const hivesInApiary = selectedApiary ? selectedApiary.hives : [];

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
            {selectedApiary && (
              <TouchableOpacity style={styles.backToApiariesButton} onPress={handleBackToApiaries}>
                <Text style={styles.backToApiariesText}>← Bigårdar</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>
              {selectedApiary ? selectedApiary.name : 'Mina bigårdar'}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-hive')}>
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {!selectedApiary ? (
            // Show apiaries
            <>
              {apiaries.map((apiary) => {
                return (
                  <TouchableOpacity 
                    key={apiary.id} 
                    style={[styles.apiaryCard, apiary.isShared && styles.sharedApiaryCard]}
                    onPress={() => handleApiaryPress(apiary)}
                  >
                    <View style={styles.apiaryHeader}>
                      <View>
                        <View style={styles.apiaryTitleRow}>
                          <Text style={styles.apiaryName}>{apiary.name}</Text>
                          {apiary.isShared && (
                            <View style={styles.sharedBadge}>
                              <Users size={12} color="white" />
                              <Text style={styles.sharedBadgeText}>Delad</Text>
                            </View>
                          )}
                        </View>
                        {apiary.description && (
                          <Text style={styles.apiaryDescription}>{apiary.description}</Text>
                        )}
                        <View style={styles.apiaryLocation}>
                          <MapPin size={12} color="#8B7355" />
                          <Text style={styles.locationText}>{apiary.location || 'Okänd plats'}</Text>
                        </View>
                        <View style={styles.roleRow}>
                          <Text style={styles.roleText}>
                            {apiary.role === 'owner' ? 'Ägare' : 
                             apiary.role === 'admin' ? 'Admin' : 'Medlem'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.apiaryActions}>
                        {apiary.isShared ? (
                          <TouchableOpacity 
                            style={styles.leaveButton}
                            onPress={() => leaveSharedResource(apiary)}
                          >
                            <LogOut size={16} color="#E74C3C" />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            style={styles.shareApiaryButton}
                            onPress={() => createAndShareApiaryCode(apiary)}
                          >
                            <Share2 size={16} color="#F7B801" />
                          </TouchableOpacity>
                        )}
                        <ChevronRight size={20} color="#8B7355" />
                      </View>
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
            // Show hives for selected apiary
            <>
              {hivesInApiary.map((hive) => (
                <TouchableOpacity 
                  key={hive.id} 
                  style={[styles.hiveCard, hive.isShared && styles.sharedHiveCard]}
                  onPress={() => router.push({
                    pathname: '/hive-details',
                    params: { hiveId: hive.id }
                  })}
                >
                  <View style={styles.hiveHeader}>
                    <View>
                      <Text style={styles.hiveName}>{hive.name}</Text>
                      {hive.isShared && (
                        <View style={styles.sharedHiveIndicator}>
                          <Users size={12} color="#8FBC8F" />
                          <Text style={styles.sharedHiveText}>Delad kupa</Text>
                        </View>
                      )}
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
                    <View style={styles.statusContainer}>
                      <Text style={[
                        styles.statusDetailText,
                        { color: getStatusColor(hive.status) }
                      ]}>
                        {getDetailedStatusText(hive)}
                      </Text>
                      <Text style={styles.lastInspectionDate}>
                        Senast inspekterad: {hive.lastInspection}
                      </Text>
                    </View>
                    <View style={styles.footerRight}>
                      <TouchableOpacity 
                        style={styles.shareHiveButton}
                        onPress={() => hive.isShared ? null : createAndShareHiveCode(hive)}
                      >
                        <Share2 size={16} color={hive.isShared ? "#8B7355" : "#F7B801"} />
                      </TouchableOpacity>
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
  backToApiariesButton: {
    marginBottom: 4,
  },
  backToApiariesText: {
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
  sharedHiveCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8FBC8F',
  },
  sharedHiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sharedHiveText: {
    fontSize: 12,
    color: '#8FBC8F',
    marginLeft: 4,
    fontWeight: '600',
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
  statusContainer: {
    flex: 1,
  },
  statusDetailText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  lastInspectionDate: {
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
  apiaryCard: {
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
  sharedApiaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8FBC8F',
  },
  apiaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  apiaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  apiaryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginRight: 8,
  },
  sharedBadge: {
    backgroundColor: '#8FBC8F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sharedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  apiaryCount: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 4,
  },
  apiaryDescription: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  roleRow: {
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  apiaryLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 4,
  },
  apiaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareApiaryButton: {
    backgroundColor: '#F7B801' + '20',
    borderRadius: 16,
    padding: 8,
  },
  leaveButton: {
    backgroundColor: '#E74C3C' + '20',
    borderRadius: 16,
    padding: 8,
  },
  apiaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  apiaryHivePreview: {
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
  shareHiveButton: {
    backgroundColor: '#F7B801' + '20',
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
  },
});
// ============================================
// STILAR (Styles)
// ============================================
// Alla stilar är organiserade logiskt efter komponentstruktur
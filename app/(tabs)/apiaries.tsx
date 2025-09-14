import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus, Users, Share2, MapPin, Crown, Copy, Settings, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase, Apiary, ApiaryMember, Profile, SharingCode } from '@/lib/supabase';

export default function ApiariesScreen() {
  const [apiaries, setApiaries] = useState<(Apiary & { members: (ApiaryMember & { profile: Profile })[], role: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newApiaryName, setNewApiaryName] = useState('');
  const [newApiaryLocation, setNewApiaryLocation] = useState('');
  const [newApiaryDescription, setNewApiaryDescription] = useState('');

  useEffect(() => {
    loadApiaries();
  }, []);

  const loadApiaries = async () => {
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
            invite_code,
            created_at,
            apiary_members (
              id,
              role,
              joined_at,
              profiles (
                id,
                full_name,
                email
              )
            )
          )
        `)
        .eq('profile_id', profile.id);

      if (membershipData) {
        const formattedApiaries = membershipData.map(membership => ({
          ...membership.apiaries,
          members: membership.apiaries.apiary_members,
          role: membership.role
        }));
        setApiaries(formattedApiaries);
      }
    } catch (error) {
      console.error('Error loading apiaries:', error);
      Alert.alert('Fel', 'Kunde inte ladda bigårdar');
    } finally {
      setLoading(false);
    }
  };

  const createApiary = async () => {
    if (!newApiaryName.trim()) {
      Alert.alert('Fel', 'Ange ett namn för bigården');
      return;
    }

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

      // Skapa bigård
      const { data: apiary, error: apiaryError } = await supabase
        .from('apiaries')
        .insert({
          name: newApiaryName.trim(),
          description: newApiaryDescription.trim() || null,
          location: newApiaryLocation.trim() || null,
          owner_id: profile.id
        })
        .select()
        .single();

      if (apiaryError) throw apiaryError;

      // Lägg till ägaren som medlem
      const { error: memberError } = await supabase
        .from('apiary_members')
        .insert({
          apiary_id: apiary.id,
          profile_id: profile.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Rensa formulär
      setNewApiaryName('');
      setNewApiaryLocation('');
      setNewApiaryDescription('');
      setShowCreateForm(false);

      // Ladda om bigårdar
      loadApiaries();

      Alert.alert('Framgång!', `Bigården "${newApiaryName}" har skapats`);
    } catch (error) {
      console.error('Error creating apiary:', error);
      Alert.alert('Fel', 'Kunde inte skapa bigård');
    }
  };

  const createAndShareCode = async (apiary: Apiary) => {
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

      // Skapa delningskod
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
      await Share.share({
        message: `Gå med i min B.Keeper bigård "${apiary.name}"!\n\nAnvänd delningskoden: ${sharingCode.code}\n\nLadda ner B.Keeper appen och gå till Inställningar > Gå med i bigård`,
        title: `Inbjudan till ${apiary.name}`
      });
    } catch (error) {
      console.error('Error creating sharing code:', error);
      Alert.alert(
        'Fel',
        'Kunde inte skapa delningskod',
        [
          { text: 'OK' }
        ]
      );
    }
  };

  const copyInviteCode = (code: string) => {
    // I en riktig app skulle vi använda Clipboard API
    Alert.alert('Inbjudningskod', code, [{ text: 'OK' }]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
          <Text style={styles.loadingText}>Laddar bigårdar...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.title}>Mina bigårdar</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {showCreateForm && (
            <View style={styles.createForm}>
              <Text style={styles.formTitle}>Skapa ny bigård</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Namn *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="t.ex. Familjen Anderssons bigård"
                  value={newApiaryName}
                  onChangeText={setNewApiaryName}
                  placeholderTextColor="#8B7355"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Plats</Text>
                <TextInput
                  style={styles.input}
                  placeholder="t.ex. Småland, Sverige"
                  value={newApiaryLocation}
                  onChangeText={setNewApiaryLocation}
                  placeholderTextColor="#8B7355"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Beskrivning</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Beskriv din bigård..."
                  value={newApiaryDescription}
                  onChangeText={setNewApiaryDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#8B7355"
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowCreateForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={createApiary}>
                  <Text style={styles.createButtonText}>Skapa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {apiaries.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#8B7355" />
              <Text style={styles.emptyTitle}>Inga bigårdar än</Text>
              <Text style={styles.emptyText}>
                Skapa din första bigård eller gå med i en befintlig med en inbjudningskod
              </Text>
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => router.push('/join-apiary')}
              >
                <Share2 size={20} color="white" />
                <Text style={styles.joinButtonText}>Gå med i bigård</Text>
              </TouchableOpacity>
            </View>
          ) : (
            apiaries.map((apiary) => (
              <View key={apiary.id} style={styles.apiaryCard}>
                <View style={styles.apiaryHeader}>
                  <View style={styles.apiaryInfo}>
                    <Text style={styles.apiaryName}>{apiary.name}</Text>
                    {apiary.location && (
                      <View style={styles.locationRow}>
                        <MapPin size={14} color="#8B7355" />
                        <Text style={styles.apiaryLocation}>{apiary.location}</Text>
                      </View>
                    )}
                    <View style={styles.roleRow}>
                      {apiary.role === 'owner' && <Crown size={14} color="#F7B801" />}
                      <Text style={[styles.roleText, { color: apiary.role === 'owner' ? '#F7B801' : '#8B7355' }]}>
                        {apiary.role === 'owner' ? 'Ägare' : apiary.role === 'admin' ? 'Admin' : 'Medlem'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => router.push(`/apiary-settings?id=${apiary.id}`)}
                  >
                    <Settings size={20} color="#8B7355" />
                  </TouchableOpacity>
                </View>

                {apiary.description && (
                  <Text style={styles.apiaryDescription}>{apiary.description}</Text>
                )}

                <View style={styles.membersSection}>
                  <Text style={styles.membersTitle}>
                    Medlemmar ({apiary.members.length})
                  </Text>
                  <View style={styles.membersList}>
                    {apiary.members.slice(0, 3).map((member) => (
                      <View key={member.id} style={styles.memberItem}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberInitial}>
                            {member.profile.full_name?.charAt(0) || member.profile.email.charAt(0)}
                          </Text>
                        </View>
                        <Text style={styles.memberName}>
                          {member.profile.full_name || member.profile.email}
                        </Text>
                      </View>
                    ))}
                    {apiary.members.length > 3 && (
                      <Text style={styles.moreMembers}>+{apiary.members.length - 3} till</Text>
                    )}
                  </View>
                </View>

                <View style={styles.apiaryActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push(`/hives?apiary=${apiary.id}`)}
                  >
                    <Text style={styles.actionButtonText}>Visa kupor</Text>
                    <ChevronRight size={16} color="#8B4513" />
                  </TouchableOpacity>
                  
                  {apiary.role === 'owner' && (
                    <TouchableOpacity 
                      style={styles.shareButton}
                      onPress={() => createAndShareCode(apiary)}
                    >
                      <Share2 size={16} color="#F7B801" />
                      <Text style={styles.shareButtonText}>Dela</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
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
  addButton: {
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
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8B7355',
    marginTop: 50,
  },
  createForm: {
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
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#8B4513',
    borderWidth: 1,
    borderColor: '#E8D5B7',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8D5B7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B7355',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#F7B801',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  joinButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  apiaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  apiaryInfo: {
    flex: 1,
  },
  apiaryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  apiaryLocation: {
    fontSize: 14,
    color: '#8B7355',
    marginLeft: 4,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  settingsButton: {
    padding: 8,
  },
  apiaryDescription: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 16,
    lineHeight: 20,
  },
  membersSection: {
    marginBottom: 16,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  membersList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberItem: {
    alignItems: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7B801',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  memberInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 10,
    color: '#8B7355',
    textAlign: 'center',
    maxWidth: 60,
  },
  moreMembers: {
    fontSize: 12,
    color: '#8B7355',
    fontStyle: 'italic',
  },
  apiaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  shareButton: {
    backgroundColor: '#F7B801' + '20',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: '#F7B801',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
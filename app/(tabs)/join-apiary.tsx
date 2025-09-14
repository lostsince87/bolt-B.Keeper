import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Share2, Users, Key } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function JoinApiaryScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const joinApiary = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Fel', 'Ange en inbjudningskod');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_apiary_by_invite_code', {
        invite_code_param: inviteCode.trim()
      });

      if (error) throw error;

      if (data.success) {
        Alert.alert(
          'Välkommen!',
          `Du har gått med i bigården "${data.apiary_name}"`,
          [
            {
              text: 'OK',
              onPress: () => {
                setInviteCode('');
                router.push('/apiaries');
              }
            }
          ]
        );
      } else {
        Alert.alert('Fel', data.error);
      }
    } catch (error) {
      console.error('Error joining apiary:', error);
      Alert.alert('Fel', 'Kunde inte gå med i bigården');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.title}>Gå med i bigård</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Share2 size={48} color="#F7B801" />
            </View>

            <Text style={styles.mainTitle}>Gå med i en bigård</Text>
            <Text style={styles.description}>
              Använd en inbjudningskod för att gå med i en befintlig bigård och börja samarbeta med andra biodlare.
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Inbjudningskod</Text>
                <View style={styles.inputContainer}>
                  <Key size={20} color="#8B7355" />
                  <TextInput
                    style={styles.input}
                    placeholder="t.ex. abc123de"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    placeholderTextColor="#8B7355"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text style={styles.inputHint}>
                  Koden består vanligtvis av 8 tecken och får du från bigårdens ägare
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.joinButton, loading && styles.joinButtonDisabled]} 
                onPress={joinApiary}
                disabled={loading}
              >
                <Users size={24} color="white" />
                <Text style={styles.joinButtonText}>
                  {loading ? 'Går med...' : 'Gå med i bigård'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Vad händer när du går med?</Text>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Du får tillgång till alla kupor i bigården
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Du kan göra inspektioner och se andras inspektioner
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Du kan skapa och tilldela uppgifter till andra medlemmar
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    All data synkroniseras automatiskt mellan alla medlemmar
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Behöver du hjälp?</Text>
              <Text style={styles.helpText}>
                Kontakta personen som bjöd in dig för att få rätt inbjudningskod. 
                Koden är unik för varje bigård och krävs för att gå med.
              </Text>
            </View>
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E8D5B7',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
    marginLeft: 12,
  },
  inputHint: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 6,
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: '#F7B801',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  joinButtonDisabled: {
    backgroundColor: '#E8D5B7',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: 16,
    color: '#F7B801',
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
    flex: 1,
  },
  helpSection: {
    backgroundColor: '#F7B801' + '10',
    borderRadius: 12,
    padding: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F7B801',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
  },
});
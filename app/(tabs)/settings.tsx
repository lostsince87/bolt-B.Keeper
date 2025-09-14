import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Bell, Shield, Database, CircleHelp as HelpCircle, Info, ChevronRight, Moon, Globe } from 'lucide-react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const settingsSections = [
    {
      title: 'Konto',
      items: [
        {
          icon: User,
          title: 'Profil',
          subtitle: 'Redigera personlig information',
          action: 'navigation',
        },
        {
          icon: Bell,
          title: 'Notifikationer',
          subtitle: 'Påminnelser och varningar',
          action: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Moon,
          title: 'Mörkt läge',
          subtitle: 'Aktivera mörkt tema',
          action: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      title: 'Data & Säkerhet',
      items: [
        {
          icon: Database,
          title: 'Automatisk säkerhetskopiering',
          subtitle: 'Säkerhetskopiera data dagligen',
          action: 'toggle',
          value: autoBackup,
          onToggle: setAutoBackup,
        },
        {
          icon: Shield,
          title: 'Integritet',
          subtitle: 'Hantera datainställningar',
          action: 'navigation',
        },
        {
          icon: Database,
          title: 'Exportera data',
          subtitle: 'Ladda ner all biodlardata',
          action: 'navigation',
        },
      ],
    },
    {
      title: 'Allmänt',
      items: [
        {
          icon: Globe,
          title: 'Språk',
          subtitle: 'Svenska',
          action: 'navigation',
        },
        {
          icon: HelpCircle,
          title: 'Hjälp & Support',
          subtitle: 'Vanliga frågor och kontakt',
          action: 'navigation',
        },
        {
          icon: Info,
          title: 'Om B.Keeper',
          subtitle: 'Version 1.0.0',
          action: 'navigation',
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, sectionIndex: number, itemIndex: number) => {
    return (
      <TouchableOpacity 
        key={`${sectionIndex}-${itemIndex}`} 
        style={styles.settingItem}
        disabled={item.action === 'toggle'}
      >
        <View style={styles.settingIcon}>
          <item.icon size={24} color="#8B4513" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.settingAction}>
          {item.action === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E8D5B7', true: '#F7B801' }}
              thumbColor={item.value ? 'white' : '#8B7355'}
            />
          ) : (
            <ChevronRight size={20} color="#8B7355" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Inställningar</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <User size={32} color="white" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Lars Andersson</Text>
              <Text style={styles.profileEmail}>lars.andersson@email.com</Text>
              <Text style={styles.profileStats}>Biodlare sedan 2018 • 12 aktiva kupor</Text>
            </View>
          </View>

          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => 
                  renderSettingItem(item, sectionIndex, itemIndex)
                )}
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              B.Keeper - Din digitala biodlarassistent
            </Text>
            <Text style={styles.versionText}>
              Version 1.0.0 • Utvecklad med ❤️ för biodlare
            </Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7B801',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 4,
  },
  profileStats: {
    fontSize: 12,
    color: '#8B7355',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7B801' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8B7355',
  },
  settingAction: {
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'center',
  },
});
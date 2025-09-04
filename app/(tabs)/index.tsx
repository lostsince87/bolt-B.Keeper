import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Briefcase, FileText, Droplets, TrendingUp, CircleAlert as AlertCircle, Calendar, Activity, Plus, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { BeehiveIcon } from '@/components/BeehiveIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [selectedStats, setSelectedStats] = useState(['hives', 'inspections', 'honey', 'varroa']);
  const [selectedStats, setSelectedStats] = useState(['hives', 'inspections', 'honey', 'nucleus']);
  const [tasks, setTasks] = useState([]);
  const [hives, setHives] = useState([]);
  const [showActionMenu, setShowActionMenu] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const loadData = async () => {
      try {
        const savedTasks = JSON.parse(await AsyncStorage.getItem('tasks') || '[]');
        const savedHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
      
        if (savedTasks.length === 0) {
          // Default tasks if none saved
          const defaultTasks = [
            { id: 1, task: 'Inspektera Kupa 3', date: 'Idag', priority: 'hög', color: '#E74C3C' },
            { id: 2, task: 'Varroabehandling Kupa 7-9', date: 'Imorgon', priority: 'medel', color: '#F39C12' },
            { id: 3, task: 'Honung slungning', date: '3 dagar', priority: 'låg', color: '#8FBC8F' },
          ];
          setTasks(defaultTasks);
          await AsyncStorage.setItem('tasks', JSON.stringify(defaultTasks));
        } else {
          // Convert saved tasks to display format
          const displayTasks = savedTasks.map(task => ({
            ...task,
            color: task.priority === 'hög' ? '#E74C3C' : task.priority === 'medel' ? '#F39C12' : '#8FBC8F'
          }));
          setTasks(displayTasks);
        }

        if (savedHives.length === 0) {
          // Default hive data for calculations
          const defaultHiveData = [
            { id: 1, name: 'Kupa Alpha', lastInspection: { broodFrames: 8, totalFrames: 18, varroaPerDay: 1.2 } },
            { id: 2, name: 'Kupa Beta', lastInspection: { broodFrames: 6, totalFrames: 14, varroaPerDay: 3.2 } },
            { id: 3, name: 'Kupa Gamma', lastInspection: { broodFrames: 4, totalFrames: 10, varroaPerDay: 6.8 } },
          ];
          setHives(defaultHiveData);
        } else {
          setHives(savedHives);
        }
      } catch (error) {
        console.log('Could not load data from AsyncStorage:', error);
      }
    };
    
    loadData();
  }, []);

  // Beräkna genomsnittlig population baserat på yngelramar
  const calculateAveragePopulation = () => {
    if (hives.length === 0) return 'Ingen data';
    const totalBroodFrames = hives.reduce((sum, hive) => sum + (hive.lastInspection?.broodFrames || 0), 0);
    const avgBroodFrames = totalBroodFrames / hives.length;
    
    // Klassificering baserat på genomsnittligt antal yngelramar
    if (avgBroodFrames >= 7) return 'Stark';
    if (avgBroodFrames >= 5) return 'Medel';
    return 'Svag';
  };

  // Beräkna genomsnittlig varroa
  const calculateAverageVarroa = () => {
    if (hives.length === 0) return '0.0';
    const totalVarroa = hives.reduce((sum, hive) => sum + (hive.lastInspection?.varroaPerDay || 0), 0);
    return (totalVarroa / hives.length).toFixed(1);
  };

  // Beräkna antal avläggare senaste året
  const calculateNucleusThisYear = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return hives.filter(hive => {
      if (!hive.isNucleus || !hive.createdAt) return false;
      const createdDate = new Date(hive.createdAt);
      return createdDate >= oneYearAgo;
    }).length;
  };

  const allStats = [
    { 
      id: 'hives',
      title: 'Aktiva kupor', 
      value: hives.length.toString(), 
      icon: BeehiveIcon, 
      color: '#FF8C42' 
    },
    { 
      id: 'inspections',
      title: 'Inspektioner denna månad', 
      value: '8', 
      icon: FileText, 
      color: '#8FBC8F' 
    },
    { 
      id: 'honey',
      title: 'Honungsskörd i år', 
      value: '145 kg', 
      icon: Droplets, 
      color: '#F7B801' 
    },
    { 
      id: 'varroa',
      title: 'Snitt varroa/dag', 
      value: `${calculateAverageVarroa()}`, 
      icon: TrendingUp, 
      color: '#E74C3C' 
    },
    { 
      id: 'population',
      title: 'Genomsnittlig population', 
      value: calculateAveragePopulation(), 
      icon: Activity, 
      color: '#8FBC8F' 
    },
    { 
      id: 'nucleus',
      title: 'Avläggare senaste året', 
      value: calculateNucleusThisYear().toString(), 
      icon: Plus, 
      color: '#8FBC8F' 
    },
  ];

  const quickActions = [
    { 
      id: 'harvest',
      title: 'Skattning',
      icon: Droplets,
      color: '#F7B801',
      route: '/add-harvest'
    },
    {
      id: 'hive',
      title: 'Ny kupa',
      icon: BeehiveIcon,
      color: '#FF8C42',
      route: '/add-hive'
    },
    {
      id: 'inspection',
      title: 'Inspektion',
      icon: FileText,
      color: '#8FBC8F',
      route: '/add-inspection'
    },
    {
      id: 'task',
      title: 'Ny uppgift',
      icon: Plus,
      color: '#E74C3C',
      route: '/add-task'
    },
  ];

  const availableStats = allStats.filter(stat => selectedStats.includes(stat.id));

  const handleActionPress = (route: string) => {
    setShowActionMenu(false);
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Snabbstatistik</Text>

            <View style={styles.statsGrid}>
              {availableStats.map((stat, index) => (
                <TouchableOpacity key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <stat.icon size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kommande uppgifter</Text>
              <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={() => router.push('/add-task')}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>
            {tasks && tasks.map((task, index) => (
              <TouchableOpacity key={index} style={styles.taskCard}>
                <View style={[styles.taskPriority, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.task}</Text>
                  <View style={styles.taskMeta}>
                    <Calendar size={14} color="#8B7355" />
                    <Text style={styles.taskDate}>{task.date}</Text>
                    <Text style={[styles.taskPriorityText, { color: task.color }]}>
                      <Text>• {task.priority.toUpperCase()} PRIORITET</Text>
                    </Text>
                  </View>
                </View>
                <AlertCircle size={20} color={task.color} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.actionMenuContainer}>
              <TouchableOpacity 
                style={styles.plusButton}
                onPress={() => setShowActionMenu(!showActionMenu)}
              >
                {showActionMenu ? (
                  <X size={32} color="white" />
                ) : (
                  <Plus size={32} color="white" />
                )}
              </TouchableOpacity>
              
              {showActionMenu && (
                <View style={styles.actionMenu}>
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={[styles.actionMenuItem, { backgroundColor: action.color }]}
                      onPress={() => handleActionPress(action.route)}
                    >
                      <action.icon size={24} color="white" />
                      <Text style={styles.actionMenuText}>{action.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  logo: {
    height: 100,
    width: 160,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 11,
    color: '#8B7355',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskPriority: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 4,
    marginRight: 8,
  },
  taskPriorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionMenuContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 120, // Mer marginal så plus-knappen inte täcks av docken
  },
  plusButton: {
    backgroundColor: '#F7B801',
    borderRadius: 35,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionMenu: {
    position: 'absolute',
    bottom: 90, // Flytta menyn lite högre upp
    alignItems: 'center',
    gap: 12,
    maxWidth: '100%', // Förhindra att menyn går utanför skärmen
  },
  actionMenuItem: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minWidth: 180, // Mindre bredd så den inte går utanför skärmen
    maxWidth: 250, // Max bredd för att förhindra overflow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionMenuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
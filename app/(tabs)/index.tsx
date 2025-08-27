import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Briefcase, FileText, Droplets, TrendingUp, CircleAlert as AlertCircle, Calendar, Settings, Activity, Plus, Bug, Thermometer, Crown, Scissors, Shield, Snowflake, BarChart3, Eye } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { BeehiveIcon } from '@/components/BeehiveIcon';

export default function HomeScreen() {
  const [selectedStats, setSelectedStats] = useState(['hives', 'inspections', 'honey', 'varroa']);
  const [showStatsSelector, setShowStatsSelector] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [hives, setHives] = useState([]);
  const [selectedQuickActions, setSelectedQuickActions] = useState(['new-inspection', 'new-harvest', 'new-hive', 'varroa-check']);
  const [showQuickActionsSelector, setShowQuickActionsSelector] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    try {
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const savedHives = JSON.parse(localStorage.getItem('hives') || '[]');
      
      if (savedTasks.length === 0) {
        // Default tasks if none saved
        const defaultTasks = [
          { id: 1, task: 'Inspektera Kupa 3', date: 'Idag', priority: 'hög', color: '#E74C3C' },
          { id: 2, task: 'Varroabehandling Kupa 7-9', date: 'Imorgon', priority: 'medel', color: '#F39C12' },
          { id: 3, task: 'Honung slungning', date: '3 dagar', priority: 'låg', color: '#8FBC8F' },
        ];
        setTasks(defaultTasks);
        localStorage.setItem('tasks', JSON.stringify(defaultTasks));
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

      // Load quick actions preferences
      const savedQuickActions = JSON.parse(localStorage.getItem('quickActions') || '[]');
      if (savedQuickActions.length > 0) {
        setSelectedQuickActions(savedQuickActions);
      }
    } catch (error) {
      console.log('Could not load data from localStorage:', error);
    }
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

  const quickStats = [
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
  ];

  const allQuickActions = [
    { 
      id: 'new-inspection',
      title: 'Ny inspektion', 
      icon: Briefcase, 
      color: '#FF8C42',
      route: '/add-inspection'
    },
    { 
      id: 'new-harvest',
      title: 'Registrera skörd', 
      icon: Droplets, 
      color: '#F7B801',
      route: '/add-harvest'
    },
    { 
      id: 'new-hive',
      title: 'Lägg till kupa', 
      icon: BeehiveIcon, 
      color: '#8FBC8F',
      route: '/add-hive'
    },
    { 
      id: 'varroa-check',
      title: 'Varroa-kontroll', 
      icon: Bug, 
      color: '#E74C3C',
      route: '/add-inspection'
    },
    { 
      id: 'temperature-log',
      title: 'Temperaturlogg', 
      icon: Thermometer, 
      color: '#8B7355',
      route: '/add-inspection'
    },
    { 
      id: 'queen-marking',
      title: 'Märk drottning', 
      icon: Crown, 
      color: '#F7B801',
      route: '/add-inspection'
    },
    { 
      id: 'wing-clipping',
      title: 'Vingklippning', 
      icon: Scissors, 
      color: '#8B4513',
      route: '/add-inspection'
    },
    { 
      id: 'treatment',
      title: 'Varroabehandling', 
      icon: Shield, 
      color: '#E74C3C',
      route: '/add-inspection'
    },
    { 
      id: 'wintering',
      title: 'Invintring', 
      icon: Snowflake, 
      color: '#8FBC8F',
      route: '/add-inspection'
    },
    { 
      id: 'statistics',
      title: 'Visa statistik', 
      icon: BarChart3, 
      color: '#8B7355',
      route: '/statistics'
    },
    { 
      id: 'hive-overview',
      title: 'Kupöversikt', 
      icon: Eye, 
      color: '#FF8C42',
      route: '/hives'
    },
    { 
      id: 'new-task',
      title: 'Ny uppgift', 
      icon: Plus, 
      color: '#8B4513',
      route: '/add-task'
    },
  ];

  const availableStats = quickStats.filter(stat => selectedStats.includes(stat.id));
  const availableQuickActions = allQuickActions.filter(action => selectedQuickActions.includes(action.id));

  const toggleStatSelection = (statId: string) => {
    setSelectedStats(prev => 
      prev.includes(statId) 
        ? prev.filter(id => id !== statId)
        : [...prev, statId]
    );
  };

  const toggleQuickActionSelection = (actionId: string) => {
    const newSelection = selectedQuickActions.includes(actionId) 
      ? selectedQuickActions.filter(id => id !== actionId)
      : [...selectedQuickActions, actionId];
    
    setSelectedQuickActions(newSelection);
    
    // Save to localStorage
    try {
      localStorage.setItem('quickActions', JSON.stringify(newSelection));
    } catch (error) {
      console.log('Could not save quick actions:', error);
    }
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Snabbstatistik</Text>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => setShowStatsSelector(!showStatsSelector)}
              >
                <Settings size={20} color="#8B4513" />
              </TouchableOpacity>
            </View>

            {showStatsSelector && (
              <View style={styles.statsSelector}>
                <Text style={styles.statsSelectorTitle}>Välj statistiker att visa:</Text>
                <View style={styles.statsOptions}>
                  {quickStats.map((stat) => (
                    <TouchableOpacity
                      key={stat.id}
                      style={[
                        styles.statsOption,
                        selectedStats.includes(stat.id) && styles.statsOptionSelected
                      ]}
                      onPress={() => toggleStatSelection(stat.id)}
                    >
                      <stat.icon size={16} color={selectedStats.includes(stat.id) ? 'white' : '#8B7355'} />
                      <Text style={[
                        styles.statsOptionText,
                        selectedStats.includes(stat.id) && styles.statsOptionTextSelected
                      ]}>
                        {stat.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

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
            {tasks.map((task, index) => (
              <TouchableOpacity key={index} style={styles.taskCard}>
                <View style={[styles.taskPriority, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.task}</Text>
                  <View style={styles.taskMeta}>
                    <Calendar size={14} color="#8B7355" />
                    <Text style={styles.taskDate}>{task.date}</Text>
                    <Text style={[styles.taskPriorityText, { color: task.color }]}>
                      • {task.priority.toUpperCase()} PRIORITET
                    </Text>
                  </View>
                </View>
                <AlertCircle size={20} color={task.color} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
            <View style={styles.sectionHeader}>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => setShowQuickActionsSelector(!showQuickActionsSelector)}
              >
                <Settings size={20} color="#8B4513" />
              </TouchableOpacity>
            </View>

            {showQuickActionsSelector && (
              <View style={styles.quickActionsSelector}>
                <Text style={styles.quickActionsSelectorTitle}>Välj snabbåtgärder att visa:</Text>
                <View style={styles.quickActionsOptions}>
                  {allQuickActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      style={[
                        styles.quickActionsOption,
                        selectedQuickActions.includes(action.id) && styles.quickActionsOptionSelected
                      ]}
                      onPress={() => toggleQuickActionSelection(action.id)}
                    >
                      <action.icon size={16} color={selectedQuickActions.includes(action.id) ? 'white' : action.color} />
                      <Text style={[
                        styles.quickActionsOptionText,
                        selectedQuickActions.includes(action.id) && styles.quickActionsOptionTextSelected
                      ]}>
                        {action.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.quickActions}>
              {availableQuickActions.map((action) => (
                <TouchableOpacity 
                  key={action.id}
                  style={[styles.actionButton, { backgroundColor: action.color }]}
                  onPress={() => router.push(action.route)}
                >
                  <action.icon size={20} color="white" />
                  <Text style={styles.actionText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingsButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addTaskButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsSelector: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  statsOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  statsOptionSelected: {
    backgroundColor: '#F7B801',
  },
  statsOptionText: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 6,
    fontWeight: '600',
  },
  statsOptionTextSelected: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  quickActionsSelector: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  quickActionsOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  quickActionsOptionSelected: {
    backgroundColor: '#8FBC8F',
  },
  quickActionsOptionText: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 6,
    fontWeight: '600',
  },
  quickActionsOptionTextSelected: {
    color: 'white',
  },
});

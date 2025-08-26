import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Briefcase, FileText, Droplets, TrendingUp, CircleAlert as AlertCircle, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const quickStats = [
    { title: 'Aktiva kupor', value: '12', icon: Briefcase, color: '#FF8C42' },
    { title: 'Inspektioner denna månad', value: '8', icon: FileText, color: '#8FBC8F' },
    { title: 'Honungsskörd i år', value: '145 kg', icon: Droplets, color: '#F7B801' },
    { title: 'Snitt varroagrad', value: '2.3%', icon: TrendingUp, color: '#E74C3C' },
  ];

  const upcomingTasks = [
    { task: 'Inspektera Kupa 3', date: 'Idag', priority: 'hög', color: '#E74C3C' },
    { task: 'Varroabehandling Kupa 7-9', date: 'Imorgon', priority: 'medel', color: '#F39C12' },
    { task: 'Honung slungning', date: '3 dagar', priority: 'låg', color: '#8FBC8F' },
  ];

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
              {quickStats.map((stat, index) => (
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
            <Text style={styles.sectionTitle}>Kommande uppgifter</Text>
            {upcomingTasks.map((task, index) => (
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
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF8C42' }]}
                onPress={() => router.push('/add-inspection')}
              >
                <Briefcase size={24} color="white" />
                <Text style={styles.actionText}>Ny inspektion</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F7B801' }]}>
                <Droplets size={24} color="white" />
                <Text style={styles.actionText}>Registrera skörd</Text>
              </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  logo: {
    height: 150,
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
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

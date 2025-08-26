import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartBar as BarChart3, TrendingUp, TrendingDown, Droplets, Bug, Calendar, Filter } from 'lucide-react-native';
import { useState } from 'react';

export default function StatisticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('år');

  const periods = ['månad', 'kvartal', 'år'];

  const yearlyStats = {
    totalHoney: 145,
    averageVarroa: 3.7,
    inspections: 48,
    activeHives: 12,
  };

  const monthlyHoney = [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 5 },
    { month: 'Apr', amount: 12 },
    { month: 'Maj', amount: 28 },
    { month: 'Jun', amount: 45 },
    { month: 'Jul', amount: 35 },
    { month: 'Aug', amount: 15 },
    { month: 'Sep', amount: 5 },
    { month: 'Okt', amount: 0 },
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
  ];

  const varroaTrend = [
    { month: 'Jan', level: 1.8 },
    { month: 'Feb', level: 2.1 },
    { month: 'Mar', level: 2.5 },
    { month: 'Apr', level: 2.0 },
    { month: 'Maj', level: 1.5 },
    { month: 'Jun', level: 2.8 },
    { month: 'Jul', level: 5.2 },
    { month: 'Aug', level: 4.1 },
    { month: 'Sep', level: 3.9 },
    { month: 'Okt', level: 4.3 },
    { month: 'Nov', level: 6.7 },
    { month: 'Dec', level: 5.5 },
  ];

  const maxHoney = Math.max(...monthlyHoney.map(m => m.amount));
  const maxVarroa = Math.max(...varroaTrend.map(v => v.level));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Statistik</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#8B4513" />
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCards}>
            <View style={[styles.summaryCard, { backgroundColor: '#F7B801' + '20' }]}>
              <Droplets size={24} color="#F7B801" />
              <Text style={styles.summaryValue}>{yearlyStats.totalHoney} kg</Text>
              <Text style={styles.summaryLabel}>Total honung</Text>
              <View style={styles.trendRow}>
                <TrendingUp size={14} color="#8FBC8F" />
                <Text style={[styles.trendText, { color: '#8FBC8F' }]}>+15%</Text>
              </View>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: '#E74C3C' + '20' }]}>
              <Bug size={24} color="#E74C3C" />
              <Text style={styles.summaryValue}>{yearlyStats.averageVarroa}%</Text>
              <Text style={styles.summaryLabel}>Snitt varroa</Text>
              <View style={styles.trendRow}>
                <TrendingDown size={14} color="#8FBC8F" />
                <Text style={[styles.trendText, { color: '#8FBC8F' }]}>-8%</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Honungsskörd per månad (kg)</Text>
            <View style={styles.chart}>
              {monthlyHoney.map((month, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar,
                        { 
                          height: Math.max((month.amount / maxHoney) * 120, 4),
                          backgroundColor: month.amount > 0 ? '#F7B801' : '#E8D5B7'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{month.month}</Text>
                  <Text style={styles.barValue}>{month.amount}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Varroa per dag trend</Text>
            <View style={styles.chart}>
              {varroaTrend.map((month, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar,
                        { 
                          height: (month.level / maxVarroa) * 120,
                          backgroundColor: month.level > 5 ? '#E74C3C' : month.level > 2 ? '#FF8C42' : '#8FBC8F'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{month.month}</Text>
                  <Text style={[
                    styles.barValue,
                    { color: month.level > 5 ? '#E74C3C' : '#8B7355' }
                  ]}>
                    {month.level}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Insikter och rekommendationer</Text>
            
            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: '#8FBC8F' + '20' }]}>
                <TrendingUp size={20} color="#8FBC8F" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Bra säsong</Text>
                <Text style={styles.insightText}>
                  Din honungsskörd ligger 15% över förra året. Fortsätt med nuvarande rutiner.
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: '#FF8C42' + '20' }]}>
                <Bug size={20} color="#FF8C42" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Övervaka varroa</Text>
                <Text style={styles.insightText}>
                  Kupa Gamma visar 6.8 varroa/dag (högt). Planera behandling omedelbart.
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: '#F7B801' + '20' }]}>
                <Calendar size={20} color="#F7B801" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Inspektionsschema</Text>
                <Text style={styles.insightText}>
                  Du har gjort 48 inspektioner i år - perfekt frekvens för 12 kupor.
                </Text>
              </View>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  filterButton: {
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
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: '#F7B801',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  periodTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#8B7355',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#8B7355',
    lineHeight: 20,
  },
});
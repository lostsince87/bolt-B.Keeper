import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartBar as BarChart3, TrendingUp, TrendingDown, Droplets, Bug, Calendar, Filter } from 'lucide-react-native';
import { useState, useEffect } from 'react';

export default function StatisticsScreen() {
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    // Load inspections from localStorage
    try {
      const savedInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
      setInspections(savedInspections);
    } catch (error) {
      console.log('Could not load inspections:', error);
      setInspections([]);
    }
  }, []);

  const yearlyStats = {
    totalHoney: 145,
    averageVarroa: 3.7,
    inspections: 48,
    activeHives: 12,
  };

  // Calculate honey harvest for last 12 months
  const calculateMonthlyHoney = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // For now, use simulated data - in real app this would come from harvest records
      const currentMonth = date.getMonth();
      const simulatedAmounts = [0, 0, 5, 12, 28, 45, 35, 15, 5, 0, 0, 0];
      const amount = simulatedAmounts[currentMonth] || 0;
      
      monthlyData.push({
        month: months[date.getMonth()],
        amount,
        year: date.getFullYear()
      });
    }
    return monthlyData;
  };

  // Calculate varroa trend for last 12 months from actual inspection data
  const calculateVarroaTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthInspections = inspections.filter(inspection => {
        const inspectionDate = new Date(inspection.date);
        const inspectionKey = `${inspectionDate.getFullYear()}-${String(inspectionDate.getMonth() + 1).padStart(2, '0')}`;
        return inspectionKey === monthKey && inspection.varroaPerDay !== null;
      });
      
      const avgVarroa = monthInspections.length > 0 
        ? monthInspections.reduce((sum, inspection) => sum + inspection.varroaPerDay, 0) / monthInspections.length
        : 0;
      
      monthlyData.push({
        month: months[date.getMonth()],
        level: avgVarroa,
        year: date.getFullYear()
      });
    }
    return monthlyData;
  };

  const monthlyHoney = calculateMonthlyHoney();
  const varroaTrend = calculateVarroaTrend();

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
            <Text style={styles.chartTitle}>Honungsskörd senaste 12 månaderna (kg)</Text>
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
                  <Text style={styles.barLabel}>
                    {month.year !== new Date().getFullYear() 
                      ? `${month.month} ${month.year.toString().slice(-2)}` 
                      : month.month
                    }
                  </Text>
                  <Text style={styles.barValue}>{month.amount}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>
              Varroa senaste 12 månaderna
            </Text>
            <View style={styles.chart}>
              {varroaTrend.map((month, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View 
                      style={[
                        styles.bar,
                        { 
                          height: Math.max((month.level / Math.max(maxVarroa, 1)) * 120, 2),
                          backgroundColor: month.level > 5 ? '#E74C3C' : month.level > 2 ? '#FF8C42' : '#8FBC8F'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>
                    {month.year !== new Date().getFullYear() 
                      ? `${month.month} ${month.year.toString().slice(-2)}` 
                      : month.month
                    }
                  </Text>
                  <Text style={[
                    styles.barValue,
                    { color: month.level > 5 ? '#E74C3C' : '#8B7355' }
                  ]}>
                    {month.level > 0 ? month.level.toFixed(1) : '0'}
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
                  {(() => {
                    const highVarroaInspections = inspections.filter(i => i.varroaPerDay > 5);
                    if (highVarroaInspections.length > 0) {
                      const latestHigh = highVarroaInspections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                      return `${latestHigh.hive} visar ${latestHigh.varroaPerDay.toFixed(1)} varroa/dag (högt). Planera behandling omedelbart.`;
                    }
                    return 'Varroavärden ser bra ut. Fortsätt med regelbunden övervakning.';
                  })()}
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

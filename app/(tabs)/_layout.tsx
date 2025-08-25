import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Chrome as Home, Briefcase, FileText, ChartBar as BarChart3, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F7B801',
        tabBarInactiveTintColor: '#8B7355',
        tabBarStyle: {
          backgroundColor: '#FFF8E1',
          borderTopWidth: 1,
          borderTopColor: '#E8D5B7',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hem',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hives"
        options={{
          title: 'Kupor',
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inspections"
        options={{
          title: 'Inspektioner',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistik',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Inställningar',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-hive"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="add-inspection"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
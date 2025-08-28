import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Save, CircleAlert as AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddTaskScreen() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [notes, setNotes] = useState('');

  const priorities = [
    { id: 'låg', label: 'Låg prioritet', color: '#8FBC8F' },
    { id: 'medel', label: 'Medel prioritet', color: '#F39C12' },
    { id: 'hög', label: 'Hög prioritet', color: '#E74C3C' },
  ];

  const quickTasks = [
    'Inspektera kupa',
    'Varroabehandling',
    'Honungsskörd',
    'Invintring',
    'Rengöring av utrustning',
    'Beställa material',
  ];

  const handleSave = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Fel', 'Ange en uppgift');
      return;
    }
    if (!taskDate.trim()) {
      Alert.alert('Fel', 'Ange ett datum');
      return;
    }
    if (!selectedPriority) {
      Alert.alert('Fel', 'Välj prioritet');
      return;
    }

    // Create task object
    const newTask = {
      id: Date.now(),
      task: taskTitle.trim(),
      date: taskDate.trim(),
      priority: selectedPriority,
      notes: notes.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Save task to AsyncStorage
    const saveTask = async () => {
      try {
        const existingTasks = JSON.parse(await AsyncStorage.getItem('tasks') || '[]');
        const updatedTasks = [...existingTasks, newTask];
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      } catch (error) {
        console.log('Could not save task:', error);
      }
    };

    saveTask().then(() => {
      Alert.alert(
        'Uppgift sparad!', 
        `"${taskTitle}" har lagts till för ${taskDate}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.title}>Ny uppgift</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Snabbval</Text>
              <View style={styles.quickTasksContainer}>
                {quickTasks.map((task) => (
                  <TouchableOpacity
                    key={task}
                    style={[
                      styles.quickTaskButton,
                      taskTitle === task && styles.quickTaskButtonSelected
                    ]}
                    onPress={() => setTaskTitle(task)}
                  >
                    <Text style={[
                      styles.quickTaskText,
                      taskTitle === task && styles.quickTaskTextSelected
                    ]}>
                      {task}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Uppgift *</Text>
              <View style={styles.inputContainer}>
                <AlertTriangle size={20} color="#8B7355" />
                <TextInput
                  style={styles.input}
                  placeholder="t.ex. Inspektera Kupa Alpha"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Datum *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#8B7355" />
                <TextInput
                  style={styles.input}
                  placeholder="t.ex. Idag, Imorgon, 2024-01-20"
                  value={taskDate}
                  onChangeText={setTaskDate}
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prioritet *</Text>
              <View style={styles.prioritySelector}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.priorityOption,
                      selectedPriority === priority.id && [
                        styles.priorityOptionSelected,
                        { backgroundColor: priority.color + '20', borderColor: priority.color }
                      ]
                    ]}
                    onPress={() => setSelectedPriority(priority.id)}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                    <Text style={[
                      styles.priorityText,
                      selectedPriority === priority.id && { color: priority.color, fontWeight: 'bold' }
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Anteckningar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ytterligare detaljer om uppgiften..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#8B7355"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={24} color="white" />
              <Text style={styles.saveButtonText}>Spara uppgift</Text>
            </TouchableOpacity>
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
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
    marginLeft: 12,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#8B4513',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickTasksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTaskButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickTaskButtonSelected: {
    backgroundColor: '#8FBC8F',
    borderColor: '#8FBC8F',
  },
  quickTaskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
  },
  quickTaskTextSelected: {
    color: 'white',
  },
  prioritySelector: {
    gap: 12,
  },
  priorityOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E8D5B7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityOptionSelected: {
    borderWidth: 2,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 16,
    color: '#8B7355',
  },
  saveButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
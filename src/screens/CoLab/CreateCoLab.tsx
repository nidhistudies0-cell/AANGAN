import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function CreateCoLab() {
  const [idea, setIdea] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [limit, setLimit] = useState('');
  const navigation = useNavigation<any>();

  const handleCreate = async () => {
    if(!idea || !discipline) {
       Alert.alert("Missing Fields", "Please fill in all required fields.");
       return;
    }
    try {
      await addDoc(collection(db, 'posts_colab'), {
        idea,
        discipline,
        courseYear,
        limit,
        org: auth.currentUser?.email || 'Anonymous',
        createdAt: new Date().toISOString()
      });
      Alert.alert('Project Created', 'Your CoLab project has been posted!');
      navigation.goBack();
    } catch(e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Start Project</Text>
      <Text style={styles.headerSubtitle}>Create a new CoLab post</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Idea / Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Open Source Hostel App" 
          value={idea}
          onChangeText={setIdea}
        />
        
        <Text style={styles.label}>Branch / Discipline Required</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. CS, IT" 
          value={discipline}
          onChangeText={setDiscipline}
        />

        <Text style={styles.label}>Course Year Required</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2nd Year, Any" 
          value={courseYear}
          onChangeText={setCourseYear}
        />

        <Text style={styles.label}>Team Limit</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 3" 
          keyboardType="numeric"
          value={limit}
          onChangeText={setLimit}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Post Project</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.parchment.background,
    padding: ui.page.padding,
    paddingTop: 60,
  },
  headerTitle: {
    fontFamily: typography.displayBold,
    fontSize: 36,
    color: colors.clay.dark,
  },
  headerSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.clay.primary,
    marginBottom: 20,
  },
  formCard: {
    ...ui.card,
    padding: 24,
    borderColor: colors.clay.light,
    borderWidth: 2,
  },
  label: {
    ...ui.label,
    color: colors.clay.primary,
    marginBottom: 8,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.ink.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand.border,
    marginBottom: 24,
    paddingVertical: 8,
  },
  button: {
    ...ui.button,
    backgroundColor: colors.clay.primary,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.cream.card,
  },
  cancelLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: typography.bodyMedium,
    color: colors.ink.soft,
  }
});

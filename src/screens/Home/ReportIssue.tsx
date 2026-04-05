import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function ReportIssue() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState('');
  const navigation = useNavigation<any>();

  const handleReport = async () => {
    if (!title || !description) {
       Alert.alert("Missing Fields", "Title and description are required.");
       return;
    }
    try {
      await addDoc(collection(db, 'issues'), {
        title,
        description,
        room,
        studentId: auth.currentUser?.email || 'Anonymous',
        status: 'open',
        createdAt: new Date().toISOString()
      });
      Alert.alert('Complaint Raised', 'Your issue has been reported to the administration.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Report an Issue</Text>
      <Text style={styles.headerSubtitle}>Raise complaints to the Warden/Admin directly</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Issue Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Broken Fan, Wi-Fi down" 
          value={title}
          onChangeText={setTitle}
        />
        
        <Text style={styles.label}>Room / Location</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Block A, Room 104" 
          value={room}
          onChangeText={setRoom}
        />

        <Text style={styles.label}>Detailed Description</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          placeholder="Describe your problem here..." 
          multiline
          value={description}
          onChangeText={setDescription}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleReport}>
          <Text style={styles.buttonText}>Submit Complaint</Text>
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
    color: colors.rust.alert,
  },
  headerSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.ink.mid,
    marginBottom: 20,
  },
  formCard: {
    ...ui.card,
    padding: 24,
    borderColor: colors.rust.light,
    borderWidth: 2,
  },
  label: {
    ...ui.label,
    color: colors.rust.alert,
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
    backgroundColor: colors.rust.alert,
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

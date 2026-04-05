import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function CreateRequest() {
  const [item, setItem] = useState('');
  const [period, setPeriod] = useState('');
  const [contact, setContact] = useState('');
  const navigation = useNavigation<any>();

  const handleCreate = async () => {
    if(!item || !period || !contact) {
       Alert.alert("Missing Fields", "Please fill in all required fields.");
       return;
    }
    try {
      await addDoc(collection(db, 'borrow_requests'), {
        item,
        period,
        contact,
        org: auth.currentUser?.email || 'Anonymous',
        status: 'open',
        createdAt: new Date().toISOString()
      });
      Alert.alert('Request Created', 'Your ShareRing request has been posted!');
      navigation.goBack();
    } catch(e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Borrow Item</Text>
      <Text style={styles.headerSubtitle}>Create a new ShareRing request</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Item Needed</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Iron Box, Calculator" 
          value={item}
          onChangeText={setItem}
        />
        
        <Text style={styles.label}>Borrowing Period</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2 hours, 1 day" 
          value={period}
          onChangeText={setPeriod}
        />

        <Text style={styles.label}>Contact Detail</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Room 104 or WhatsApp" 
          value={contact}
          onChangeText={setContact}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Post Request</Text>
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
    color: colors.bark.tertiary,
  },
  headerSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.bark.tertiary,
    marginBottom: 20,
  },
  formCard: {
    ...ui.card,
    padding: 24,
    borderColor: colors.bark.light,
    borderWidth: 2,
  },
  label: {
    ...ui.label,
    color: colors.bark.tertiary,
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
    backgroundColor: colors.bark.tertiary,
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

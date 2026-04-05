import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateInSync() {
  const [title, setTitle] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [budget, setBudget] = useState('');
  const [limit, setLimit] = useState('');
  const navigation = useNavigation<any>();

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      // Merge selected time into our dateObj
      const newD = new Date(dateObj);
      newD.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDateObj(newD);
    }
  };

  // Helper strings for submission
  const dateStr = dateObj.toISOString().split('T')[0];
  const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const handleCreate = async () => {
    if(!title) {
       Alert.alert("Missing Fields", "Please fill in all required fields.");
       return;
    }
    try {
      await addDoc(collection(db, 'posts_insync'), {
        title,
        date: dateStr,
        time: timeStr,
        budget,
        limit,
        org: auth.currentUser?.email || 'Anonymous',
        createdAt: new Date().toISOString()
      });
      Alert.alert('Post Created', 'Your InSync activity has been posted!');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Plan Activity</Text>
      <Text style={styles.headerSubtitle}>Create a new InSync post</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Activity Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Board Games Night" 
          value={title}
          onChangeText={setTitle}
        />
        
        <Text style={styles.label}>Date</Text>
        {Platform.OS === 'web' ? (
          <input 
             type="date"
             min={new Date().toISOString().split('T')[0]} // Current date floor
             value={dateStr}
             onChange={(e) => setDateObj(new Date(e.target.value))}
             style={{ padding: 8, fontSize: 16, borderBottomWidth: 1, borderColor: colors.sand.border, marginBottom: 24, fontFamily: 'Jost', backgroundColor: 'transparent' }}
          />
        ) : (
          <View>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.input}>{dateStr}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="default"
                minimumDate={new Date()} // Current date floor
                onChange={onDateChange}
              />
            )}
          </View>
        )}

        <Text style={styles.label}>Time (24hr)</Text>
        {Platform.OS === 'web' ? (
          <input 
             type="time"
             value={timeStr}
             onChange={(e) => {
               const [h, m] = e.target.value.split(':');
               const newD = new Date(dateObj);
               newD.setHours(Number(h), Number(m));
               setDateObj(newD);
             }}
             style={{ padding: 8, fontSize: 16, borderBottomWidth: 1, borderColor: colors.sand.border, marginBottom: 24, fontFamily: 'Jost', backgroundColor: 'transparent' }}
          />
        ) : (
          <View>
            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <Text style={styles.input}>{timeStr}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={dateObj}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>
        )}
        
        <Text style={styles.label}>Budget</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Free or $10" 
          value={budget}
          onChangeText={setBudget}
        />

        <Text style={styles.label}>People Limit</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 4" 
          keyboardType="numeric"
          value={limit}
          onChangeText={setLimit}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Post Activity</Text>
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
    color: colors.moss.dark,
  },
  headerSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.moss.secondary,
    marginBottom: 20,
  },
  formCard: {
    ...ui.card,
    padding: 24,
    borderColor: colors.moss.light,
    borderWidth: 2,
  },
  label: {
    ...ui.label,
    color: colors.moss.secondary,
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
    backgroundColor: colors.moss.secondary,
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

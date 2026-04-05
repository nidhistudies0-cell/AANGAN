import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G', 'Block H', 'Block J', 'Block S'];

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hostelBlock, setHostelBlock] = useState('');
  const [branch, setBranch] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [interests, setInterests] = useState('');
  const navigation = useNavigation<any>();

  const handleSignup = async () => {
    if (!email || !password || !branch || !courseYear || !hostelBlock) {
      Alert.alert('Missing Fields', 'Please fill in all details.');
      return;
    }
    
    // Validate student format: name.surname@vitstudent.ac.in
    const studentRegex = /^[a-zA-Z]+\.[a-zA-Z]+[0-9]*@vitstudent\.ac\.in$/i;
    if (!studentRegex.test(email)) {
      Alert.alert('Invalid Email Format', 'Please use your official email in the format: name.surname@vitstudent.ac.in');
      return;
    }
    
    // Derive name from Email
    const [localPart] = email.split('@');
    const [rawFirst, rawLast] = localPart.split('.');
    const cleanLast = rawLast ? rawLast.replace(/[0-9]/g, '') : '';
    const derivedName = `${rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()} ${cleanLast.charAt(0).toUpperCase() + cleanLast.slice(1).toLowerCase()}`.trim();
    
    // Strict student assignment (staff uses designated portal)
    const role = 'student';
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: derivedName,
        email,
        hostelBlock,
        branch,
        courseYear,
        interests: interests.split(',').map(i => i.trim()),
        role, // assigned role based on email
        createdAt: new Date().toISOString(),
      });
      // Show confirmation popup
      Alert.alert('Registration Successful', 'Welcome to AANGAN! Your student account has been created.');
    } catch (error: any) {
      let msg = "An unexpected error occurred.";
      if (error.code === 'auth/email-already-in-use') msg = "This email is already registered. Please log in.";
      else if (error.code === 'auth/weak-password') msg = "Your password is too weak. Please use at least 6 characters.";
      else if (error.code === 'auth/invalid-email') msg = "This email address is invalid.";
      Alert.alert('Registration Issue', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AANGAN</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Institute Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="name.surname@vitstudent.ac.in" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Text style={styles.label}>Hostel Block</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={hostelBlock}
            onValueChange={(itemValue) => setHostelBlock(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select your block..." value="" color={colors.ink.soft} />
            {BLOCKS.map(block => (
              <Picker.Item key={block} label={block} value={block} color={colors.ink.text} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Branch / Discipline</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Computer Science" 
          value={branch}
          onChangeText={setBranch}
        />

        <Text style={styles.label}>Course Year</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2nd Year" 
          value={courseYear}
          onChangeText={setCourseYear}
        />

        <Text style={styles.label}>Interests & Hobbies</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Music, Tech, Sports (comma separated)" 
          value={interests}
          onChangeText={setInterests}
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
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
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 48,
    color: colors.ink.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  formCard: {
    ...ui.card,
    padding: 24,
  },
  label: {
    ...ui.label,
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
  pickerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.sand.border,
    marginBottom: 24,
  },
  picker: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.ink.text,
    width: '100%',
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
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
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: colors.moss.secondary,
  }
});

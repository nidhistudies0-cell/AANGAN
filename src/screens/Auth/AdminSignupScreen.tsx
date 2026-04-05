import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function AdminSignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const navigation = useNavigation<any>();

  const handleSignup = async () => {
    if (!email || !password || !designation) {
      Alert.alert('Missing Fields', 'Please fill in all details.');
      return;
    }

    // Validate staff format: post.lh@vit.ac.in
    const staffRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@vit\.ac\.in$/i;
    if (!staffRegex.test(email)) {
      Alert.alert('Invalid Email Format', 'Warden/Staff emails must follow the post.lh@vit.ac.in format.');
      return;
    }

    // Derive name from Email
    const [localPart] = email.split('@');
    const nameParts = localPart.split('.');
    const derivedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create admin profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: derivedName,
        email,
        designation,
        role: 'admin', // Explicitly set role to admin
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Staff Registration Successful', 'Welcome! Your administrative account has been created.');
    } catch (error: any) {
      let msg = "An unexpected error occurred.";
      if (error.code === 'auth/email-already-in-use') msg = "This employee email is already registered.";
      else if (error.code === 'auth/weak-password') msg = "Your password must be at least 6 characters.";
      else if (error.code === 'auth/invalid-email') msg = "This email address is invalid.";
      Alert.alert('Registration Issue', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtnWrapper} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Back to Login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Staff Portal</Text>
      <Text style={styles.subtitle}>Register your administrative account</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Designation</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Chief Warden, Block A" 
          value={designation}
          onChangeText={setDesignation}
        />

        <Text style={styles.label}>Official Employee Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. warden.lh@vit.ac.in" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Min 6 characters" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Register Staff Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.stone.light,
    padding: ui.page.padding,
    paddingTop: 80,
  },
  backBtnWrapper: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.ink.mid,
    fontSize: 16,
  },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 36,
    color: colors.ink.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.stone.neutral,
    textAlign: 'center',
    marginBottom: 30,
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
  button: {
    ...ui.button,
    backgroundColor: colors.ink.text,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.parchment.background,
  }
});

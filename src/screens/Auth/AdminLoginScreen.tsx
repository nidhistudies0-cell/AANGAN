import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!email.includes('@employee') && !email.includes('admin')) {
      Alert.alert('Access Denied', 'Only employee IDs are allowed here.');
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Optional: verify role actively
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDoc.exists() && userDoc.data().role !== 'admin') {
         throw new Error("You do not have admin privileges.");
      }
    } catch (error: any) {
      let msg = "Cannot process login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         msg = "Incorrect credentials or staff account not found.";
      } else if (error.code === 'auth/wrong-password') {
         msg = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
         msg = "The format of the email is invalid.";
      } else {
         msg = error.message; // generic fallback e.g. for thrown custom errors
      }
      Alert.alert('Admin Access Error', msg);
      // Sign out immediately if unauthorized
      auth.signOut();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtnWrapper} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Back to Student Login</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Warden / Staff</Text>
      <Text style={styles.subtitle}>Admin Access Portal</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Employee Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. warden@employee.college.ac.in" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{marginTop: 20, alignItems: 'center'}} onPress={() => navigation.navigate('AdminSignup')}>
          <Text style={{fontFamily: typography.bodyMedium, color: colors.stone.neutral}}>New Staff Member? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stone.light, // Distinctive admin background
    padding: ui.page.padding,
    justifyContent: 'center',
  },
  backBtnWrapper: {
    position: 'absolute',
    top: 60,
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
    fontSize: 40,
    color: colors.ink.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.stone.neutral,
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

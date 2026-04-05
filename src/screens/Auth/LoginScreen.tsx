import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let msg = "Cannot process login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         msg = "No user found or incorrect password. Please try again.";
      } else if (error.code === 'auth/wrong-password') {
         msg = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
         msg = "The format of the email is invalid.";
      }
      Alert.alert('Login Issue', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AANGAN</Text>
      <Text style={styles.subtitle}>Your hostel. Your community.</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Institute Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. student@college.ac.in" 
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
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.linkText}>New here? Sign up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.linkButton, { marginTop: 10 }]} onPress={() => navigation.navigate('AdminLogin')}>
          <Text style={[styles.linkText, { color: colors.stone.neutral }]}>Warden / Staff Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment.background,
    padding: ui.page.padding,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 48,
    color: colors.ink.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 18,
    color: colors.ink.mid,
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

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Jost_400Regular, Jost_500Medium, Jost_700Bold } from '@expo-google-fonts/jost';
import { ActivityIndicator, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './src/firebase';
import { colors, typography, ui } from './src/theme';
import EmergencyModal from './src/components/EmergencyModal';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Jost_400Regular,
    Jost_500Medium,
    Jost_700Bold,
  });

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [emergencyData, setEmergencyData] = useState({ type: '', message: '', timestamp: '' });

  // Mock function to simulate receiving an alert
  const triggerMockAlert = (type: string, message: string) => {
     setEmergencyData({ type, message, timestamp: new Date().toLocaleString() });
     setEmergencyVisible(true);
  };

  useEffect(() => {
    let unsubsDoc: any = null;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        unsubsDoc = onSnapshot(doc(db, 'users', u.uid), (docSnap) => {
          if (docSnap.exists() && docSnap.data().role === 'admin') {
             setIsAdmin(true);
          } else {
             setIsAdmin(false);
          }
          setLoading(false);
        });
      } else {
        if (unsubsDoc) unsubsDoc();
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      if (unsubsDoc) unsubsDoc();
    };
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.parchment.background }}>
        <ActivityIndicator size="large" color={colors.clay.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        {user ? <AppNavigator isAdmin={isAdmin} /> : <AuthNavigator />}
      </NavigationContainer>
      
      <EmergencyModal 
        visible={emergencyVisible}
        type={emergencyData.type}
        message={emergencyData.message}
        timestamp={emergencyData.timestamp}
        onDismiss={() => setEmergencyVisible(false)}
      />
    </>
  );
}

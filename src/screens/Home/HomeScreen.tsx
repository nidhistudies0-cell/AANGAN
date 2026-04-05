import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);
  const [sosVisible, setSosVisible] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if(!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if(userDoc.exists()) {
        setProfile(userDoc.data());
      }
    };
    fetchProfile();
    const qNotices = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubNotices = onSnapshot(qNotices, (snapshot) => {
      setNotices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubNotices();
  }, []);

  const handleSOS = async (type: string) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let locInfo = "Location permission denied by user.";
      
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        locInfo = `Lat: ${location.coords.latitude.toFixed(6)}, Lng: ${location.coords.longitude.toFixed(6)}`;
      }

      await addDoc(collection(db, 'issues'), {
        title: `🚨 SOS: ${type}`,
        description: `URGENT EMERGENCY REPORTED.\nGPS data: ${locInfo}`,
        room: profile?.hostelBlock || 'Unknown Block',
        studentId: auth.currentUser?.email || 'Unknown',
        status: 'critical',
        createdAt: new Date().toISOString()
      });
      
      Alert.alert('SOS Dispatch Sent', 'Admin and Wardens have been alerted with your location. Help is on the way.');
      setSosVisible(false);
    } catch(e: any) {
      Alert.alert('Dispatch Error', e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Brand Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {profile?.name || 'Resident'}</Text>
          <Text style={styles.brand}>AANGAN</Text>
        </View>
        <View style={styles.blockChip}>
          <Text style={styles.blockChipText}>{profile?.hostelBlock || 'N/A'}</Text>
        </View>
      </View>

      {/* Emergency Strip (Mock) */}
      <View style={styles.emergencyStrip}>
        <View style={styles.dot} />
        <Text style={styles.emergencyText}>No active alerts currently</Text>
      </View>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={() => setSosVisible(true)}>
        <Text style={styles.sosText}>TRIGGER SOS</Text>
      </TouchableOpacity>

      {/* SOS Modal Layer */}
      <Modal visible={sosVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Emergency Type</Text>
            <Text style={{fontFamily: typography.bodyMedium, color: colors.ink.mid, marginBottom: 20}}>This will immediately share your exact GPS location with the administration.</Text>
            
            <TouchableOpacity style={styles.sosOptionCard} onPress={() => handleSOS('Medical Emergency')}>
              <Text style={styles.sosOptionText}>🩺 Medical</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sosOptionCard} onPress={() => handleSOS('Fire Hazard')}>
              <Text style={styles.sosOptionText}>🔥 Fire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sosOptionCard} onPress={() => handleSOS('Theft / Security')}>
              <Text style={styles.sosOptionText}>🛡️ Theft</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sosOptionCard} onPress={() => handleSOS('Other Crisis')}>
              <Text style={styles.sosOptionText}>⚠️ Other</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{marginTop: 20, alignItems: 'center'}} onPress={() => setSosVisible(false)}>
              <Text style={{fontFamily: typography.bodyMedium, color: colors.ink.soft}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feature Tiles */}
      <Text style={styles.sectionTitle}>Explore</Text>
      <View style={styles.featuresContainer}>
        
        <TouchableOpacity 
          style={[styles.tile, { backgroundColor: colors.moss.light, borderColor: colors.moss.secondary }]}
          onPress={() => navigation.navigate('InSync')}
        >
          <Text style={styles.tileTitle}>InSync</Text>
          <Text style={[styles.tileDesc, { color: colors.moss.dark }]}>Join leisure activities</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tile, { backgroundColor: colors.clay.light, borderColor: colors.clay.primary }]}
          onPress={() => navigation.navigate('CoLab')}
        >
          <Text style={styles.tileTitle}>CoLab</Text>
          <Text style={[styles.tileDesc, { color: colors.clay.dark }]}>Start a project</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tile, { backgroundColor: colors.bark.light, borderColor: colors.bark.tertiary }]}
          onPress={() => navigation.navigate('ShareRing')}
        >
          <Text style={styles.tileTitle}>ShareRing</Text>
          <Text style={[styles.tileDesc, { color: colors.bark.tertiary }]}>Borrow & lend</Text>
        </TouchableOpacity>

      </View>

      {/* Notices */}
      <View style={ui.divider} />
      <Text style={styles.sectionTitle}>Notice Board</Text>
      
      {notices.length === 0 ? (
        <Text style={{color: colors.ink.soft, fontFamily: typography.body, textAlign: 'center', marginVertical: 20}}>
           No current notices.
        </Text>
      ) : (
        notices.map(notice => (
          <View key={notice.id} style={styles.noticeCard}>
            <Text style={styles.noticeLabel}>OFFICIAL UPDATE</Text>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeBody}>{notice.body}</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('ReportIssue')}>
         <Text style={styles.reportBtnText}>⚠ Report an Issue / Complaint</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => auth.signOut()}>
         <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment.background,
    padding: ui.page.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 40,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.ink.mid,
  },
  brand: {
    fontFamily: typography.displayBold,
    fontSize: 32,
    color: colors.ink.text,
  },
  blockChip: {
    backgroundColor: colors.sand.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sand.border,
  },
  blockChipText: {
    ...ui.label,
  },
  emergencyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.rust.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rust.alert,
    marginRight: 8,
  },
  emergencyText: {
    fontFamily: typography.bodyMedium,
    color: colors.rust.alert,
    fontSize: 14,
  },
  sosButton: {
    backgroundColor: colors.rust.alert,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  sosText: {
    fontFamily: typography.bodyBold,
    color: colors.cream.card,
    letterSpacing: 1,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.cream.card,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontFamily: typography.displayBold,
    fontSize: 28,
    color: colors.rust.alert,
    marginBottom: 8,
  },
  sosOptionCard: {
    backgroundColor: colors.rust.light,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rust.alert,
    marginBottom: 10,
    alignItems: 'center',
  },
  sosOptionText: {
    fontFamily: typography.bodyBold,
    color: colors.rust.alert,
    fontSize: 18,
  },
  sectionTitle: {
    fontFamily: typography.displayBold,
    fontSize: 24,
    color: colors.ink.text,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 12,
  },
  tile: {
    ...ui.card,
    padding: 20,
    borderWidth: 1,
  },
  tileTitle: {
    fontFamily: typography.displayBold,
    fontSize: 28,
    color: colors.ink.text,
    marginBottom: 4,
  },
  tileDesc: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
  },
  noticeCard: {
    ...ui.card,
    padding: 20,
  },
  noticeLabel: {
    ...ui.label,
    color: colors.stone.neutral,
    marginBottom: 8,
  },
  noticeTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 18,
    color: colors.ink.text,
    marginBottom: 4,
  },
  noticeBody: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.ink.mid,
    lineHeight: 20,
  },
  reportBtn: {
    ...ui.button,
    backgroundColor: colors.rust.light,
    marginTop: 20,
    paddingVertical: 12,
  },
  reportBtnText: {
    fontFamily: typography.bodyBold,
    color: colors.rust.alert,
    textAlign: 'center',
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 40,
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    fontFamily: typography.bodyMedium,
    color: colors.ink.soft,
  }
});

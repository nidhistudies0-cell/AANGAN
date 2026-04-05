import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [myLended, setMyLended] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    let unsubSync: any, unsubColab: any, unsubLend: any;
    
    const fetchProfile = async () => {
      if(!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if(userDoc.exists()) {
         setProfile(userDoc.data());
      }

      // Live fetch groups I joined
      const qSync = query(collection(db, 'posts_insync'), where('members', 'array-contains', auth.currentUser.uid));
      unsubSync = onSnapshot(qSync, (snap) => {
         const syncs = snap.docs.map(d => ({id: d.id, collectionName: 'posts_insync', ...d.data()}));
         setMyGroups(prev => {
            const filtered = prev.filter(p => p.collectionName !== 'posts_insync');
            return [...filtered, ...syncs];
         });
      });

      const qColab = query(collection(db, 'posts_colab'), where('members', 'array-contains', auth.currentUser.uid));
      unsubColab = onSnapshot(qColab, (snap) => {
         const colabs = snap.docs.map(d => ({id: d.id, collectionName: 'posts_colab', ...d.data()}));
         setMyGroups(prev => {
            const filtered = prev.filter(p => p.collectionName !== 'posts_colab');
            return [...filtered, ...colabs];
         });
      });

      // Live fetch items I am lending
      const qLended = query(collection(db, 'borrow_requests'), where('lenderId', '==', auth.currentUser.uid));
      unsubLend = onSnapshot(qLended, (snap) => {
         setMyLended(snap.docs.map(d => d.data()));
      });
    };
    fetchProfile();

    return () => {
      if(unsubSync) unsubSync();
      if(unsubColab) unsubColab();
      if(unsubLend) unsubLend();
    };
  }, []);

  const openChat = (item: any) => {
    navigation.navigate('GroupChat', {
      postId: item.id,
      collectionName: item.collectionName,
      title: item.title || item.idea
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>My Profile</Text>

      {profile && (
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile.name}</Text>
          <Text style={styles.label}>Block / Branch / Year</Text>
          <Text style={styles.value}>{profile.hostelBlock} • {profile.branch} • {profile.courseYear}</Text>
          <Text style={styles.label}>Interests</Text>
          <Text style={styles.value}>{profile.interests?.join(', ')}</Text>
        </View>
      )}

      <Text style={[styles.headerTitle, { fontSize: 24, marginTop: 40, marginBottom: 16 }]}>My Active Chats</Text>
      {myGroups.map((group) => (
        <TouchableOpacity key={group.id} style={styles.chatCard} onPress={() => openChat(group)}>
          <Text style={styles.chatTitle}>{group.title || group.idea}</Text>
          <Text style={styles.chatLabel}>{group.collectionName === 'posts_insync' ? 'Leisure' : 'Project'}</Text>
        </TouchableOpacity>
      ))}
      
      {myGroups.length === 0 && (
         <Text style={{color: colors.ink.soft, fontFamily: typography.body}}>No active group chats.</Text>
      )}

      <Text style={[styles.headerTitle, { fontSize: 24, marginTop: 40, marginBottom: 16 }]}>Lending Log</Text>
      {myLended.map((item: any, index: number) => (
        <View key={index} style={styles.chatCard}>
          <View>
            <Text style={styles.chatTitle}>{item.item}</Text>
            <Text style={styles.chatLabel}>Borrower: {item.org}</Text>
          </View>
          <Text style={{fontFamily: typography.bodyBold, color: colors.rust.alert}}>
            {item.rating ? `★ ${item.rating}/5` : 'Pending'}
          </Text>
        </View>
      ))}
      {myLended.length === 0 && (
         <Text style={{color: colors.ink.soft, fontFamily: typography.body}}>No items lended yet.</Text>
      )}

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
    paddingTop: 60,
  },
  headerTitle: {
    fontFamily: typography.displayBold,
    fontSize: 32,
    color: colors.ink.text,
    marginBottom: 20,
  },
  card: {
    ...ui.card,
    padding: 24,
  },
  label: {
    ...ui.label,
    marginBottom: 4,
  },
  value: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.ink.text,
    marginBottom: 16,
  },
  chatCard: {
    ...ui.card,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 18,
    color: colors.ink.text,
  },
  chatLabel: {
    ...ui.label,
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

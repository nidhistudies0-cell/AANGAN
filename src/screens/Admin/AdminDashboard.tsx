import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, FlatList, Platform } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function AdminDashboard() {
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [activeNotices, setActiveNotices] = useState<any[]>([]);

  useEffect(() => {
    const qIssues = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
    const unsubIssues = onSnapshot(qIssues, (snapshot) => {
      setIssues(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qNotices = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubNotices = onSnapshot(qNotices, (snapshot) => {
      setActiveNotices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubIssues();
      unsubNotices();
    };
  }, []);

  const handlePublishNotice = async () => {
    if(!noticeTitle || !noticeBody) {
       Alert.alert("Missing Fields", "Title and Body are required.");
       return;
    }
    try {
       await addDoc(collection(db, 'notices'), {
         title: noticeTitle,
         body: noticeBody,
         author: auth.currentUser?.email || 'Admin',
         createdAt: new Date().toISOString()
       });
       Alert.alert('Notice Published', 'Notice has been sent to all students.');
       setNoticeTitle('');
       setNoticeBody('');
    } catch (e: any) {
       Alert.alert('Error', e.message);
    }
  };
  const handleDeleteNotice = async (noticeId: string) => {
    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, 'notices', noticeId));
      } catch(e: any) {
        Alert.alert('Error', e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this notice permanently?')) {
        performDelete();
      }
    } else {
      Alert.alert('Remove Notice', 'Are you sure you want to delete this notice permanently?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    try {
      await updateDoc(doc(db, 'issues', issueId), {
        status: 'resolved'
      });
      Alert.alert('Resolved', 'This issue has been marked as resolved and safely archived.');
    } catch(e: any) {
      Alert.alert('Error', 'Failed to resolve issue.');
    }
  };

  const handleCancelNotice = () => {
     setNoticeTitle('');
     setNoticeBody('');
  };
  const triggerEmergency = async (type: string) => {
    const activateEmergency = async () => {
      try {
        await addDoc(collection(db, 'emergency_alerts'), {
          type,
          message: `URGENT: ${type} situation declared. Please follow warden instructions immediately.`,
          timestamp: new Date().toISOString()
        });
        Alert.alert('Alert Broadcasted', 'Emergency push notification sent.');
      } catch (e: any) {
        Alert.alert('Error', e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`Trigger ${type} Emergency?\n\nThis will send an immediate full-screen alert to all students. Are you sure?`)) {
        activateEmergency();
      }
    } else {
      Alert.alert(
        `Trigger ${type} Emergency?`,
        'This will send an immediate full-screen alert to all students. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'ACTIVATE', 
            style: 'destructive',
            onPress: activateEmergency
          }
        ]
      );
    }
  };

  const renderIssue = ({ item }: any) => {
    if (item.status === 'resolved') return null; // Hide resolved issues
    return (
      <View style={styles.issueCard}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <View style={{flex: 1}}>
            <Text style={styles.issueTitle}>{item.title}</Text>
            <Text style={styles.issueRoom}>Room: {item.room}</Text>
          </View>
          <TouchableOpacity 
             style={{backgroundColor: colors.moss.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12}}
             onPress={() => handleResolveIssue(item.id)}
          >
             <Text style={{color: 'white', fontFamily: typography.bodyBold, fontSize: 12}}>✓ Resolve</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.issueDesc}>{item.description}</Text>
        <Text style={styles.issueReporter}>Reported by: {item.studentId}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Console</Text>
      
      <View style={ui.divider} />
      
      {/* Issues Viewer */}
      <Text style={styles.sectionTitle}>Student Complaints</Text>
      {issues.length === 0 ? (
        <Text style={{color: colors.ink.soft, fontFamily: typography.body, marginBottom: 20}}>No complaints raised.</Text>
      ) : (
        <View style={{height: 250, marginBottom: 20}}>
          <FlatList 
            data={issues.filter(i => i.status !== 'resolved')}
            keyExtractor={item => item.id}
            renderItem={renderIssue}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            ListEmptyComponent={<Text style={{color: colors.ink.soft, fontFamily: typography.body}}>All caught up!</Text>}
          />
        </View>
      )}

      <View style={ui.divider} />

      {/* Notice Publisher */}
      <Text style={styles.sectionTitle}>Publish Notice</Text>
      <View style={styles.card}>
        <TextInput 
          style={styles.input}
          placeholder="Notice Title"
          value={noticeTitle}
          onChangeText={setNoticeTitle}
        />
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Notice Details..."
          multiline
          value={noticeBody}
          onChangeText={setNoticeBody}
        />
        <TouchableOpacity 
          style={styles.publishBtn} 
          onPress={() => {
            if (Platform.OS === 'web') {
              if (confirm('Are you sure you want to publish this notice to all students?')) {
                handlePublishNotice();
              }
            } else {
              Alert.alert('Publish Notice', 'Send this notice to all students?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Publish', onPress: handlePublishNotice }
              ]);
            }
          }}
        >
          <Text style={styles.publishBtnText}>Publish Notice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{marginTop: 14, alignItems: 'center'}} onPress={handleCancelNotice}>
          <Text style={{fontFamily: typography.bodyMedium, color: colors.ink.soft}}>Cancel Draft</Text>
        </TouchableOpacity>
      </View>

      {/* Active Notices Manage */}
      <Text style={styles.sectionTitle}>Active Notices</Text>
      {activeNotices.length === 0 ? (
        <Text style={{color: colors.ink.soft, fontFamily: typography.body, marginBottom: 20}}>No active notices.</Text>
      ) : (
        <View style={{height: 200, marginBottom: 20}}>
          <FlatList 
            data={activeNotices}
            keyExtractor={item => item.id}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <View style={styles.issueCard}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={[styles.issueTitle, { color: colors.moss.dark }]}>{item.title}</Text>
                  <TouchableOpacity onPress={() => handleDeleteNotice(item.id)}>
                    <Text style={{color: colors.rust.alert, fontFamily: typography.bodyBold}}>🗑 Remove</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.issueDesc}>{item.body}</Text>
                <Text style={styles.issueReporter}>Author: {item.author}</Text>
              </View>
            )}
          />
        </View>
      )}

      <View style={ui.divider} />

      {/* Emergency Overrides */}
      <Text style={[styles.sectionTitle, { color: colors.rust.alert }]}>Emergency Overrides</Text>
      <TouchableOpacity 
        style={[styles.emergencyBtn, { backgroundColor: colors.rust.alert }]}
        onPress={() => triggerEmergency('MEDICAL')}
      >
        <Text style={styles.emergencyBtnText}>Trigger Medical Alert</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.emergencyBtn, { backgroundColor: '#8B0000' }]}
        onPress={() => triggerEmergency('SOS / THREAT')}
      >
        <Text style={styles.emergencyBtnText}>Trigger Security SOS</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => auth.signOut()}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stone.light,
    padding: ui.page.padding,
    paddingTop: 60,
  },
  header: {
    fontFamily: typography.displayBold,
    fontSize: 32,
    color: colors.ink.text,
  },
  sectionTitle: {
    fontFamily: typography.displayBold,
    fontSize: 24,
    color: colors.ink.text,
    marginBottom: 16,
  },
  card: {
    ...ui.card,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.sand.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  publishBtn: {
    ...ui.button,
    alignItems: 'center',
    paddingVertical: 14,
  },
  publishBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.cream.card,
    fontSize: 16,
  },
  emergencyBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyBtnText: {
    fontFamily: typography.bodyBold,
    color: 'white',
    fontSize: 16,
    letterSpacing: 1,
  },
  logoutBtn: {
    marginTop: 30,
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutBtnText: {
    fontFamily: typography.bodyBold,
    color: colors.ink.mid,
  },
  issueCard: {
    backgroundColor: colors.cream.card,
    borderWidth: 1,
    borderColor: colors.rust.light,
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  issueTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 18,
    color: colors.rust.alert,
  },
  issueRoom: {
    fontFamily: typography.bodyMedium,
    color: colors.ink.mid,
    marginBottom: 8,
  },
  issueDesc: {
    fontFamily: typography.body,
    color: colors.ink.text,
    marginBottom: 8,
  },
  issueReporter: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.ink.soft,
  }
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function GroupChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { postId, collectionName, title } = route.params;

  useEffect(() => {
    const fetchProfile = async () => {
      if(!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if(userDoc.exists()) {
        setProfile(userDoc.data());
      }
    };
    fetchProfile();
    
    const q = query(collection(db, `${collectionName}/${postId}/chat`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetched);
    });
    return unsubscribe;
  }, [postId, collectionName]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, `${collectionName}/${postId}/chat`), {
        text: message,
        sender: auth.currentUser?.email,
        senderName: profile?.name || 'User',
        createdAt: new Date().toISOString()
      });
      setMessage('');
    } catch(e) {
      console.log(e);
    }
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender === auth.currentUser?.email;
    return (
      <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.theirMsg]}>
        {!isMe && <Text style={styles.senderText}>{item.senderName || item.sender}</Text>}
        <Text style={[styles.msgText, isMe && styles.myMsgText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <FlatList 
        inverted
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 20 }}
      />

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Type message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment.background,
  },
  header: {
    backgroundColor: colors.cream.card,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: colors.sand.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    fontFamily: typography.bodyMedium,
    color: colors.clay.primary,
    marginRight: 15,
  },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 20,
    color: colors.ink.text,
  },
  msgBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  theirMsg: {
    backgroundColor: colors.cream.card,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.sand.border,
  },
  myMsg: {
    backgroundColor: colors.clay.primary,
    alignSelf: 'flex-end',
  },
  senderText: {
    ...ui.label,
    color: colors.ink.soft,
    marginBottom: 4,
  },
  msgText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.ink.text,
  },
  myMsgText: {
    color: colors.cream.card,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.cream.card,
    borderTopWidth: 1,
    borderColor: colors.sand.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.parchment.background,
    borderWidth: 1,
    borderColor: colors.sand.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: typography.body,
  },
  sendBtn: {
    marginLeft: 12,
    backgroundColor: colors.clay.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    fontFamily: typography.bodyBold,
    color: colors.cream.card,
  }
});

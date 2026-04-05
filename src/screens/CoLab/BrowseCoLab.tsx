import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function BrowseCoLab() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts_colab'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    });
    return unsubscribe;
  }, []);

  const filteredPosts = posts.filter(post => 
    post.status !== 'removed' && (
      post.idea?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.discipline?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleJoin = async (item: any) => {
    if (!auth.currentUser) return;
    const isMember = item.members?.includes(auth.currentUser.uid);
    
    if (isMember) {
      navigation.navigate('GroupChat', { postId: item.id, collectionName: 'posts_colab', title: item.idea });
      return;
    }

    if (item.limit && Number(item.limit) > 0) {
      try {
        await updateDoc(doc(db, 'posts_colab', item.id), {
          limit: (Number(item.limit) - 1).toString(),
          members: arrayUnion(auth.currentUser.uid)
        });
        navigation.navigate('GroupChat', { postId: item.id, collectionName: 'posts_colab', title: item.idea });
      } catch (e) {
        Alert.alert("Error", "Could not request join");
      }
    } else if (!item.limit) {
      await updateDoc(doc(db, 'posts_colab', item.id), {
        members: arrayUnion(auth.currentUser.uid)
      });
      navigation.navigate('GroupChat', { postId: item.id, collectionName: 'posts_colab', title: item.idea });
    } else {
      Alert.alert("Full", "This project team is full.");
    }
  };

  const handleDelete = (id: string) => {
    const performDelete = async () => {
      try {
        await updateDoc(doc(db, 'posts_colab', id), { status: 'removed' });
      } catch(e: any) {
        Alert.alert("Error", e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Delete your project post permanently?')) {
        performDelete();
      }
    } else {
      Alert.alert('Remove Post', 'Delete your project post permanently?', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: performDelete}
      ]);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <Text style={[styles.label, {marginBottom: 0}]}>{item.org}</Text>
        {item.org === auth.currentUser?.email && (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
             <Text style={{color: colors.rust.alert, fontFamily: typography.bodyMedium}}>🗑 Remove</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{item.idea}</Text>
      
      <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.discipline}</Text>
          </View>
      </View>

      <Text style={styles.spotsText}>{item.limit ? `${item.limit} limit` : 'No limit'}</Text>

      <TouchableOpacity 
        style={[styles.joinBtn, Number(item.limit) === 0 ? {backgroundColor: colors.sand.muted} : null]}
        onPress={() => handleJoin(item)}
      >
        <Text style={styles.joinBtnText}>
          {item.members?.includes(auth.currentUser?.uid) ? 'Open Chat' : (Number(item.limit) === 0 ? 'Full' : 'Request to Join')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>CoLab</Text>
          <Text style={styles.headerSubtitle}>Projects & Teams</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateCoLab')}>
          <Text style={styles.createBtnText}>+ CREATE</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search projects..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList 
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{textAlign: 'center', color: colors.ink.soft}}>No projects found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment.background,
    padding: ui.page.padding,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: typography.displayBold,
    fontSize: 36,
    color: colors.clay.dark,
  },
  headerSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.clay.primary,
  },
  createBtn: {
    backgroundColor: colors.clay.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  createBtnText: {
    fontFamily: typography.bodyBold,
    color: colors.cream.card,
    fontSize: 12,
  },
  searchInput: {
    backgroundColor: colors.cream.card,
    borderWidth: 1,
    borderColor: colors.sand.border,
    borderRadius: 10,
    padding: 12,
    fontFamily: typography.body,
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    ...ui.card,
    padding: 20,
    borderColor: colors.clay.light,
    borderWidth: 2,
  },
  label: {
    ...ui.label,
    color: colors.clay.primary,
    marginBottom: 8,
  },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 22,
    color: colors.ink.text,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.clay.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.clay.dark,
  },
  spotsText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.ink.soft,
    marginBottom: 16,
  },
  joinBtn: {
    ...ui.button,
    backgroundColor: colors.clay.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.cream.card,
    fontSize: 14,
  }
});

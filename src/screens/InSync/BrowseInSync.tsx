import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function BrowseInSync() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts_insync'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    });
    return unsubscribe;
  }, []);

  const filteredPosts = posts.filter(post => {
    // Basic date parsing
    const postDate = new Date(post.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isUpcoming = isNaN(postDate.getTime()) || postDate >= today;
    
    // Search
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.org?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return isUpcoming && matchesSearch;
  });

  const handleJoin = async (item: any) => {
    if (!auth.currentUser) return;
    const isMember = item.members?.includes(auth.currentUser.uid);
    
    if (isMember) {
      navigation.navigate('GroupChat', { postId: item.id, collectionName: 'posts_insync', title: item.title });
      return;
    }

    if (item.limit && Number(item.limit) > 0) {
      try {
        await updateDoc(doc(db, 'posts_insync', item.id), {
          limit: (Number(item.limit) - 1).toString(),
          members: arrayUnion(auth.currentUser.uid)
        });
        navigation.navigate('GroupChat', { postId: item.id, collectionName: 'posts_insync', title: item.title });
      } catch (e) {
        Alert.alert("Error", "Could not join group");
      }
    } else if (!item.limit) {
      // no limit
      await updateDoc(doc(db, 'posts_insync', item.id), {
        members: arrayUnion(auth.currentUser.uid)
      });
      navigation.navigate('GroupChat', { postId: item.id, collectionName: 'posts_insync', title: item.title });
    } else {
      Alert.alert("Full", "This activity has reached its limit of people.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Post', 'Delete your post permanently?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteDoc(doc(db, 'posts_insync', id));
        } catch(e: any) {
          Alert.alert("Error", e.message);
        }
      }}
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <Text style={[styles.label, {marginBottom: 0}]}>{item.org} • {item.time}</Text>
        {item.org === auth.currentUser?.email && (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
             <Text style={{color: colors.rust.alert, fontFamily: typography.bodyMedium}}>🗑 Remove</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      
      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.budget}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.limit ? `${item.limit} limit` : 'No limit'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.joinBtn, Number(item.limit) === 0 ? {backgroundColor: colors.sand.muted} : null]}
        onPress={() => handleJoin(item)}
      >
        <Text style={styles.joinBtnText}>
          {item.members?.includes(auth.currentUser?.uid) ? 'Open Chat' : (Number(item.limit) === 0 ? 'Full' : 'Join Group')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>InSync</Text>
          <Text style={styles.headerSubtitle}>Leisure & Activities</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateInSync')}>
          <Text style={styles.createBtnText}>+ CREATE</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search activities..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList 
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{textAlign: 'center', color: colors.ink.soft}}>No activities found.</Text>}
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
    color: colors.moss.dark,
  },
  headerSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.moss.secondary,
  },
  createBtn: {
    backgroundColor: colors.moss.secondary,
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
    borderColor: colors.moss.light,
    borderWidth: 2,
  },
  label: {
    ...ui.label,
    color: colors.moss.secondary,
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
    marginBottom: 20,
  },
  tag: {
    backgroundColor: colors.moss.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.moss.dark,
  },
  joinBtn: {
    ...ui.button,
    backgroundColor: colors.moss.secondary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.cream.card,
    fontSize: 14,
  }
});

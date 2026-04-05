import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { colors, typography, ui } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import StarRating from '../../components/StarRating';

export default function BrowseRequests() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState<any[]>([]);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'borrow_requests'), orderBy('createdAt', 'desc'));
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
      post.item?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.org?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleLend = async (post: any) => {
    try {
      if(!auth.currentUser) return;
      await updateDoc(doc(db, 'borrow_requests', post.id), {
        lenderId: auth.currentUser?.uid,
        status: 'lended'
      });
      // Log to user profile
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        lendedItems: arrayUnion({ itemId: post.id, item: post.item, to: post.org, date: new Date().toISOString() })
      });
      Alert.alert("Success", "You are now lending this item.");
    } catch {
      Alert.alert("Error", "Could not process request.");
    }
  };

  const handleApproveReturn = (post: any) => {
     setSelectedPost(post);
     setReviewVisible(true);
  };
  
  const submitReview = async () => {
    if (!selectedPost) return;
    try {
      await updateDoc(doc(db, 'borrow_requests', selectedPost.id), {
        status: 'returned',
        rating,
        feedback: reviewText
      });
      Alert.alert("Review Submitted", "Thank you for validating this return and leaving feedback!");
      setReviewVisible(false);
      setReviewText('');
      setRating(0);
      setSelectedPost(null);
    } catch {
      Alert.alert("Error", "Could not submit review.");
    }
  };

  const handleDelete = (id: string) => {
    const performDelete = async () => {
      try {
        await updateDoc(doc(db, 'borrow_requests', id), { status: 'removed' });
      } catch(e: any) {
        Alert.alert("Error", e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Delete your borrow request?')) {
        performDelete();
      }
    } else {
      Alert.alert('Remove Request', 'Delete your borrow request?', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: performDelete}
      ]);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <Text style={[styles.label, {marginBottom: 0}]}>{item.org} needs</Text>
        {item.org === auth.currentUser?.email && (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
             <Text style={{color: colors.rust.alert, fontFamily: typography.bodyMedium}}>🗑 Remove</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{item.item}</Text>
      
      <View style={styles.tag}>
        <Text style={styles.tagText}>For {item.period}</Text>
      </View>
      
      <View style={styles.actionRow}>
        {!item.lenderId && (
          <TouchableOpacity style={styles.joinBtn} onPress={() => handleLend(item)}>
            <Text style={styles.joinBtnText}>I'll lend this</Text>
          </TouchableOpacity>
        )}
        {item.lenderId === auth.currentUser?.uid && item.status !== 'returned' && (
          <TouchableOpacity style={[styles.joinBtn, { backgroundColor: colors.sand.muted }]} onPress={() => handleApproveReturn(item)}>
             <Text style={[styles.joinBtnText, {color: colors.ink.text}]}>Approve Return & Rate</Text>
          </TouchableOpacity>
        )}
        {item.status === 'returned' && (
          <Text style={{color: colors.moss.dark, fontFamily: typography.bodyMedium, marginTop: 8}}>Returned & Rated ★{item.rating}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>ShareRing</Text>
          <Text style={styles.headerSubtitle}>Borrow & Lend</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateRequest')}>
          <Text style={styles.createBtnText}>+ BORROW</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search requested items..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList 
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{textAlign: 'center', color: colors.ink.soft}}>No borrow requests found.</Text>}
      />

      {/* Review Modal popup */}
      <Modal visible={reviewVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Borrower</Text>
            <Text style={styles.modalSubtitle}>How was your experience lending to them?</Text>
            
            <StarRating rating={rating} setRating={setRating} />

            <TextInput 
              style={styles.reviewInput}
              placeholder="Leave feedback..."
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
              <Text style={styles.submitBtnText}>Submit Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setReviewVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    color: colors.bark.tertiary,
  },
  headerSubtitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 16,
    color: colors.bark.tertiary,
  },
  createBtn: {
    backgroundColor: colors.bark.tertiary,
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
    borderColor: colors.bark.light,
    borderWidth: 2,
  },
  label: {
    ...ui.label,
    color: colors.bark.tertiary,
    marginBottom: 8,
  },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 22,
    color: colors.ink.text,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.bark.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  tagText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.bark.tertiary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  joinBtn: {
    ...ui.button,
    backgroundColor: colors.bark.tertiary,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  joinBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.cream.card,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(42, 31, 20, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    ...ui.card,
    padding: 24,
  },
  modalTitle: {
    fontFamily: typography.displayBold,
    fontSize: 24,
    color: colors.ink.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: typography.bodyMedium,
    color: colors.ink.mid,
    marginBottom: 20,
  },
  reviewInput: {
    fontFamily: typography.body,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.sand.border,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: colors.bark.tertiary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.cream.card,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.ink.soft,
  }
});

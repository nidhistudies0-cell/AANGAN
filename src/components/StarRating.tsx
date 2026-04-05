import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function StarRating({ rating, setRating }: { rating: number, setRating: (r: number) => void }) {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.star}>
          <Text style={[styles.starText, star <= rating ? styles.filled : styles.empty]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  star: {
    padding: 4,
  },
  starText: {
    fontSize: 32,
  },
  filled: {
    color: colors.clay.primary,
  },
  empty: {
    color: colors.sand.border,
  }
});

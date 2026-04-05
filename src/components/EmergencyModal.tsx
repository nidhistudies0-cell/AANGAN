import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, ui } from '../../src/theme';

export default function EmergencyModal({
  visible,
  type,
  message,
  timestamp,
  onDismiss
}: {
  visible: boolean;
  type: string;
  message: string;
  timestamp: string;
  onDismiss: () => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
          
          <Text style={styles.alertLabel}>EMERGENCY ALERT</Text>
          <Text style={styles.title}>{type}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>I HAVE READ THIS (DISMISS)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(184, 92, 56, 0.95)', // rust alert color with opacity
    justifyContent: 'center',
    alignItems: 'center',
    padding: ui.page.padding,
  },
  card: {
    backgroundColor: colors.cream.card,
    borderRadius: 14,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  pulseDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.rust.alert,
    marginBottom: 20,
  },
  alertLabel: {
    ...ui.label,
    color: colors.rust.alert,
    fontSize: 14,
    marginBottom: 12,
  },
  title: {
    fontFamily: typography.displayBold,
    fontSize: 32,
    color: colors.ink.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.bodyMedium,
    fontSize: 18,
    color: colors.ink.mid,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  timestamp: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: colors.ink.soft,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.ink.text,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: typography.bodyBold,
    color: colors.parchment.background,
    letterSpacing: 1,
  }
});

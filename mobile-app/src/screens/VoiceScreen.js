import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card } from '../components';
import { colors, spacing, borderRadius } from '../theme';
import { useUserStore, useScanStore } from '../store';
import { useGeolocation } from '../hooks/useGeolocation';
import { voiceInput } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function VoiceScreen({ navigation }) {
  const { t } = useTranslation();
  const { userId, language } = useUserStore();
  const { setScan } = useScanStore();
  const { latitude, longitude } = useGeolocation();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setLoading(true);
    setError(null);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      console.log('Sending audio to backend...');
      const result = await voiceInput(uri, userId, latitude, longitude, language);
      console.log('Voice result:', result);

      setScan(result, result.global_docs || [], result.personal_docs || []);
      setRecording(null);
      navigation.navigate('Result');
    } catch (err) {
      console.error('Voice input error:', err);
      setError(err.message || 'Failed to process voice input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← {t('back')}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Text style={styles.icon}>🎤</Text>
        </View>
        <Text style={styles.title}>{t('voiceInput')}</Text>
      </View>

      <View style={styles.recordSection}>
        {isRecording ? (
          <TouchableOpacity onPress={stopRecording}>
            <LinearGradient
              colors={[colors.danger, colors.warning]}
              style={styles.recordButton}
            >
              <Text style={styles.recordIcon}>⬛</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startRecording} disabled={loading}>
            <LinearGradient
              colors={[colors.leafLight, colors.forest]}
              style={styles.recordButton}
            >
              <Text style={styles.recordIcon}>🎤</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.recordText}>
          {loading ? t('processing') : isRecording ? t('recording') : t('tapToRecord')}
        </Text>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t('whatHappens')}</Text>
        <View style={styles.infoList}>
          <Text style={styles.infoItem}>🎙️ Whisper transcribes your voice</Text>
          <Text style={styles.infoItem}>📚 RAG searches knowledge base</Text>
          <Text style={styles.infoItem}>✨ LLM generates answer</Text>
          <Text style={styles.infoItem}>🌐 Translated to your language</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.forest,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.forest,
  },
  recordSection: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  recordIcon: {
    fontSize: 48,
  },
  recordText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.forest,
  },
  errorCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.danger,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.sageLight + '20',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.md,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    fontSize: 14,
    color: colors.moss,
  },
});

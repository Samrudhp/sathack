import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button, Loader } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useUserStore, useScanStore } from '../store';
import { useGeolocation } from '../hooks/useGeolocation';
import { scanImage } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function ScanScreen({ navigation }) {
  const { t } = useTranslation();
  const { userId, language } = useUserStore();
  const { setScan } = useScanStore();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to scan waste items');
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      setCapturedImage(photo.uri);
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleUpload = async () => {
    if (!capturedImage) return;

    if (locationLoading) {
      setError(t('loading'));
      return;
    }

    if (!latitude || !longitude) {
      setError('Location required. Please enable location access.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Uploading image to backend...');
      const result = await scanImage(capturedImage, userId, latitude, longitude, language);
      console.log('Scan result:', result);

      setScan(result, result.global_docs || [], result.personal_docs || []);
      navigation.navigate('Result');
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setError(null);
  };

  if (!permission) {
    return <Loader />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Card style={styles.permissionCard}>
          <Text style={styles.permissionText}>We need camera permission</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </Card>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.cameraActions}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              >
                <Text style={styles.flipButtonText}>🔄</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <View style={styles.flipButton} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.spinner}>
            <LinearGradient
              colors={[colors.sage, colors.leafLight]}
              style={styles.spinnerGradient}
            />
          </View>
          <Text style={styles.loadingTitle}>{t('processing')}</Text>
          <Text style={styles.loadingDesc}>{t('processingDesc')}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← {t('back')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>📸</Text>
        </View>
        <Text style={styles.title}>{t('scanWasteTitle')}</Text>
      </View>

      {!capturedImage ? (
        <>
          <TouchableOpacity
            style={styles.captureCard}
            onPress={() => setShowCamera(true)}
          >
            <LinearGradient
              colors={[colors.sageLight + '40', colors.sage + '20']}
              style={styles.captureGradient}
            >
              <View style={styles.captureIcon}>
                <LinearGradient
                  colors={[colors.leafLight, colors.forest]}
                  style={styles.captureIconGradient}
                >
                  <Text style={styles.captureIconText}>📸</Text>
                </LinearGradient>
              </View>
              <Text style={styles.captureTitle}>{t('capturePhoto')}</Text>
              <Text style={styles.captureDesc}>{t('captureDesc')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Button
            title="Or Choose from Gallery"
            onPress={pickImage}
            variant="outline"
            style={styles.galleryButton}
          />

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('whatHappens')}</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>🤖 {t('clipAnalysis')}</Text>
              <Text style={styles.infoItem}>📚 {t('ragSearch')}</Text>
              <Text style={styles.infoItem}>📍 {t('osmFind')}</Text>
              <Text style={styles.infoItem}>✨ {t('llmGenerate')}</Text>
              <Text style={styles.infoItem}>🌐 {t('translated')}</Text>
            </View>
          </Card>
        </>
      ) : (
        <>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Preview:</Text>
            <Image source={{ uri: capturedImage }} style={styles.preview} />
          </View>

          <View style={styles.actions}>
            <Button
              title="Retake"
              onPress={retake}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="🚀 Scan & Classify"
              onPress={handleUpload}
              loading={loading}
              style={styles.actionButton}
            />
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.forest,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.leafLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.forest,
  },
  captureCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  captureGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  captureIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  captureIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIconText: {
    fontSize: 48,
  },
  captureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.sm,
  },
  captureDesc: {
    fontSize: 14,
    color: colors.moss,
    textAlign: 'center',
  },
  galleryButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
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
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    margin: spacing.xl,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 24,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.forest,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  spinnerGradient: {
    flex: 1,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.sm,
  },
  loadingDesc: {
    fontSize: 14,
    color: colors.moss,
    textAlign: 'center',
  },
  previewCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.md,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.sand,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  errorCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.danger,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  permissionCard: {
    margin: spacing.xl,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 18,
    color: colors.forest,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});

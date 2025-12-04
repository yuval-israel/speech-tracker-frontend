import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { useRoute, useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import { API_BASE } from '../api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Layout } from '../theme';

export default function RecordScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { token } = useAuth();

  const { childId, childName } = route.params || {};

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (!isRecording && duration !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setDuration(0);
      setUploadError('');
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      setUploadError('Failed to start recording. Please try again.');
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    setRecordingUri(uri);
    console.log('Recording stopped and stored at', uri);
    setRecording(null);
  }

  async function uploadRecording() {
    if (!recordingUri) {
      setUploadError('No recording to upload');
      return;
    }

    if (!childId) {
      setUploadError('Child ID is missing');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();

      // Create file object for upload
      const filename = `recording_${Date.now()}.wav`;

      if (Platform.OS === 'web') {
        const audioBlob = await fetch(recordingUri).then(r => r.blob());
        const mimeType = audioBlob.type;
        let ext = 'wav';
        if (mimeType.includes('webm')) ext = 'webm';
        else if (mimeType.includes('mp4')) ext = 'mp4';
        else if (mimeType.includes('ogg')) ext = 'ogg';

        const webFilename = `recording_${Date.now()}.${ext}`;
        formData.append('file', audioBlob, webFilename);
      } else {
        const fileToUpload = {
          uri: recordingUri,
          type: 'audio/wav',
          name: filename, // Native usually records as wav/caf, keeping .wav for now
        };
        formData.append('file', fileToUpload);
      }

      const response = await fetch(`${API_BASE}/recordings/?child_id=${childId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.detail || `Upload failed with status ${response.status}`;
        if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Upload Success",
            body: "Your recording has been uploaded successfully!",
          },
          trigger: null,
        });
      } catch (err) {
        console.log('Failed to schedule notification', err);
      }

      navigation.navigate('Home');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload recording. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function discardRecording() {
    setRecordingUri(null);
    setDuration(0);
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text color={Colors.primary}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text variant="h1" align="center">Record Session</Text>
        {childName && (
          <Text variant="body" align="center" color={Colors.textLight} style={styles.childName}>
            {childName}
          </Text>
        )}

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatDuration(duration)}</Text>
        </View>

        {uploadError ? (
          <Text style={styles.errorText}>{uploadError}</Text>
        ) : null}

        {uploading ? (
          <LoadingIndicator text="Uploading recording..." />
        ) : recordingUri ? (
          <View style={styles.controls}>
            <Text align="center" style={styles.readyText}>
              Recording ready to upload
            </Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                title="Upload"
                onPress={uploadRecording}
                style={styles.uploadButton}
              />
              <TouchableOpacity onPress={discardRecording} style={styles.discardButton}>
                <Text color={Colors.danger}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[styles.innerRecordButton, isRecording && styles.innerRecordingActive]} />
            </TouchableOpacity>
            <Text style={styles.statusText}>
              {isRecording ? 'Recording...' : 'Tap to Record'}
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  childName: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  timerContainer: {
    marginVertical: Spacing.xxl,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    color: Colors.text,
  },
  controls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recordingActive: {
    borderColor: Colors.danger,
  },
  innerRecordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  innerRecordingActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  statusText: {
    color: Colors.textLight,
    fontSize: 16,
  },
  readyText: {
    fontSize: 18,
    marginBottom: Spacing.lg,
    color: Colors.success,
    fontWeight: '500',
  },
  buttonGroup: {
    width: '100%',
    gap: Spacing.md,
  },
  uploadButton: {
    marginBottom: Spacing.sm,
  },
  discardButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});

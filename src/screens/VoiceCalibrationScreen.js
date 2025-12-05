import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import { API_BASE } from '../api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../theme';
import ExpertAvatar from '../components/ExpertAvatar';

const createInitialStampState = () => ({
  recording: null,
  isRecording: false,
  uri: null,
  uploading: false,
});

export default function VoiceCalibrationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const { childId } = route.params || {};

  const [parentStamp, setParentStamp] = useState(createInitialStampState);
  const [childStamp, setChildStamp] = useState(createInitialStampState);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [error, setError] = useState('');

  const ensurePermission = async () => {
    if (!permissionResponse || permissionResponse.status !== 'granted') {
      const response = await requestPermission();
      if (!response || response.status !== 'granted') {
        throw new Error('Microphone permission is required.');
      }
    }
  };

  const startRecording = async (type) => {
    try {
      setError('');
      await ensurePermission();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      const update = type === 'parent' ? setParentStamp : setChildStamp;
      update((prev) => ({
        ...prev,
        recording,
        isRecording: true,
        uri: null,
      }));
    } catch (err) {
      console.error('Failed to start calibration recording', err);
      setError(err.message || 'Failed to start recording.');
    }
  };

  const stopRecording = async (type) => {
    const state = type === 'parent' ? parentStamp : childStamp;
    if (!state.recording) return;

    try {
      await state.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = state.recording.getURI();

      const update = type === 'parent' ? setParentStamp : setChildStamp;
      update((prev) => ({
        ...prev,
        recording: null,
        isRecording: false,
        uri,
      }));
    } catch (err) {
      console.error('Failed to stop calibration recording', err);
      setError(err.message || 'Failed to stop recording.');
    }
  };

  const discardStamp = (type) => {
    const update = type === 'parent' ? setParentStamp : setChildStamp;
    update(createInitialStampState());
  };

  const uploadStamp = async (type) => {
    const state = type === 'parent' ? parentStamp : childStamp;
    if (!state.uri) {
      setError('No recording to upload.');
      return;
    }

    if (!childId) {
      setError('Child ID is missing for voice calibration.');
      return;
    }

    const update = type === 'parent' ? setParentStamp : setChildStamp;
    update((prev) => ({ ...prev, uploading: true }));
    setError('');

    try {
      const formData = new FormData();
      const filename = `${type}_voice_${Date.now()}.wav`;
      const fileToUpload = {
        uri: state.uri,
        type: 'audio/wav',
        name: filename,
      };

      formData.append('file', fileToUpload);
      // speaker_name is passed as query parameter to match backend API

      const speakerName = type === 'parent' ? 'parent' : 'child';
      const response = await fetch(`${API_BASE}/voice-stamps/?child_id=${childId}&speaker_name=${speakerName}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }

      Alert.alert(
        'Voice stamp saved',
        type === 'parent'
          ? 'Parent voice stamp uploaded successfully.'
          : 'Child voice stamp uploaded successfully.'
      );

      update((prev) => ({
        ...prev,
        uploading: false,
      }));
    } catch (err) {
      console.error('Voice stamp upload error:', err);
      setError(err.message || 'Failed to upload voice stamp.');
      update((prev) => ({ ...prev, uploading: false }));
    }
  };

  const allDone = !!parentStamp.uri && !!childStamp.uri;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text color={Colors.primary}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          Define Family Voices
        </Text>

        <View style={{ marginBottom: Spacing.lg }}>
          <ExpertAvatar
            message="To help our AI understand your family, please record a short sample of your voice and your child's voice. This takes less than a minute!"
            compact={false}
          />
        </View>

        <View style={styles.card}>
          <Text variant="h3" style={styles.cardTitle}>
            Parent Voice
          </Text>
          <Text variant="small" color={Colors.textLight} style={styles.cardDescription}>
            Ask the parent to say a few simple sentences in a calm tone.
          </Text>

          <CalibrationControls
            type="parent"
            state={parentStamp}
            onStart={startRecording}
            onStop={stopRecording}
            onUpload={uploadStamp}
            onDiscard={discardStamp}
          />
        </View>

        <View style={styles.card}>
          <Text variant="h3" style={styles.cardTitle}>
            Child Voice
          </Text>
          <Text variant="small" color={Colors.textLight} style={styles.cardDescription}>
            Invite your child to say their name and a favorite thing they like to do.
          </Text>

          <CalibrationControls
            type="child"
            state={childStamp}
            onStart={startRecording}
            onStop={stopRecording}
            onUpload={uploadStamp}
            onDiscard={discardStamp}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title={allDone ? 'Continue' : 'Skip for now'}
          onPress={() => navigation.goBack()}
          style={styles.footerButton}
        />
      </View>
    </ScreenContainer>
  );
}

const CalibrationControls = ({ type, state, onStart, onStop, onUpload, onDiscard }) => {
  const { isRecording, uri, uploading } = state;

  return (
    <View style={styles.controls}>
      {uploading ? (
        <LoadingIndicator text="Uploading..." />
      ) : uri ? (
        <>
          <Text variant="small" color={Colors.success} style={styles.readyText}>
            Voice stamp ready to upload
          </Text>
          <View style={styles.buttonRow}>
            <PrimaryButton
              title="Upload"
              onPress={() => onUpload(type)}
              style={styles.primaryAction}
            />
            <TouchableOpacity onPress={() => onDiscard(type)} style={styles.secondaryAction}>
              <Text color={Colors.danger}>Discard</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={isRecording ? () => onStop(type) : () => onStart(type)}
          >
            <View
              style={[styles.recordInner, isRecording && styles.recordInnerActive]}
            />
          </TouchableOpacity>
          <Text variant="small" color={Colors.textLight} style={styles.statusText}>
            {isRecording ? 'Recording… tap to stop' : 'Tap to record voice sample'}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    marginBottom: Spacing.md,
  },
  controls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  recordButtonActive: {
    borderColor: Colors.danger,
  },
  recordInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
  recordInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: Colors.danger,
  },
  statusText: {
    textAlign: 'center',
  },
  readyText: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    marginLeft: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  error: {
    color: Colors.danger,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  footerButton: {
    marginTop: Spacing.lg,
  },
});



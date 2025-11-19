import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { authFetch } from '../api';

export default function RecordScreen({ token, child, onAnalysisReady, onRecordingFinished, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null); // for web WAV blob
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0); // seconds

  // Refs for media recorder (web) and polling interval
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const pollRef = useRef(null);
  const durationRef = useRef(null);
  const pollStartRef = useRef(null);

  // Expo Audio Recorder for native platforms
  const audioRecorder = Platform.OS !== 'web' ? useAudioRecorder(RecordingPresets.HIGH_QUALITY) : null;

  useEffect(() => {
    let cancelled = false;
    // Request microphone permission on native
    if (Platform.OS !== 'web') {
      AudioModule.requestRecordingPermissionsAsync().then(status => {
        if (!status.granted && !cancelled) {
          setError('Microphone permission is required to record.');
        }
      });
    }
    return () => { 
      cancelled = true;
      // Cleanup: stop any ongoing polling
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
      // Stop media stream if any
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setError('');
    setRecordingDuration(0);
    // Start recording depending on platform
    if (Platform.OS === 'web') {
      try {
        // If no existing stream, request one
        if (!mediaStreamRef.current) {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        const options = { mimeType: 'audio/webm' };
        const mr = new MediaRecorder(mediaStreamRef.current, options);
        const chunks = [];
        mr.ondataavailable = e => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        mr.onstop = async () => {
          // Combine chunks into one blob
          const blob = new Blob(chunks, { type: 'audio/webm' });
          try {
            // Decode audio data and encode as WAV
            const arrayBuf = await blob.arrayBuffer();
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
            const wavBuffer = encodeWav(audioBuf);
            const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
            setRecordedBlob(wavBlob);
            setHasRecording(true);
            audioCtx.close();
          } catch (convErr) {
            console.error('Conversion to WAV failed:', convErr);
            setError('Could not process audio recording.');
          }
        };
        mediaRecorderRef.current = mr;
        mr.start();
        // start duration timer
        if (durationRef.current) clearInterval(durationRef.current);
        durationRef.current = setInterval(() => {
          setRecordingDuration(d => d + 1);
        }, 1000);
        setIsRecording(true);
      } catch (err) {
        console.error('MediaRecorder start error:', err);
        setError('Recording not supported or permission denied.');
      }
    } else {
      try {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        // start duration timer
        if (durationRef.current) clearInterval(durationRef.current);
        durationRef.current = setInterval(() => {
          setRecordingDuration(d => d + 1);
        }, 1000);
        setIsRecording(true);
      } catch (err) {
        console.error('Error starting recording:', err);
        setError('Could not start recording.');
      }
    }
  };

  const stopRecording = async () => {
    setError('');
    if (Platform.OS === 'web') {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (durationRef.current) {
        clearInterval(durationRef.current);
        durationRef.current = null;
      }
      // hasRecording will be set in onstop event
    } else {
      try {
        await audioRecorder.stop();
        setIsRecording(false);
        if (durationRef.current) {
          clearInterval(durationRef.current);
          durationRef.current = null;
        }
        setHasRecording(true);
      } catch (err) {
        console.error('Error stopping recording:', err);
        setError('Could not stop recording properly.');
      }
    }
  };

  const uploadRecording = async () => {
    setError('');
    setIsUploading(true);
    // set polling start time for timeout
    pollStartRef.current = Date.now();
    const POLL_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
    try {
      // Prepare form data with the audio file
      const formData = new FormData();
      if (Platform.OS === 'web') {
        formData.append('file', new File([recordedBlob], 'audio.wav', { type: 'audio/wav' }));
      } else {
        // Use recorded file URI
        let fileUri = null;
        try {
          if (typeof audioRecorder.getURI === 'function') {
            fileUri = await audioRecorder.getURI();
          }
        } catch (e) {
          // ignore
        }
        fileUri = fileUri || audioRecorder.audioRecorder?.uri || audioRecorder.uri;
        formData.append('file', { uri: fileUri, name: 'audio.wav', type: 'audio/wav' });
      }
      const res = await authFetch(`/recordings?child_id=${child.id}`, token, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data.detail || 'Upload failed';
        throw new Error(detail);
      }
      const recordingData = await res.json();
      const recId = recordingData.id;
      // Poll for analysis completion
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await authFetch(`/recordings/by-id/${recId}`, token);
          if (!statusRes.ok) {
            throw new Error('Status check failed');
          }
          const rec = await statusRes.json();
          // timeout check
          if (pollStartRef.current && Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setIsUploading(false);
            setError('Analysis timed out. Please try again later.');
            return;
          }

          if (rec.status === 'ready') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setIsUploading(false);
            // Prefer the newer prop name `onRecordingFinished`, but fall back to
            // `onAnalysisReady` for backward compatibility.
            if (typeof onRecordingFinished === 'function') {
              onRecordingFinished(recId);
            } else if (typeof onAnalysisReady === 'function') {
              onAnalysisReady(recId);
            }
          } else if (rec.status === 'failed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setIsUploading(false);
            setError('Analysis failed. Please try recording again.');
          }
        } catch (err) {
          console.error('Error polling status:', err);
          // If polling fails due to network, keep trying until timeout (not implemented here)
        }
      }, 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed.');
      setIsUploading(false);
    }
  };

  // Helper to encode AudioBuffer to WAV format (16-bit PCM)
  function encodeWav(audioBuf) {
    const numChannels = audioBuf.numberOfChannels;
    const sampleRate = audioBuf.sampleRate;
    const samples = audioBuf.getChannelData(0).length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    // Write WAV header
    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; ++i) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    // Write interleaved PCM samples
    let offset = 44;
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = audioBuf.getChannelData(ch)[i];
        // Clamp and convert to int16
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    return buffer;
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isUploading && (
        <>
          {!isRecording && !hasRecording && (
            <Button title="Start Recording" onPress={startRecording} />
          )}
          {isRecording && (
            <Button title="Stop Recording" onPress={stopRecording} />
          )}
          {!isRecording && hasRecording && (
            <>
              <Button title="Analyze Recording" onPress={uploadRecording} />
              <Button title="Record Again" color="#555" onPress={() => {
                setHasRecording(false);
                setRecordedBlob(null);
                setError('');
                setRecordingDuration(0);
              }} />
            </>
          )}
        </>
      )}
      {isUploading && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <ActivityIndicator size="large" />
          <Text style={styles.processing}>Processing recording, please wait...</Text>
        </View>
      )}
      {(isRecording || recordingDuration > 0) && (
        <Text style={styles.duration}>Duration: {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}</Text>
      )}
      <Button title="Cancel" color="#555" onPress={onCancel} disabled={isRecording || isUploading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center'
  },
  processing: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16
  }
});

import React, { createContext, useState, useEffect } from 'react';
import authService from './services/auth';
import { setOnUnauthorized } from './api';
import { ActivityIndicator, View } from 'react-native';
import { Platform } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ChildListScreen from './screens/ChildListScreen';
import AddChildScreen from './screens/AddChildScreen';
import ChildDetailScreen from './screens/ChildDetailScreen';
import RecordScreen from './screens/RecordScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChild, setCurrentChild] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [analysisRecordId, setAnalysisRecordId] = useState(null);

  // Expose a simple AuthContext for screens to use in later steps
  const AuthContext = createContext({
    token: null,
    setToken: () => {},
    logout: () => {},
  });

  // Handlers for navigation and state updates (named to match requested props)
  const onLogin = (authToken) => {
    setToken(authToken);
    // persist token
    authService.setToken(authToken).catch(() => {});
    setCurrentScreen('childList');
  };

  const onRegisterSuccess = (authToken) => {
    if (authToken) {
      setToken(authToken);
      authService.setToken(authToken).catch(() => {});
      // After sign up, navigate to Add Child screen to create first child
      setCurrentScreen('addChild');
    } else {
      // If registration login failed, go to login screen
      setCurrentScreen('login');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentChild(null);
    setAnalysisRecordId(null);
    setCurrentScreen('login');
    authService.clearToken().catch(() => {});
  };

  // On mount try to restore token from storage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await authService.getToken();
        if (mounted && t) {
          setToken(t);
        }
      } catch (err) {
        console.error('Error restoring token', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    // register global unauthorized handler to force logout
    setOnUnauthorized(() => {
      // ensure we run logout on the JS thread
      handleLogout();
    });
    return () => { mounted = false; setOnUnauthorized(null); };
  }, []);

  const onChildSelected = (child) => {
    setCurrentChild(child);
    setCurrentScreen('childDetail');
  };

  const onChildAdded = (child) => {
    setCurrentChild(child);
    setCurrentScreen('childDetail');
  };

  const onStartRecording = (child) => {
    if (child) setCurrentChild(child);
    setCurrentScreen('record');
  };

  const onRecordingFinished = (recordingId) => {
    setAnalysisRecordId(recordingId);
    setCurrentScreen('analysis');
  };

  // Determine which screen component to show
  let screenComponent;
  if (isLoading) {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!token) {
    // Not logged in: show login or register
    if (currentScreen === 'register') {
      screenComponent = (
        <RegisterScreen 
          onRegisterSuccess={onRegisterSuccess}
          onSwitchToLogin={() => setCurrentScreen('login')}
        />
      );
    } else {
      screenComponent = (
        <LoginScreen
          onLogin={onLogin}
          onSwitchToRegister={() => setCurrentScreen('register')}
        />
      );
    }
  } else {
    // Logged in: show appropriate authenticated screen
    switch (currentScreen) {
      case 'childList':
        screenComponent = (
          <ChildListScreen
            token={token}
            onChildSelected={onChildSelected}
            onAddChild={() => setCurrentScreen('addChild')}
            onLogout={handleLogout}
          />
        );
        break;
      case 'addChild':
        screenComponent = (
          <AddChildScreen
            token={token}
            onChildAdded={onChildAdded}
            onCancel={() => setCurrentScreen('childList')}
          />
        );
        break;
      case 'childDetail':
        screenComponent = (
          <ChildDetailScreen
            token={token}
            child={currentChild}
            onStartRecording={onStartRecording}
            onViewAnalysis={(id) => onRecordingFinished(id)}
            onBack={() => setCurrentScreen('childList')}
          />
        );
        break;
      case 'record':
        screenComponent = (
          <RecordScreen
            token={token}
            child={currentChild}
            onRecordingFinished={(id) => onRecordingFinished(id)}
            onCancel={() => setCurrentScreen('childDetail')}
          />
        );
        break;
      case 'analysis':
        screenComponent = (
          <AnalysisScreen
            token={token}
            recordingId={analysisRecordId}
            child={currentChild}
            onBack={() => setCurrentScreen('childDetail')}
          />
        );
        break;
      default:
        screenComponent = (
          <ChildListScreen
            token={token}
            onChildSelected={onChildSelected}
            onAddChild={() => setCurrentScreen('addChild')}
            onLogout={handleLogout}
          />
        );
    }
  }

  return (
    <>
      {screenComponent}
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
    </>
  );
}

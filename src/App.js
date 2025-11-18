import React, { useState } from 'react';
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
  const [currentChild, setCurrentChild] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [analysisRecordId, setAnalysisRecordId] = useState(null);

  // Handlers for navigation and state updates
  const handleLoginSuccess = (authToken) => {
    setToken(authToken);
    setCurrentScreen('childList');
  };
  const handleRegisterSuccess = (authToken) => {
    if (authToken) {
      setToken(authToken);
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
    setCurrentScreen('login');
  };
  const handleChildSelected = (child) => {
    setCurrentChild(child);
    setCurrentScreen('childDetail');
  };
  const handleChildAdded = (child) => {
    setCurrentChild(child);
    setCurrentScreen('childDetail');
  };
  const handleStartRecording = () => {
    setCurrentScreen('record');
  };
  const handleAnalysisRequested = (recordingId) => {
    setAnalysisRecordId(recordingId);
    setCurrentScreen('analysis');
  };

  // Determine which screen component to show
  let screenComponent;
  if (!token) {
    // Not logged in: show login or register
    if (currentScreen === 'register') {
      screenComponent = (
        <RegisterScreen 
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setCurrentScreen('login')}
        />
      );
    } else {
      screenComponent = (
        <LoginScreen
          onLogin={handleLoginSuccess}
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
            onSelectChild={handleChildSelected}
            onAddChild={() => setCurrentScreen('addChild')}
            onLogout={handleLogout}
          />
        );
        break;
      case 'addChild':
        screenComponent = (
          <AddChildScreen
            token={token}
            onChildAdded={handleChildAdded}
            onCancel={() => setCurrentScreen('childList')}
          />
        );
        break;
      case 'childDetail':
        screenComponent = (
          <ChildDetailScreen
            token={token}
            child={currentChild}
            onStartRecording={handleStartRecording}
            onViewAnalysis={(id) => handleAnalysisRequested(id)}
            onBack={() => setCurrentScreen('childList')}
          />
        );
        break;
      case 'record':
        screenComponent = (
          <RecordScreen
            token={token}
            child={currentChild}
            onAnalysisReady={(id) => handleAnalysisRequested(id)}
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
            onSelectChild={handleChildSelected}
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

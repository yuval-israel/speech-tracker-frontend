import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_CHILD_KEY = 'SELECTED_CHILD';
const FAMILY_CONFIGURED_KEY = 'FAMILY_CONFIGURED';

const AuthContext = createContext({
    token: null,
    isLoading: true,
    selectedChild: null,
    hasConfiguredFamily: false,
    signIn: async (token) => { },
    signOut: async () => { },
    setSelectedChild: (child) => { },
    setHasConfiguredFamily: (value) => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChild, setSelectedChildState] = useState(null);
    const [hasConfiguredFamily, setHasConfiguredFamilyState] = useState(false);

    // Load token and selected child from storage on app startup
    useEffect(() => {
        const loadData = async () => {
            try {
                const savedToken = await authService.getToken();
                if (savedToken) {
                    setToken(savedToken);
                }
                const savedChild = await AsyncStorage.getItem(SELECTED_CHILD_KEY);
                if (savedChild) {
                    setSelectedChildState(JSON.parse(savedChild));
                }
                const familyConfigured = await AsyncStorage.getItem(FAMILY_CONFIGURED_KEY);
                if (familyConfigured === 'true') {
                    setHasConfiguredFamilyState(true);
                }
            } catch (error) {
                console.error('Failed to load auth data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const signIn = useCallback(async (newToken) => {
        setToken(newToken);
        await authService.setToken(newToken);
    }, []);

    const signOut = useCallback(async () => {
        setToken(null);
        setSelectedChildState(null);
        setHasConfiguredFamilyState(false);
        await authService.clearToken();
        await AsyncStorage.removeItem(SELECTED_CHILD_KEY);
        await AsyncStorage.removeItem(FAMILY_CONFIGURED_KEY);
    }, []);

    const setSelectedChild = useCallback(async (child) => {
        setSelectedChildState(child);
        if (child) {
            await AsyncStorage.setItem(SELECTED_CHILD_KEY, JSON.stringify(child));
        } else {
            await AsyncStorage.removeItem(SELECTED_CHILD_KEY);
        }
    }, []);

    const setHasConfiguredFamily = useCallback(async (value) => {
        setHasConfiguredFamilyState(value);
        await AsyncStorage.setItem(FAMILY_CONFIGURED_KEY, value ? 'true' : 'false');
    }, []);

    return (
        <AuthContext.Provider value={{
            token,
            isLoading,
            setIsLoading,
            setToken,
            signIn,
            signOut,
            selectedChild,
            setSelectedChild,
            hasConfiguredFamily,
            setHasConfiguredFamily
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

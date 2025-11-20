import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/auth';

const AuthContext = createContext({
    token: null,
    isLoading: true,
    signIn: async (token) => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load token from storage on app startup
    useEffect(() => {
        const loadToken = async () => {
            try {
                const savedToken = await authService.getToken();
                if (savedToken) {
                    setToken(savedToken);
                }
            } catch (error) {
                console.error('Failed to load token:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const signIn = useCallback(async (newToken) => {
        setToken(newToken);
        await authService.setToken(newToken);
    }, []);

    const signOut = useCallback(async () => {
        setToken(null);
        await authService.clearToken();
    }, []);

    return (
        <AuthContext.Provider value={{ token, isLoading, setIsLoading, setToken, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

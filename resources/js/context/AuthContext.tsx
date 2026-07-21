import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, useProfile } from '../hooks/useAuth.ts';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const { data: profileData, isLoading, refetch } = useProfile();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (profileData) {
            setUser(profileData);
        } else {
            setUser(null);
        }
    }, [profileData]);

    const login = (newToken: string, loggedInUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(loggedInUser);
        refetch();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

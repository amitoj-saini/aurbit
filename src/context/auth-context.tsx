import { appStateApi, UserDetails, usersApi } from '@/lib/api';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

type AuthContextValue = {
    user: UserDetails | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    clearUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        setIsLoading(true);

        const appState = await appStateApi.getAppState();
        if (appState.err || !appState.data?.loggedin) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        const response = await usersApi.userDetails();
        setUser(response.err || !response.data ? null : response.data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Load the session-backed user once the provider mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void refreshUser();
    }, [refreshUser]);

    const clearUser = useCallback(() => {
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser, clearUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }

    return context;
}

export function useRequiredAuth() {
    const auth = useAuth();
    if (!auth.user) {
        throw new Error('useRequiredAuth must be used after authentication has completed');
    }

    return { ...auth, user: auth.user };
}

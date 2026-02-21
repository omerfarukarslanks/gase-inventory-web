import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi } from '../api/auth';
import type { User } from '../types/domain';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [savedToken, savedUser] = await AsyncStorage.multiGet(['token', 'user']);
      const tokenValue = savedToken[1];
      const userJson = savedUser[1];

      if (tokenValue) setToken(tokenValue);
      if (userJson) setUser(JSON.parse(userJson) as User);
      setLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => {
        const res = await loginApi(email, password);
        await AsyncStorage.multiSet([
          ['token', res.accessToken],
          ['user', JSON.stringify(res.user)],
        ]);
        setUser(res.user);
        setToken(res.accessToken);
      },
      logout: async () => {
        await AsyncStorage.multiRemove(['token', 'user']);
        setUser(null);
        setToken(null);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

import { Redirect } from 'expo-router';
import { LoginScreen } from '../src/screens/LoginScreen';
import { useAuth } from '../src/context/AuthContext';

export default function LoginPage() {
  const { token } = useAuth();
  if (token) return <Redirect href="/(tabs)" />;
  return <LoginScreen />;
}

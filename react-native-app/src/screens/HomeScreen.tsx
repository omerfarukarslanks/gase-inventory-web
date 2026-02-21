import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Hoş geldin, {user?.name}</Text>
        <Text style={styles.subtitle}>{user?.role}</Text>
        <Pressable style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#111827', borderRadius: 12, padding: 16, gap: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94a3b8', fontSize: 14 },
  button: { marginTop: 8, backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});

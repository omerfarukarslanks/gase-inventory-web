import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert('Giriş hatası', error instanceof Error ? error.message : 'Bilinmeyen hata');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Gase Inventory Mobile</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="E-posta" style={styles.input} autoCapitalize="none" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Şifre" secureTextEntry style={styles.input} />
        <Pressable onPress={onSubmit} style={styles.button} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 80, backgroundColor: '#111827', borderRadius: 12, padding: 16, gap: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#1f2937', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

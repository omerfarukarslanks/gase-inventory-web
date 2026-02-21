import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function TabsLayout() {
  const { token } = useAuth();
  if (!token) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#111827' }, tabBarActiveTintColor: '#fff' }}>
      <Tabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="products" options={{ title: 'Ürünler' }} />
      <Tabs.Screen name="stock" options={{ title: 'Stok' }} />
    </Tabs>
  );
}

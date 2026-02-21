import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getProducts } from '../api/products';
import { ScreenContainer } from '../components/ScreenContainer';
import type { Product } from '../types/domain';

export function ProductsScreen() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ page: 1, limit: 30 })
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Ürünler</Text>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.sku}</Text>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { backgroundColor: '#111827', borderRadius: 8, padding: 12, marginBottom: 8 },
  name: { color: '#fff', fontWeight: '600' },
  meta: { color: '#94a3b8', marginTop: 2 },
});

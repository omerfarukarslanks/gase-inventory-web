import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getStockSummary } from '../api/inventory';
import { ScreenContainer } from '../components/ScreenContainer';
import type { StockSummaryItem } from '../types/domain';

export function StockScreen() {
  const [items, setItems] = useState<StockSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockSummary({ page: 1, limit: 30 })
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Stok Özeti</Text>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.productName}</Text>
              <Text style={styles.qty}>Adet: {item.totalQuantity}</Text>
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
  qty: { color: '#94a3b8', marginTop: 2 },
});

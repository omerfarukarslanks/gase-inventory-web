import { SafeAreaView, StyleSheet, View, type ViewProps } from 'react-native';

export function ScreenContainer(props: ViewProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} {...props} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1220' },
  container: { flex: 1, padding: 16 },
});

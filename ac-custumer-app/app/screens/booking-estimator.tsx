import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { PrimaryButton } from '../../components/CustomUI';
import * as Icons from 'lucide-react-native';

export default function BookingEstimatorScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [selections, setSelections] = useState<string[]>([]);

  const estimateItems = [
    { id: '1', title: 'Compressor Repair / Replacement', price: 180 },
    { id: '2', title: 'R32 Refrigerant Full Gas Recharge', price: 80 },
    { id: '3', title: 'Copper Pipe Leakage Soldering', price: 30 },
    { id: '4', title: 'Main Controller PCB Repair', price: 110 }
  ];

  const handleToggle = (id: string) => {
    setSelections(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const calculatedTotal = estimateItems
    .filter(item => selections.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Service Cost Estimator</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Estimate repair pricing before requesting dispatch. Select the components you require:
        </Text>

        {estimateItems.map((item) => {
          const isSelected = selections.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleToggle(item.id)}
              style={[
                styles.itemCard,
                { backgroundColor: colors.card },
                isSelected ? { borderColor: colors.primary, borderWidth: 2 } : { borderColor: colors.border, borderWidth: 1 }
              ]}
            >
              <View style={styles.row}>
                <View style={styles.leftCol}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.priceText, { color: colors.primary }]}>${item.price}</Text>
                </View>
                <View 
                  style={[
                    styles.checkbox, 
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>ESTIMATED TOTAL AMOUNT</Text>
          <Text style={[styles.totalVal, { color: colors.primary }]}>${calculatedTotal.toFixed(2)}</Text>
        </View>

        <PrimaryButton 
          title="Proceed to Book Estimate" 
          onPress={() => router.push('/screens/categories')}
          disabled={selections.length === 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  itemCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  totalCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  totalVal: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  }
});

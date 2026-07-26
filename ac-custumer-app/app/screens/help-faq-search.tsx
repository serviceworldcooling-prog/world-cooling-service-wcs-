import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { SearchBar } from '../../components/CustomUI';
import { FAQS } from '../../constants/mocks';
import * as Icons from 'lucide-react-native';

export default function FAQSearchScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFAQS = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(query.toLowerCase()) || 
    faq.answer.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search FAQs</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filteredFAQS.map((faq, idx) => (
          <TouchableOpacity 
            key={idx}
            activeOpacity={0.8}
            onPress={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.question, { color: colors.text }]}>{faq.question}</Text>
              <Icons.ChevronDown size={18} color={colors.textSecondary} />
            </View>
            {expandedIndex === idx && (
              <Text style={[styles.answer, { color: colors.textSecondary }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  answer: {
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  }
});

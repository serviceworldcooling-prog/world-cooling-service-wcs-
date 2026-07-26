import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput as RNTextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import * as Icons from 'lucide-react-native';

export default function LiveChatScreen() {
  const { themeMode } = useAppStore();
  const colors = themeMode === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I assist you with your AC service booking today?', sender: 'agent' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Math.random().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    setTimeout(() => {
      const reply = { id: Math.random().toString(), text: 'Connecting you to a live AC diagnostic specialist...', sender: 'agent' };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Live Support Agent</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.bubble, 
                msg.sender === 'user' ? 
                  [styles.bubbleUser, { backgroundColor: colors.primary }] : 
                  [styles.bubbleAgent, { backgroundColor: colors.card, borderColor: colors.border }]
              ]}
            >
              <Text style={{ color: msg.sender === 'user' ? '#FFF' : colors.text }}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <RNTextInput
            placeholder="Type message here..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            style={[styles.input, { color: colors.text }]}
          />
          <TouchableOpacity onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
            <Icons.Send size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: '80%',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  bubbleAgent: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  }
});

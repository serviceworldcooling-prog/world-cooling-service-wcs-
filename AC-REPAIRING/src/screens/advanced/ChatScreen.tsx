import React, { useState, useRef, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, ROUNDED, SPACING, SHADOWS } from '../../constants/theme';

export const ChatScreen = ({ route, navigation }: any) => {
  const { technicianName } = route.params || { technicianName: 'Rahul Sharma' };

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello, I have accepted your AC Wet Servicing request.', sender: 'tech', time: '10:15 AM' },
    { id: '2', text: 'I am arranging the tools and loading the water jet machine.', sender: 'tech', time: '10:16 AM' },
    { id: '3', text: 'Sounds great. Let me know when you start travelling.', sender: 'user', time: '10:17 AM' },
    { id: '4', text: 'On my way now! I will arrive in 12-15 minutes.', sender: 'tech', time: '10:30 AM' },
  ]);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Math.random().toString(),
      text: inputText.trim(),
      sender: 'user',
      time,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Trigger mock tech reply after 1.5 seconds
    setTimeout(() => {
      const techMsg = {
        id: Math.random().toString(),
        text: getMockReply(userMsg.text),
        sender: 'tech',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, techMsg]);
    }, 1500);
  };

  const getMockReply = (userText: string) => {
    const text = userText.toLowerCase();
    if (text.includes('where') || text.includes('reach') || text.includes('time') || text.includes('eta')) {
      return 'I am just passing sector 62 round-about. Reaching your address in 3 minutes.';
    }
    if (text.includes('parking') || text.includes('park')) {
      return 'Got it. I will park my scooter near the main apartment security gate.';
    }
    if (text.includes('leak') || text.includes('water')) {
      return 'Yes, I brought the pressure gauge and drain cleaning tools. I will inspect the indoor unit thoroughly.';
    }
    return 'Okay, thank you for clarifying. I will inspect the split AC units accordingly.';
  };

  useEffect(() => {
    // Scroll list to bottom when messages list size changes
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.techInfo}>
            <Text style={styles.techName}>{technicianName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.callBtn}
          onPress={() => Alert.alert('Calling...', `Dialing +91 98765 43210`)}
        >
          <MaterialIcons name="phone" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={[styles.messageRow, isUser ? styles.rowUser : styles.rowTech]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleTech]}>
                  <Text style={[styles.messageText, isUser ? styles.textUser : styles.textTech]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.msgTime, isUser ? styles.timeUser : styles.timeTech]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type message here..."
            placeholderTextColor={COLORS.textLight}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendCircle} onPress={handleSend}>
            <MaterialIcons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messagesList: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    width: '100%',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowTech: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: ROUNDED.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.small,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  bubbleTech: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  textUser: {
    color: '#ffffff',
  },
  textTech: {
    color: COLORS.textPrimary,
  },
  msgTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeUser: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeTech: {
    color: COLORS.textLight,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.background,
    borderRadius: ROUNDED.full,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
    fontSize: 13,
  },
  sendCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useChatContext } from '../../../services/chatContext';
import { useNutritionContext } from '../../../services/nutritionContext';
import Markdown from 'react-native-markdown-display';
import { TimeBasedCheckin } from '../../../components/TimeBasedCheckin';
import { ChatSessionModal } from '../../../components/ChatSessionModal';
import { ChatSession } from '../../../types/chatTypes';
import { ChatSessionService } from '../../../services/chatSession';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';

export default function ChatScreen() {
  const { 
    messages, 
    currentChatSessionId, 
    loadChatSession, 
    isSessionModalVisible, 
    setIsSessionModalVisible 
  } = useChatContext();
  const { dailyNutritionLogs, dailyNutritionGoals } = useNutritionContext();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const prevMessagesLength = useRef(messages?.length || 0);

  useEffect(() => {
    loadChatSessions();
  }, []);

  useEffect(() => {
    console.log('Modal visibility changed:', isSessionModalVisible);
  }, [isSessionModalVisible]);

  const loadChatSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const sessions = await ChatSessionService.getChatSessions(session.user.id);
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const newSession = await ChatSessionService.createChatSession(session.user.id);
        await loadChatSession(newSession.id);
        await loadChatSessions(); // Refresh the sessions list
        setIsSessionModalVisible(false);
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    await loadChatSession(sessionId);
    setIsSessionModalVisible(false);
  };

  useEffect(() => {
    if (messages?.length !== prevMessagesLength.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    prevMessagesLength.current = messages?.length || 0;
  }, [messages]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.chat} 
        ref={scrollViewRef}
        onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        <TimeBasedCheckin />
        {messages && messages.map((msg, index) => (
          <View 
            key={index}
            style={[
              styles.messageContainer,
              msg.role === 'user' ? styles.userMessage : styles.aiMessage
            ]}
          >
            {msg.role === 'user' ? (
              <Text style={[styles.messageText, styles.userMessageText]}>
                {msg.content}
              </Text>
            ) : (
              <Markdown style={markdownStyles}>
                {msg.content}
              </Markdown>
            )}
          </View>
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>

      <ChatSessionModal
        isVisible={isSessionModalVisible}
        onClose={() => setIsSessionModalVisible(false)}
        sessions={chatSessions}
        onSelectSession={handleSelectSession}
        onCreateNewSession={handleCreateNewSession}
        currentSessionId={currentChatSessionId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  chat: {
    flex: 1,
  },
  messageContainer: {
    margin: 8,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
});

const markdownStyles = {
  body: {
    color: '#000',
  },
  code_block: {
    backgroundColor: '#f4f4f4',
    padding: 8,
    borderRadius: 4,
  },
}; 
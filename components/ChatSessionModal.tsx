import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { ChatSession } from '../types/chatTypes';

interface ChatSessionModalProps {
  isVisible: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  onCreateNewSession: () => void;
  currentSessionId: string | null;
}

export function ChatSessionModal({
  isVisible,
  onClose,
  sessions,
  onSelectSession,
  onCreateNewSession,
  currentSessionId
}: ChatSessionModalProps) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat Sessions</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.newSessionButton}
          onPress={onCreateNewSession}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.newSessionText}>New Chat Session</Text>
        </TouchableOpacity>

        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.sessionItem,
                currentSessionId === item.id && styles.activeSession
              ]}
              onPress={() => onSelectSession(item.id)}
            >
              <Ionicons 
                name="chatbubble-outline" 
                size={20} 
                color={currentSessionId === item.id ? "#007AFF" : "#666"} 
              />
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{item.title}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(item.last_message_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 16,
  },
  newSessionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeSession: {
    backgroundColor: '#E3F2FD',
  },
  sessionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 
import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface Note {
  id: string
  title: string
  content: string
  photo?: string
  createdAt: string
  updatedAt: string
  synced: boolean
}

interface NoteModalProps {
  visible: boolean
  note: Note | null
  onClose: () => void
}

export function NoteModal({ visible, note, onClose }: NoteModalProps) {
  if (!note) return null

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{note.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name='close' size={24} color='#1C1C1E' />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentContainer}>
            {note.photo && (
              <Image source={{ uri: note.photo }} style={styles.photo} />
            )}
            {note.content ? (
              <Text style={styles.content}>{note.content}</Text>
            ) : (
              <Text style={styles.emptyContent}>Sin contenido</Text>
            )}
          </ScrollView>

          <Text style={styles.date}>
            Última actualización: {formatDate(note.updatedAt)}
          </Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    color: '#1C1C1E',
    marginRight: 8
  },
  contentContainer: { marginBottom: 12 },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12
  },
  content: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22
  },
  emptyContent: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic'
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right'
  }
})

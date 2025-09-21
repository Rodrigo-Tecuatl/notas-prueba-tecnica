import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
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

interface NoteCardProps {
  note: Note
  onPress: () => void
  showNote?: () => void
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
}

export const NoteCard = React.memo(
  ({ note, onPress, showNote, onEdit, onDelete, onShare }: NoteCardProps) => {
    const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })

    return (
      <View>
        <TouchableOpacity style={styles.card} onPress={onPress}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {note.title}
            </Text>
            <View
              style={[
                styles.syncIndicator,
                { backgroundColor: note.synced ? '#34C759' : '#FF9500' }
              ]}
            />
          </View>
          {note.content ? (
            <Text style={styles.content} numberOfLines={2}>
              {note.content}
            </Text>
          ) : null}
          {note.photo ? (
            <Image source={{ uri: note.photo }} style={styles.photo} />
          ) : null}
          <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
              <MaterialCommunityIcons name='pencil' size={20} color='#007AFF' />
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
              <MaterialCommunityIcons
                name='share-variant'
                size={20}
                color='#34C759'
              />
              <Text style={styles.actionText}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
              <MaterialCommunityIcons name='delete' size={20} color='#FF3B30' />
              <Text style={styles.actionText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  title: { fontSize: 18, fontWeight: '600', flex: 1, color: '#1C1C1E' },
  syncIndicator: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  content: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  photo: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8 },
  date: { fontSize: 12, color: '#C7C7CC', textAlign: 'right' },
  actionsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 8,
    marginTop: 8
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1C1C1E'
  }
})

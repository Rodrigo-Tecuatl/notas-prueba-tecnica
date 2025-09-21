import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Share,
  TouchableOpacity
} from 'react-native'
import { useAuth } from '@src/context/auth/useAuth'
import { EmptyState } from '@/src/components/Empty-list'
import { NoteCard } from '@/src/components/Note-card'
import { useNotes } from '@/src/hook/useNotes'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NoteModal } from '@/src/components/Note-modal'

interface Note {
  id: string
  title: string
  content: string
  photo?: string
  createdAt: string
  updatedAt: string
  synced: boolean
}

export default function Home() {
  const { signOut } = useAuth()

  const { notes, loading, error, isOnline, loadNotes, deleteNote } = useNotes()
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [isModalVisible, setModalVisible] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    if (!isFocused) return

    loadNotes().catch(() => {})
  }, [isFocused])

  const shareNote = async (note: Note) => {
    try {
      await Share.share({
        title: note.title,
        message: `${note.title}\n\n${note.content}`
      })
    } catch (error) {
      console.error('Error sharing note:', error)
    }
  }

  const showNote = useCallback((note: Note) => {
    setSelectedNote(note)
    setModalVisible(true)
  }, [])

  const closeModal = () => {
    setModalVisible(false)
    setSelectedNote(null)
  }

  const handleDelete = (item: Note) => {
    Alert.alert('Eliminar nota', '¿Seguro que deseas eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(item.id)
        }
      }
    ])
  }

  const renderItem = useCallback(
    ({ item }: { item: Note }) => (
      <NoteCard
        note={item}
        onPress={() => showNote(item)}
        onEdit={() => navigation.push('form-note', { id: item.id, edit: true })}
        onDelete={() => handleDelete(item)}
        onShare={async () => await shareNote(item)}
      />
    ),
    [showNote]
  )

  const keyExtractor = useCallback((item: Note) => item.id, [])

  if (loading && notes.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} />
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {notes.length === 0 && !loading ? (
        <EmptyState message='No tienes notas aún.' />
      ) : (
        <FlatList
          data={notes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadNotes} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.push('form-note', { edit: false })}
      >
        <MaterialCommunityIcons name='plus' size={28} color='#fff' />
        <Text style={styles.textButton}>Nueva Nota</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSignOut} onPress={signOut}>
        <Text style={styles.textButton}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <NoteModal
        visible={isModalVisible}
        note={selectedNote}
        onClose={closeModal}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  errorContainer: {
    backgroundColor: '#FF3B30',
    padding: 12,
    margin: 16,
    borderRadius: 8
  },
  errorText: { color: '#fff', textAlign: 'center' },
  listContainer: { paddingBottom: 100 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 150,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    flexDirection: 'row'
  },
  textButton: { color: '#FFF' },
  buttonSignOut: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#FF3B30',
    width: 150,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    flexDirection: 'row'
  }
})

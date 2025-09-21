import { useState, useEffect, useCallback } from 'react'
import { NoteService } from '@/src/services/note-service'
import NetInfo from '@react-native-community/netinfo'
import { useAuth } from '@src/context/auth/useAuth'

interface Note {
  id: string
  title: string
  content: string
  photo?: string
  createdAt: string
  updatedAt: string
  synced: boolean
}

export interface NoteFormData {
  title: string
  content: string
  photo?: string
}

export const useNotes = () => {
  const { state } = useAuth()

  const userId = state.user.userId
  const token = state.user.token
  if (!userId) {
    throw new Error('User ID is required to use notes')
  }
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const allNotes = await NoteService.getAllNotes(userId, token)
      setNotes(allNotes)
      setError(null)
    } catch (err) {
      setError('Error al cargar las notas')
      console.error('Error loading notes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createNote = useCallback(async (noteData: NoteFormData) => {
    try {
      const newNote = await NoteService.createNote(userId, noteData, token)
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (err) {
      setError('Error al crear la nota')
      throw err
    }
  }, [])

  const updateNote = useCallback(
    async (id: string, noteData: Partial<NoteFormData>) => {
      try {
        const updatedNote = await NoteService.updateNote(
          userId,
          id,
          noteData,
          token
        )
        if (updatedNote) {
          setNotes(prev =>
            prev.map(note => (note.id === id ? updatedNote : note))
          )
          return updatedNote
        }
        return null
      } catch (err) {
        setError('Error al actualizar la nota')
        throw err
      }
    },
    []
  )

  const deleteNote = useCallback(async (id: string) => {
    try {
      const success = await NoteService.deleteNote(userId, id, token)
      if (success) {
        setNotes(prev => prev.filter(note => note.id !== id))
      }
      return success
    } catch (err) {
      setError('Error al eliminar la nota')
      throw err
    }
  }, [])

  const syncNotes = useCallback(async () => {
    if (!isOnline) return false

    try {
      const success = await NoteService.syncWithServer(userId, token)
      if (success) {
        await loadNotes()
      }
      return success
    } catch (err) {
      console.error('Error syncing notes:', err)
      return false
    }
  }, [isOnline, loadNotes])

  useEffect(() => {
    loadNotes().finally(() => {})
  }, [loadNotes])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false)

      if (state.isConnected) {
        syncNotes().catch(() => {})
      }
    })

    return unsubscribe
  }, [syncNotes])

  return {
    notes,
    loading,
    error,
    isOnline,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    syncNotes
  }
}

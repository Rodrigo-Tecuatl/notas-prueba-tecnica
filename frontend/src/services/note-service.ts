import AsyncStorage from '@react-native-async-storage/async-storage'
import { randomUUID } from 'expo-crypto'
import { baseUrl, useWithoutApi } from '@/conf/conf'

interface Note {
  id: string
  title: string
  content: string
  photo?: string
  createdAt: string
  updatedAt: string
  synced: boolean
  userId: string | number
}

export interface NoteFormData {
  title: string
  content: string
  photo?: string
}

const getNotesKey = (userId: string | number) => `@notes_${userId}`
const getSyncKey = (userId: string | number) => `@sync_queue_${userId}`

export class NoteService {
  static async getAllNotes(
    userId: string | number,
    token: string
  ): Promise<Note[]> {
    try {
      if (useWithoutApi) {
        const notesJson = await AsyncStorage.getItem(getNotesKey(userId))
        return notesJson ? JSON.parse(notesJson) : []
      } else {
        const res = await fetch(baseUrl('/api/notes'), {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()

        const notes: Note[] = data.map((n: any) => ({
          id: n.id ?? n._id ?? String(n._id),
          title: n.title,
          content: n.content ?? n.description ?? '',
          photo: n.photo ?? baseUrl(n.imageUrl) ?? null,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
          synced: true,
          userId: n.user ?? n.userId ?? n.user?._id
        }))

        await AsyncStorage.setItem(getNotesKey(userId), JSON.stringify(notes))
        return notes
      }
    } catch (error) {
      console.error('Error getting notes:', error)
      return []
    }
  }

  static async getNoteById(
    userId: string | number,
    id: string,
    token: string
  ): Promise<Note | null> {
    const notes = await this.getAllNotes(userId, token)
    return notes.find(note => note.id === id) ?? null
  }

  static async createNote(
    userId: string | number,
    noteData: NoteFormData,
    token: string
  ): Promise<Note> {
    const newNote: Note = {
      id: randomUUID(),
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
      userId
    }
    const notes = await this.getAllNotes(userId, token)
    notes.unshift(newNote)
    await AsyncStorage.setItem(getNotesKey(userId), JSON.stringify(notes))
    await this.addToSyncQueue(userId, 'create', newNote)
    return newNote
  }

  static async updateNote(
    userId: string | number,
    id: string,
    data: Partial<NoteFormData>,
    token: string
  ): Promise<Note | null> {
    const notes = await this.getAllNotes(userId, token)
    const index = notes.findIndex(n => n.id === id)
    if (index === -1) return null

    const updated: Note = {
      ...notes[index],
      ...data,
      updatedAt: new Date().toISOString(),
      synced: false
    }
    notes[index] = updated
    await AsyncStorage.setItem(getNotesKey(userId), JSON.stringify(notes))
    await this.addToSyncQueue(userId, 'update', updated)
    return updated
  }

  static async deleteNote(
    userId: string | number,
    id: string,
    token: string
  ): Promise<boolean> {
    const notes = await this.getAllNotes(userId, token)
    const filtered = notes.filter(n => n.id !== id)
    await AsyncStorage.setItem(getNotesKey(userId), JSON.stringify(filtered))
    await this.addToSyncQueue(userId, 'delete', { id })
    return true
  }

  private static async addToSyncQueue(
    userId: string | number,
    operation: string,
    data: any
  ) {
    const queueJson = await AsyncStorage.getItem(getSyncKey(userId))
    const queue = queueJson ? JSON.parse(queueJson) : []
    queue.push({
      id: randomUUID(),
      operation,
      data,
      timestamp: new Date().toISOString()
    })
    await AsyncStorage.setItem(getSyncKey(userId), JSON.stringify(queue))
  }

  static async syncWithServer(
    userId: string | number,
    token: string
  ): Promise<boolean> {
    const queueJson = await AsyncStorage.getItem(getSyncKey(userId))
    const queue = queueJson ? JSON.parse(queueJson) : []

    if (!queue.length) return true

    try {
      // Mandar petición fetch
      // const response = await fetch('base endpoint', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     userId,
      //     operations: queue
      //   })
      // })

      // if (!response.ok) {
      //   console.error(
      //     'Error al sincronizar con el servidor',
      //     await response.text()
      //   )
      //   return false
      // }

      const notes = await this.getAllNotes(userId, token)
      const synced = notes.map(n => ({ ...n, synced: true }))
      await AsyncStorage.setItem(getNotesKey(userId), JSON.stringify(synced))

      // Limpias la cola de sincronización
      await AsyncStorage.removeItem(getSyncKey(userId))

      return true
    } catch (error) {
      console.error('Error en la sincronización:', error)
      return false
    }
  }
}

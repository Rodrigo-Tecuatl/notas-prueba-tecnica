import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Linking
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useNotes } from '@/src/hook/useNotes'
import { NoteService } from '@/src/services/note-service'
import { useAuth } from '@src/context/auth/useAuth'

export default function FormNote() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noteId, setNoteId] = useState<string | null>(null)

  const cameraRef = useRef<any>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const { createNote, updateNote } = useNotes()
  const navigation = useNavigation()
  const route = useRoute()
  const { state } = useAuth()

  // Si es editar, cargar datos de la nota
  useEffect(() => {
    const params = route.params as { id?: string; edit?: boolean } | undefined
    if (params?.edit && params?.id) {
      setNoteId(params.id)
      NoteService.getNoteById(state.user.userId, params.id, state.user.token)
        .then(note => {
          if (note) {
            setTitle(note.title)
            setContent(note.content)
            setPhoto(note.photo ?? null)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  }, [route.params])

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio')
      return
    }
    setIsSubmitting(true)
    try {
      if (noteId) {
        await updateNote(noteId, {
          title: title.trim(),
          content: content.trim(),
          photo: photo ?? undefined
        })
        Alert.alert('Éxito', 'Nota actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      } else {
        await createNote({
          title: title.trim(),
          content: content.trim(),
          photo: photo ?? undefined
        })
        Alert.alert('Éxito', 'Nota creada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      }
    } catch (e) {
      console.error(e)
      Alert.alert('Error', 'No se pudo guardar la nota')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePermissionDenied = () => {
    Alert.alert(
      'Permiso de cámara denegado',
      'Habilítalo en los ajustes del dispositivo.',
      [
        {
          text: 'Abrir ajustes',
          onPress: async () => await Linking.openSettings()
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('No disponible', 'La cámara no funciona en web.')
      return
    }
    try {
      if (permission?.granted) {
        setShowCamera(true)
        return
      }
      const result = await requestPermission()
      if (result?.granted) {
        setShowCamera(true)
      } else if (permission && !permission.canAskAgain) {
        handlePermissionDenied()
      } else {
        Alert.alert('Permiso requerido', 'Debes conceder acceso a la cámara.', [
          { text: 'Intentar de nuevo', onPress: handleTakePhoto },
          { text: 'Cancelar', style: 'cancel' }
        ])
      }
    } catch (err) {
      console.error(err)
      Alert.alert('Error', 'Ocurrió un problema con los permisos.')
    }
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.7
        })
        setPhoto(photoData.uri)
        setShowCamera(false)
      } catch (e) {
        console.error(e)
        Alert.alert('Error', 'No se pudo tomar la foto')
      }
    }
  }

  const removePhoto = () => setPhoto(null)

  // Vista de cámara
  if (showCamera && Platform.OS !== 'web') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} facing='back'>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <MaterialCommunityIcons name='close' size={24} color='#FFF' />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.form}>
            <TextInput
              style={styles.titleInput}
              placeholder='Título *'
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              placeholderTextColor='#C7C7CC'
            />

            <TextInput
              style={styles.contentInput}
              placeholder='Descripción'
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical='top'
              placeholderTextColor='#C7C7CC'
            />

            {photo && (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={removePhoto}
                >
                  <MaterialCommunityIcons
                    name='delete'
                    size={20}
                    color='#FF3B30'
                  />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleTakePhoto}
            >
              <MaterialCommunityIcons name='camera' size={24} color='#007AFF' />
              <Text style={styles.photoButtonText}>
                {photo ? 'Cambiar foto' : 'Tomar foto'}
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!title.trim() || isSubmitting) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!title.trim() || isSubmitting}
              >
                <MaterialCommunityIcons
                  name='content-save'
                  size={20}
                  color={!title.trim() || isSubmitting ? '#C7C7CC' : '#FFF'}
                />
                <Text
                  style={[
                    styles.saveButtonText,
                    (!title.trim() || isSubmitting) &&
                      styles.saveButtonTextDisabled
                  ]}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingTop: 15 },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20
  },
  saveButtonDisabled: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C7C7CC'
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6
  },
  saveButtonTextDisabled: { color: '#C7C7CC' },
  form: { flex: 1, paddingHorizontal: 16 },
  titleInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12
  },
  contentInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 200,
    marginBottom: 12
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed'
  },
  photoButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16
  },
  photo: { width: '100%', height: 200, borderRadius: 12 },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 6,
    elevation: 5
  },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 100
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    padding: 16
  },
  captureButton: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 8,
    alignSelf: 'center'
  },
  captureButtonInner: {
    backgroundColor: '#007AFF',
    width: 64,
    height: 64,
    borderRadius: 32
  }
})

import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Button
} from 'react-native'
import { useState } from 'react'
import { useAuth } from '@src/context/auth/useAuth'

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({
    email: '',
    password: ''
  })
  const [messages, setMessages] = useState({ email: '', password: '' })
  const { signIn } = useAuth()

  const handleSubmit = async () => {
    const newFields = {
      email: fields.email.trim(),
      password: fields.password.trim()
    }

    if (!newFields.email) {
      setMessages({ ...messages, email: 'El campo email es requerido' })
      return
    }

    if (!newFields.password) {
      setMessages({ ...messages, password: 'El campo contraseña es requerido' })
      return
    }

    setLoading(true)

    const { status, msg } = await signIn(newFields)

    // En caso de error en la api, pasar el mensaje
    if (!status) {
      setMessages({ ...messages, email: msg })
    }

    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>Bienvenido a mi aplicación de notas</Text>

        <Text style={styles.subTitle}>
          A continuación{'\n'}introduzca la información solicitada:
        </Text>

        <Text style={styles.textLabel}>Correo Electrónico</Text>

        <View style={styles.containerInput}>
          <TextInput
            style={styles.input}
            value={fields.email}
            autoCapitalize='none'
            keyboardType='email-address'
            onChangeText={email => setFields({ ...fields, email })}
            placeholder='Introduzca su Correo Electrónico'
          />

          <Text style={styles.textLabel}>Contraseña</Text>

          <TextInput
            style={styles.input}
            value={fields.password}
            secureTextEntry
            autoCapitalize='none'
            onChangeText={password => setFields({ ...fields, password })}
            placeholder='Introduzca su Contraseña'
          />

          <Text style={styles.message}>{messages.email}</Text>
        </View>

        <Button
          title='Iniciar Sesión'
          onPress={handleSubmit}
          disabled={loading}
        />

        <View />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 31
  },
  nameEvent: {
    fontWeight: '700'
  },
  subTitle: {
    textAlign: 'center',
    marginBottom: 29
  },
  input: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#FFF'
  },
  textLabel: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10
  },
  containerInput: {
    gap: 5,
    marginBottom: 20
  },
  message: {
    color: '#ed143d',
    textAlign: 'center'
  }
})

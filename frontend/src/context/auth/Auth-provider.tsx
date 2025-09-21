import React, {
  createContext,
  useReducer,
  useEffect,
  PropsWithChildren
} from 'react'
import * as SecureStore from 'expo-secure-store'
import { baseUrl, useWithoutApi } from '@/conf/conf'

const authTypes = {
  SIGN_OUT: 'SIGN_OUT',
  SIGN_IN: 'SIGN_IN',
  STOP_LOADING: 'STOP_LOADING'
} as const

type AuthActionTypes = keyof typeof authTypes

// Definimos la interfaz para el estado del contexto de autenticación
interface AuthState {
  user: UserData
  isLoading: boolean
  isAuthenticated: boolean
}

interface UserData {
  userId: number | string
  name: string
  email: string
  token: string
}

// Definimos la interfaz para las acciones que puede recibir el reducer
interface AuthAction {
  type: AuthActionTypes
  payload?: any
}

interface ResponseSignIn {
  status: boolean
  msg: string
}

// Definimos la interfaz para el contexto
export interface AuthContextType {
  state: AuthState
  signIn: (fields: SignInFields) => Promise<ResponseSignIn>
  signOut: () => Promise<void>
}

// Definimos la interfaz para los campos de inicio de sesión
interface SignInFields {
  password: string
  email: string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Definimos la constante para la clave de almacenamiento
const KEY_USER_STORAGE = '__token__auth__'

export function AuthProvider({ children }: PropsWithChildren) {
  const initialState: AuthState = {
    user: {
      userId: '',
      name: '',
      email: '',
      token: ''
    },
    isLoading: true,
    isAuthenticated: false
  }

  const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    const { payload, type } = action

    switch (type) {
      case authTypes.SIGN_IN:
        return {
          ...state,
          isAuthenticated: true,
          isLoading: false,
          user: { ...payload }
        }
      case authTypes.SIGN_OUT:
        return { ...payload, isLoading: false }

      case authTypes.STOP_LOADING:
        return { ...state, isLoading: false }

      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(authReducer, initialState)

  const signOut = async () => {
    await SecureStore.deleteItemAsync(KEY_USER_STORAGE)

    dispatch({
      type: authTypes.SIGN_OUT,
      payload: initialState
    })
  }

  const signIn = async (fields: SignInFields): Promise<ResponseSignIn> => {
    if (useWithoutApi) {
      const data: UserData = {
        userId: 1,
        name: 'Rodrigo Tecuatl',
        email: fields.email,
        token: ''
      }

      await SecureStore.setItemAsync(
        KEY_USER_STORAGE,
        JSON.stringify({ ...fields })
      )

      dispatch({
        type: authTypes.SIGN_IN,
        payload: data
      })

      return { status: true, msg: 'Ingreso correctamente' }
    }

    try {
      const response = await fetch(baseUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fields)
      })

      if (!response.ok) {
        const res = await response.json()
        return {
          status: false,
          msg: res.message
        }
      }

      const res = await response.json()
      const data: UserData = {
        userId: res.user.id,
        name: res.user.name,
        email: res.user.email,
        token: res.token
      }

      await SecureStore.setItemAsync(
        KEY_USER_STORAGE,
        JSON.stringify({ ...fields })
      )

      dispatch({
        type: authTypes.SIGN_IN,
        payload: data
      })
    } catch (error) {
      return { status: false, msg: 'Error de red' }
    }

    return { status: true, msg: 'Ingreso correctamente' }
  }

  const loadUser = async (): Promise<SignInFields | null> => {
    // Aquí se va a cargar el usuario desde el storage
    const result = await SecureStore.getItemAsync(KEY_USER_STORAGE)
    return result ? JSON.parse(result) : null
  }

  useEffect(() => {
    // Efecto de carga inicial
    ;(async () => {
      try {
        const res = await loadUser()
        if (res) {
          await signIn(res)
        }
      } catch (e) {
        console.error('Error loading user:', e)
      }
    })().finally(() => {
      dispatch({ type: authTypes.STOP_LOADING })
    })
  }, [])

  return (
    <AuthContext.Provider value={{ state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

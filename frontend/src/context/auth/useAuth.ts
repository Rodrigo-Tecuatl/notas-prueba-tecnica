import { useContext } from 'react'
import {
  AuthContext,
  type AuthContextType
} from '@src/context/auth/Auth-provider'

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }

  return context
}

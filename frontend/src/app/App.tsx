import { NavigationContainer } from '@react-navigation/native'
import { Text, View } from 'react-native'
// import { enableScreens } from 'react-native-screens'
import { AuthProvider } from '@src/context/auth/Auth-provider'
import { useAuth } from '@src/context/auth/useAuth'
import { NavigationAuth } from '@src/app/auth/Navigation-auth'
import { NavigationProtected } from '@src/app/protected/Navigation-protected'

// enableScreens(false)

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Cargando...</Text>
    </View>
  )
}

function Screens() {
  const { state } = useAuth()

  if (state.isLoading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      {state.isAuthenticated ? <NavigationProtected /> : <NavigationAuth />}
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Screens />
    </AuthProvider>
  )
}

import { createStackNavigator } from '@react-navigation/stack'
import Home from '@src/app/protected/Home'
import FormNote from '@src/components/Form-note'
import { StatusOnline } from '@/src/components/Status-online'

const Stack = createStackNavigator()

export function NavigationProtected() {
  return (
    <Stack.Navigator
      initialRouteName='home'
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name='home'
        component={Home}
        options={{
          headerShown: true,
          headerTitle: 'Mis Notas',
          headerRight: () => <StatusOnline />
        }}
      />

      <Stack.Screen
        name='form-note'
        component={FormNote}
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params?.edit ? 'Editar Nota' : 'Crear Nota'
        })}
      />
    </Stack.Navigator>
  )
}

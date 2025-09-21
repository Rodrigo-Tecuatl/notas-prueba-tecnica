import { createStackNavigator } from '@react-navigation/stack'
import SignUp from '@src/app/auth/Sign-up'
import SignIn from '@src/app/auth/Sign-in'

const Stack = createStackNavigator()

export function NavigationAuth() {
  return (
    <Stack.Navigator initialRouteName='sign-in'>
      <Stack.Screen
        name='sign-in'
        component={SignIn}
        options={{
          title: 'Iniciar Sesión',
          headerTitleAlign: 'center'
        }}
      />

      <Stack.Screen
        name='sign-up'
        component={SignUp}
        options={{
          title: 'Registro'
        }}
      />
    </Stack.Navigator>
  )
}

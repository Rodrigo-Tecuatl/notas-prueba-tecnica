import { View, Text, StyleSheet, Button } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name='note-text-outline'
        size={64}
        color='#C7C7CC'
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  message: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16
  }
})

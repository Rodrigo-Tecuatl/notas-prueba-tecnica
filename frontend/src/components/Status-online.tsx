import { StyleSheet, Text, View } from 'react-native'
import { useNotes } from '@/src/hook/useNotes'

export function StatusOnline() {
  const { isOnline } = useNotes()

  return (
    <View style={styles.statusContainer}>
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: isOnline ? '#34C759' : '#FF3B30' }
        ]}
      />
      <Text style={styles.statusText}>
        {isOnline ? 'En línea' : 'Sin conexión'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' }
})

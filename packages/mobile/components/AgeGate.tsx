import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../theme/useTheme'
import { isOldEnough } from '../lib/age-verification'
import { setAgeVerified } from '../lib/storage'

interface AgeGateProps {
  onVerified: () => void
}

export function AgeGate({ onVerified }: Readonly<AgeGateProps>) {
  const theme = useTheme()
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isComplete = month.length > 0 && day.length > 0 && year.length === 4

  async function handleVerify() {
    setError(null)
    const m = parseInt(month, 10)
    const d = parseInt(day, 10)
    const y = parseInt(year, 10)

    if (isNaN(m) || isNaN(d) || isNaN(y) || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
      setError('Please enter a valid date of birth.')
      return
    }

    const birthDate = new Date(y, m - 1, d)

    if (isOldEnough(birthDate)) {
      await setAgeVerified()
      onVerified()
    } else {
      setError('You must be 21 or older to use this app.')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.primary }]}>
            Age Verification
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            BarBack is an alcohol identification app. You must be at least 21
            years old to continue.
          </Text>

          <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
            Date of Birth
          </Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>MM</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.outline, backgroundColor: theme.surfaceContainerHigh }]}
                value={month}
                onChangeText={(t) => setMonth(t.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="01"
                placeholderTextColor={theme.outlineVariant}
                accessible
                accessibilityLabel="Birth month"
              />
            </View>
            <Text style={[styles.separator, { color: theme.outline }]}>/</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>DD</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.outline, backgroundColor: theme.surfaceContainerHigh }]}
                value={day}
                onChangeText={(t) => setDay(t.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="15"
                placeholderTextColor={theme.outlineVariant}
                accessible
                accessibilityLabel="Birth day"
              />
            </View>
            <Text style={[styles.separator, { color: theme.outline }]}>/ </Text>
            <View style={[styles.inputGroup, styles.yearGroup]}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>YYYY</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.outline, backgroundColor: theme.surfaceContainerHigh }]}
                value={year}
                onChangeText={(t) => setYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="1990"
                placeholderTextColor={theme.outlineVariant}
                accessible
                accessibilityLabel="Birth year"
              />
            </View>
          </View>

          {error ? (
            <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
          ) : null}

          <Pressable
            onPress={handleVerify}
            disabled={!isComplete}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: pressed ? theme.primaryContainer : theme.primary,
                opacity: isComplete ? 1 : 0.4,
              },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Verify age"
          >
            <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
              Verify Age
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontFamily: 'Newsreader',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  label: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    alignSelf: 'stretch',
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    alignSelf: 'stretch',
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  yearGroup: {
    flex: 1.5,
  },
  inputLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 48,
  },
  separator: {
    fontFamily: 'Manrope',
    fontSize: 20,
    paddingBottom: 14,
  },
  error: {
    fontFamily: 'Manrope',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    minHeight: 48,
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})

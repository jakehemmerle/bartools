import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../theme/useTheme'
import { AppHeader } from '../../components/AppHeader'
import { SettingsRow } from '../../components/SettingsRow'
import { GradientButton } from '../../components/GradientButton'

export default function SettingsScreen() {
  const theme = useTheme()
  const [vlmAccuracy, setVlmAccuracy] = useState(true)

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      <AppHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.text }]}>House Rules</Text>
          <Text style={[styles.subtitle, { color: theme.outline }]}>
            Manage your setup and preferences.
          </Text>
        </View>

        {/* ACCOUNT */}
        <SettingsRow type="header" label="Account" />
        <View style={styles.sectionRows}>
          <SettingsRow
            type="nav"
            label="Mixologist Profile"
            description="Manage your personal identity"
            iconName="account-outline"
            background={theme.surfaceContainerLow}
          />
          <SettingsRow
            type="nav"
            label="Security & Privacy"
            description="Two-factor and data permissions"
            iconName="shield-lock-outline"
            background={theme.surfaceContainerLow}
          />
        </View>

        {/* APP PREFERENCES */}
        <SettingsRow type="header" label="App Preferences" />
        <View style={styles.sectionRows}>
          <SettingsRow
            type="toggle"
            label="VLM Accuracy"
            description="Deep-learning recognition sensitivity"
            value={vlmAccuracy}
            onToggle={setVlmAccuracy}
            iconName="brain"
            background={theme.surfaceContainer}
          />
          <SettingsRow
            type="nav"
            label="Storage & Cache"
            description="Used: 245MB / 1.2GB"
            detail="Clear"
            iconName="database-outline"
            background={theme.surfaceContainer}
          />
          <SettingsRow
            type="nav"
            label="Interface Theme"
            description="Set to Midnight Lounge"
            iconName="palette-outline"
            background={theme.surfaceContainer}
          />
        </View>

        {/* LEGAL */}
        <SettingsRow type="header" label="Legal" />
        <View style={styles.legalSection}>
          <Pressable style={[styles.legalLink, { borderBottomColor: `${theme.outlineVariant}1A` }]}>
            <Text style={[styles.legalText, { color: theme.onSurfaceVariant }]}>Terms of Service</Text>
          </Pressable>
          <Pressable style={[styles.legalLink, { borderBottomColor: `${theme.outlineVariant}1A` }]}>
            <Text style={[styles.legalText, { color: theme.onSurfaceVariant }]}>Pouring Policy</Text>
          </Pressable>
          <Pressable style={[styles.legalLink, { borderBottomColor: `${theme.outlineVariant}1A` }]}>
            <Text style={[styles.legalText, { color: theme.onSurfaceVariant }]}>Open Source Licenses</Text>
          </Pressable>
        </View>

        {/* Feedback card */}
        <View style={[styles.feedbackCard, { backgroundColor: theme.surfaceContainerHighest, borderColor: `${theme.outlineVariant}33` }]}>
          <MaterialCommunityIcons name="star-four-points" size={36} color={theme.tertiary} />
          <Text style={[styles.feedbackTitle, { color: theme.text }]}>
            Notice a glitch in the recipe?
          </Text>
          <Text style={[styles.feedbackText, { color: theme.outline }]}>
            Help us refine our vision models by reporting inaccurate bottle recognition or
            broken measurements.
          </Text>
          <GradientButton label="Report a Bad Batch" />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Proudly part of the bartools.wtf ecosystem
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  titleSection: {
    paddingTop: 20,
    paddingBottom: 8,
    gap: 8,
  },
  title: {
    fontFamily: 'Newsreader',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    lineHeight: 20,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.4,
  },
  sectionRows: {
    gap: 16,
  },
  legalSection: {
    gap: 8,
  },
  legalLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  legalText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  feedbackCard: {
    marginHorizontal: 0,
    marginTop: 24,
    padding: 32,
    borderRadius: 0,
    borderWidth: 1,
    gap: 8,
    alignItems: 'center' as const,
  },
  feedbackTitle: {
    fontFamily: 'Newsreader',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center' as const,
    marginTop: 8,
  },
  feedbackText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center' as const,
    maxWidth: 320,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center' as const,
    paddingTop: 32,
    paddingBottom: 16,
    gap: 4,
  },
  footerText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 16,
  },
})

import { useRef, useCallback } from 'react'
import { View, Text, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native'
import { useTheme } from '../theme/useTheme'

interface FillLevelSliderProps {
  value: number // 0-100
  onValueChange: (value: number) => void
  orientation?: 'horizontal' | 'vertical'
  showLabels?: boolean // Empty / Half / Full labels
  label?: string // e.g. "Current Fill Level" or "Fill Level"
}

export function FillLevelSlider({
  value,
  onValueChange,
  orientation = 'horizontal',
  showLabels = true,
  label,
}: Readonly<FillLevelSliderProps>) {
  const theme = useTheme()
  const trackRef = useRef<View>(null)

  const clampedValue = Math.max(0, Math.min(100, value))

  // Store layout measurements in a ref so PanResponder always has current values
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  const handleLayout = useCallback((_e: LayoutChangeEvent) => {
    // Measure absolute position on screen
    trackRef.current?.measure((_x, _y, w, h, pageX, pageY) => {
      layoutRef.current = { x: pageX, y: pageY, width: w, height: h }
    })
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Re-measure on touch start to get accurate position
        trackRef.current?.measure((_x, _y, w, h, pageX, pageY) => {
          layoutRef.current = { x: pageX, y: pageY, width: w, height: h }
          const { width, height, x, y } = layoutRef.current
          if (width === 0 && height === 0) return
          const touchX = evt.nativeEvent.pageX
          const touchY = evt.nativeEvent.pageY
          const frac = width > height
            ? (touchX - x) / width
            : 1 - (touchY - y) / height
          onValueChangeRef.current(Math.round(Math.max(0, Math.min(100, frac * 100))))
        })
      },
      onPanResponderMove: (evt) => {
        const { width, height, x, y } = layoutRef.current
        if (width === 0 && height === 0) return
        const touchX = evt.nativeEvent.pageX
        const touchY = evt.nativeEvent.pageY
        const frac = width > height
          ? (touchX - x) / width
          : 1 - (touchY - y) / height
        onValueChangeRef.current(Math.round(Math.max(0, Math.min(100, frac * 100))))
      },
    })
  ).current

  if (orientation === 'vertical') {
    return (
      <View style={[styles.verticalContainer, { backgroundColor: theme.surfaceContainerLow, borderColor: `${theme.outlineVariant}33` }]}>
        {label ? (
          <Text style={[styles.verticalLabel, { color: theme.outlineVariant }]}>{label}</Text>
        ) : null}
        <View
          ref={trackRef}
          style={[styles.verticalTrack, { backgroundColor: '#000000' }]}
          onLayout={handleLayout}
          {...panResponder.panHandlers}
        >
          <View style={[styles.verticalFill, { height: `${clampedValue}%`, backgroundColor: theme.primary }]} />
          <View style={[styles.thumb, styles.verticalThumb, { backgroundColor: theme.primary, bottom: `${clampedValue}%` }]} />
        </View>
        <Text style={[styles.percentLabel, { color: theme.primary }]}>{clampedValue}%</Text>
      </View>
    )
  }

  // Horizontal
  return (
    <View style={[styles.horizontalContainer, { backgroundColor: theme.surfaceContainer, borderColor: theme.primary }]}>
      {label ? (
        <Text style={[styles.horizontalLabel, { color: theme.onSurfaceVariant }]}>{label}</Text>
      ) : null}
      <View style={styles.horizontalBody}>
        <View style={styles.sliderSection}>
          <View
            ref={trackRef}
            style={[styles.horizontalTrack, { backgroundColor: '#000000' }]}
            onLayout={handleLayout}
            {...panResponder.panHandlers}
          >
            <View style={[styles.horizontalFill, { width: `${clampedValue}%`, backgroundColor: theme.primary }]} />
            <View style={[styles.thumb, { backgroundColor: theme.primary, borderColor: theme.tertiary, left: `${clampedValue}%` }]} />
          </View>
          {showLabels ? (
            <View style={styles.labelsRow}>
              <Text style={[styles.rangeLabel, { color: theme.outline }]}>Empty</Text>
              <Text style={[styles.rangeLabel, { color: theme.outline }]}>Half</Text>
              <Text style={[styles.rangeLabel, { color: theme.outline }]}>Full</Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.percentBox, { backgroundColor: '#000000', borderColor: theme.primary }]}>
          <Text style={[styles.percentValue, { color: theme.onSurfaceVariant }]}>{clampedValue}</Text>
          <Text style={[styles.percentSign, { color: theme.onSurfaceVariant }]}>%</Text>
        </View>
      </View>
    </View>
  )
}

const TRACK_HEIGHT = 20
const THUMB_SIZE = 30

const styles = StyleSheet.create({
  // Horizontal
  horizontalContainer: {
    padding: 32,
    borderWidth: 1,
    borderRadius: 10,
  },
  horizontalLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 24,
  },
  horizontalBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
  },
  sliderSection: {
    flex: 1,
  },
  horizontalTrack: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'relative',
    overflow: 'visible',
  },
  horizontalFill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 1.5,
    position: 'absolute',
    top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
    marginLeft: -THUMB_SIZE / 2,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rangeLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 9,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  percentBox: {
    minWidth: 80,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  percentValue: {
    fontFamily: 'Newsreader',
    fontSize: 28,
    lineHeight: 32,
  },
  percentSign: {
    fontFamily: 'Newsreader',
    fontSize: 16,
    marginLeft: 3,
    marginTop: 4,
  },
  percentLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '700',
  },

  // Vertical
  verticalContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    gap: 16,
  },
  verticalLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    transform: [{ rotate: '180deg' }],
    writingDirection: 'ltr',
  },
  verticalTrack: {
    width: 3,
    height: 192,
    borderRadius: 1.5,
    position: 'relative',
    overflow: 'visible',
  },
  verticalFill: {
    width: '100%',
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  verticalThumb: {
    marginLeft: -THUMB_SIZE / 2 + 1.5,
    marginTop: 0,
    marginBottom: -THUMB_SIZE / 2,
    left: 0,
  },
})

import { useState, useRef, useCallback } from 'react'
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
  const [, setTrackLength] = useState(0)
  const trackRef = useRef<View>(null)

  const clampedValue = Math.max(0, Math.min(100, value))

  // Store layout measurements in a ref so PanResponder always has current values
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setTrackLength(orientation === 'horizontal' ? width : height)
    // Also measure absolute position on screen
    trackRef.current?.measure((_x, _y, w, h, pageX, pageY) => {
      layoutRef.current = { x: pageX, y: pageY, width: w, height: h }
    })
  }, [orientation])

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
          style={[styles.verticalTrack, { backgroundColor: theme.surfaceContainerHigh }]}
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
    <View style={[styles.horizontalContainer, { backgroundColor: theme.surfaceContainer, borderLeftColor: `${theme.tertiary}33` }]}>
      {label ? (
        <Text style={[styles.horizontalLabel, { color: theme.tertiary }]}>{label}</Text>
      ) : null}
      <View style={styles.horizontalBody}>
        <View style={styles.sliderSection}>
          <View
            ref={trackRef}
            style={[styles.horizontalTrack, { backgroundColor: theme.surfaceContainerHigh }]}
            onLayout={handleLayout}
            {...panResponder.panHandlers}
          >
            <View style={[styles.horizontalFill, { width: `${clampedValue}%`, backgroundColor: theme.primary }]} />
            <View style={[styles.thumb, { backgroundColor: theme.primary, left: `${clampedValue}%` }]} />
          </View>
          {showLabels ? (
            <View style={styles.labelsRow}>
              <Text style={[styles.rangeLabel, { color: theme.outline }]}>Empty</Text>
              <Text style={[styles.rangeLabel, { color: theme.outline }]}>Half</Text>
              <Text style={[styles.rangeLabel, { color: theme.outline }]}>Full</Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.percentBox, { borderBottomColor: theme.outline }]}>
          <Text style={[styles.percentValue, { color: theme.primary }]}>{clampedValue}</Text>
          <Text style={[styles.percentSign, { color: theme.outline }]}>%</Text>
        </View>
      </View>
    </View>
  )
}

const THUMB_SIZE = 16

const styles = StyleSheet.create({
  // Horizontal
  horizontalContainer: {
    padding: 32,
    borderLeftWidth: 2,
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
    height: 4,
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
    // Expand touch target without changing visual size
    paddingVertical: 20,
    marginVertical: -20,
  },
  horizontalFill: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    position: 'absolute',
    marginLeft: -THUMB_SIZE / 2,
    marginTop: -THUMB_SIZE / 2 + 2,
    // Square corners per Stitch design (no borderRadius)
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
    width: 80,
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  percentValue: {
    fontFamily: 'Newsreader',
    fontSize: 30,
  },
  percentSign: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    marginLeft: 2,
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
    width: 8,
    height: 192,
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  verticalFill: {
    width: '100%',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  verticalThumb: {
    marginLeft: -4,
    marginTop: 0,
    marginBottom: -THUMB_SIZE / 2,
    left: 0,
  },
})

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native'
import { useTheme } from '../theme/useTheme'

// Geometry — kept constant so the layout math is trivial.
const BOTTLE_W = 40
const BOTTLE_H = 96
const GLASS_W = 28
const GLASS_H = 40
const GLASS_GAP = 10
const STATIC_GLASS_COUNT = 3
const STREAM_WIDTH = 3
const POUR_FILL = 0.65
const TILT_DEG = 38 // pour angle

// Container has a baseline at the bottom; bottle + glasses share that baseline.
const BASE_PAD = 12
const CONTAINER_H = BOTTLE_H + BASE_PAD * 2

// Derived (once, so they're stable).
const TILT_RAD = (TILT_DEG * Math.PI) / 180
const MOUTH_DX = BOTTLE_H * Math.sin(TILT_RAD) // how far right the mouth travels
const MOUTH_TOP = CONTAINER_H - BASE_PAD - BOTTLE_H * Math.cos(TILT_RAD) // y of tilted mouth

// Hand-composed liquor bottle silhouette (resolution-independent Views).
function BottleSvg({
  body,
  label,
  cap,
  highlight,
}: {
  body: string
  label: string
  cap: string
  highlight: string
}) {
  const capH = 6
  const capW = BOTTLE_W * 0.46
  const neckH = 18
  const neckW = BOTTLE_W * 0.44
  const shoulderH = 10
  const bodyH = BOTTLE_H - capH - neckH - shoulderH

  return (
    <View style={{ width: BOTTLE_W, height: BOTTLE_H, alignItems: 'center' }}>
      {/* Cap */}
      <View
        style={{
          width: capW,
          height: capH,
          backgroundColor: cap,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      />
      {/* Neck */}
      <View style={{ width: neckW, height: neckH, backgroundColor: body }} />
      {/* Shoulder */}
      <View
        style={{
          width: BOTTLE_W,
          height: shoulderH,
          backgroundColor: body,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />
      {/* Body */}
      <View
        style={{
          width: BOTTLE_W,
          height: bodyH,
          backgroundColor: body,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Highlight strip — left edge, 2px wide — adds dimension */}
        <View
          style={{
            position: 'absolute',
            left: 4,
            top: 4,
            bottom: 4,
            width: 2,
            backgroundColor: highlight,
            borderRadius: 1,
            opacity: 0.5,
          }}
        />
        {/* Label */}
        <View
          style={{
            width: BOTTLE_W * 0.72,
            height: bodyH * 0.42,
            backgroundColor: label,
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  )
}

export function PourPacifier() {
  const theme = useTheme()
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get('window').width,
  )

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0 && w !== containerWidth) setContainerWidth(w)
  }

  // Bottle anchored in the left third.
  const bottleLeft = containerWidth / 6 - BOTTLE_W / 2
  const bottleCenterX = bottleLeft + BOTTLE_W / 2

  // Static glass row in the right third.
  const staticRowWidth =
    STATIC_GLASS_COUNT * GLASS_W + (STATIC_GLASS_COUNT - 1) * GLASS_GAP
  const staticRowLeft = (containerWidth * 5) / 6 - staticRowWidth / 2

  // The animated glass starts at the LEFT end of the row, slides left to sit
  // directly under the tilted mouth, then continues off-screen to the left.
  const startX = staticRowLeft
  const pourGlassLeft = bottleCenterX + MOUTH_DX - GLASS_W / 2
  const endX = -GLASS_W - 24

  // Stream falls from the tilted mouth down to the glass top.
  const glassTop = CONTAINER_H - BASE_PAD - GLASS_H
  const streamTop = MOUTH_TOP + 7
  const streamHeight = Math.max(0, glassTop - streamTop)
  const streamLeft = bottleCenterX + MOUTH_DX - STREAM_WIDTH / 2

  // --- Animated values --------------------------------------------------
  const translateX = useRef(new Animated.Value(startX)).current
  const fill = useRef(new Animated.Value(0)).current
  const streamOpacity = useRef(new Animated.Value(0)).current
  const tilt = useRef(new Animated.Value(0)).current

  useEffect(() => {
    translateX.setValue(startX)
    fill.setValue(0)
    streamOpacity.setValue(0)
    tilt.setValue(0)

    const loop = Animated.loop(
      Animated.sequence([
        // Reset
        Animated.parallel([
          Animated.timing(translateX, { toValue: startX, duration: 0, useNativeDriver: true }),
          Animated.timing(fill, { toValue: 0, duration: 0, useNativeDriver: false }),
          Animated.timing(streamOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(tilt, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        // 1. Glass glides from left of the row to under the tilted mouth.
        Animated.timing(translateX, {
          toValue: pourGlassLeft,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(120),
        // 2. Pour — bottle tilts → stream flows → glass fills → bottle rights
        Animated.parallel([
          Animated.sequence([
            Animated.timing(tilt, {
              toValue: TILT_DEG,
              duration: 420,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.delay(950),
            Animated.timing(tilt, {
              toValue: 0,
              duration: 420,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(380),
            Animated.timing(streamOpacity, {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.delay(880),
            Animated.timing(streamOpacity, {
              toValue: 0,
              duration: 120,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(440),
            Animated.timing(fill, {
              toValue: POUR_FILL,
              duration: 880,
              easing: Easing.out(Easing.quad),
              useNativeDriver: false,
            }),
          ]),
        ]),
        Animated.delay(280),
        // 3. Glass continues off the screen to the left.
        Animated.timing(translateX, {
          toValue: endX,
          duration: 1200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [
    containerWidth,
    translateX,
    fill,
    streamOpacity,
    tilt,
    startX,
    pourGlassLeft,
    endX,
  ])

  const fillHeight = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [0, GLASS_H - 4],
  })

  const tiltDeg = tilt.interpolate({
    inputRange: [0, TILT_DEG],
    outputRange: ['0deg', `${TILT_DEG}deg`],
  })

  const staticGlasses = useMemo(
    () =>
      Array.from({ length: STATIC_GLASS_COUNT }, (_, i) => ({
        key: `gs-${i}`,
        left: staticRowLeft + i * (GLASS_W + GLASS_GAP),
      })),
    [staticRowLeft],
  )

  const bottleBody = theme.primary
  const bottleLabel = theme.onSurfaceVariant
  const bottleCap = theme.surfaceContainerHighest
  const bottleHighlight = theme.onSurfaceVariant
  const glassBorder = theme.onSurfaceVariant
  const liquidColor = theme.primary

  // Pivot the bottle around its bottom-center (where a hand would grip low on
  // the neck/body to pour). Default RN rotate pivot = view center, so we
  // offset by half the bottle height on either side of the rotation.
  const bottleWrapperTop = CONTAINER_H - BASE_PAD - BOTTLE_H
  const pivotOffset = BOTTLE_H / 2

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Bottle */}
      <Animated.View
        style={[
          styles.bottleWrapper,
          {
            left: bottleLeft,
            top: bottleWrapperTop,
            transform: [
              { translateY: pivotOffset },
              { rotate: tiltDeg },
              { translateY: -pivotOffset },
            ],
          },
        ]}
      >
        <BottleSvg
          body={bottleBody}
          label={bottleLabel}
          cap={bottleCap}
          highlight={bottleHighlight}
        />
      </Animated.View>

      {/* Pour stream */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.stream,
          {
            left: streamLeft,
            top: streamTop,
            height: streamHeight,
            backgroundColor: liquidColor,
            opacity: streamOpacity,
          },
        ]}
      />

      {/* Static lowball glasses on the right third */}
      {staticGlasses.map(({ key, left }) => (
        <View
          key={key}
          style={[
            styles.glass,
            {
              left,
              top: glassTop,
              width: GLASS_W,
              height: GLASS_H,
              borderColor: glassBorder,
            },
          ]}
        />
      ))}

      {/* Animated glass */}
      <Animated.View
        style={[
          styles.glass,
          {
            left: 0,
            top: glassTop,
            width: GLASS_W,
            height: GLASS_H,
            borderColor: glassBorder,
            transform: [{ translateX }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.liquid,
            { height: fillHeight, backgroundColor: liquidColor },
          ]}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_H,
    width: '100%',
    overflow: 'hidden',
  },
  bottleWrapper: {
    position: 'absolute',
    width: BOTTLE_W,
    height: BOTTLE_H,
  },
  stream: {
    position: 'absolute',
    width: STREAM_WIDTH,
    borderRadius: STREAM_WIDTH / 2,
  },
  glass: {
    position: 'absolute',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  liquid: {
    width: '100%',
  },
})

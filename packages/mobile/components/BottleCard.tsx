import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/useTheme'
import { FillLevelBar } from './FillLevelBar'

interface BottleCardProps {
  brand: string
  product: string
  subcategory?: string
  sizeMl?: number
  fillPercent: number
}

export function BottleCard({ brand, product, subcategory, sizeMl, fillPercent }: Readonly<BottleCardProps>) {
  const theme = useTheme()
  const isUnopened = fillPercent >= 100
  const isLow = fillPercent <= 20

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceContainerHigh }]}>
      <View style={styles.row}>
        {/* Image placeholder */}
        <View style={[styles.thumbnail, { backgroundColor: theme.surfaceContainer }]} />

        {/* Text content */}
        <View style={styles.info}>
          <Text style={[styles.productName, { color: theme.onSurface }]} numberOfLines={1}>
            {brand} {product}
          </Text>
          <View style={styles.meta}>
            {subcategory ? (
              <View style={[styles.subcategoryBadge, { backgroundColor: theme.surfaceContainerLow }]}>
                <Text style={[styles.subcategoryText, { color: theme.onSurfaceVariant }]}>
                  {subcategory.toUpperCase()}
                </Text>
              </View>
            ) : null}
            {sizeMl ? (
              <Text style={[styles.sizeText, { color: theme.outline }]}>
                {sizeMl}ml
              </Text>
            ) : null}
          </View>
        </View>

        {/* Fill level */}
        <View style={styles.right}>
          {isUnopened ? (
            <View style={[styles.unopenedBadge, { backgroundColor: theme.tertiaryContainer }]}>
              <Text style={[styles.unopenedText, { color: theme.tertiary }]}>Unopened</Text>
            </View>
          ) : (
            <Text style={[styles.fill, { color: isLow ? theme.error : theme.tertiary }]}>
              {fillPercent}%{isLow ? ' Left' : ' Full'}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.fillBarWrapper}>
        <FillLevelBar fillPercent={fillPercent} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 4,
    gap: 0,
  },
  fillBarWrapper: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 2,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  productName: {
    fontFamily: 'Manrope',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  subcategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  subcategoryText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  sizeText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  fill: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unopenedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  unopenedText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
})

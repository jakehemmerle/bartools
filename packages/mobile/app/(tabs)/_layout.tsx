import { Platform } from 'react-native'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { BatchQueueProvider } from '../../lib/use-batch-queue'

export default function TabLayout() {
  return (
    <BatchQueueProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFB782',
        tabBarInactiveTintColor: '#A08D80',
        tabBarStyle: {
          backgroundColor: '#1C1B1B',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 110,
          paddingBottom: Platform.OS === 'ios' ? 28 : 48,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'SpaceGrotesk',
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="camera" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan-live"
        options={{
          title: 'Live',
          tabBarLabel: 'Live',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cube-scan" color={color} size={size} />
          ),
          // Hidden until the live-scan flow is ready; screen file kept for later.
          href: null,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="liquor" color={color} size={size} />
          ),
          // Hidden for now; screens + add-manually flow kept for later.
          href: null,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-box-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
          // Hidden until auth/settings surface is real; screen file kept for later.
          href: null,
        }}
      />
    </Tabs>
    </BatchQueueProvider>
  )
}

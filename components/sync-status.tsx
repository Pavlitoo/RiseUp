import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  
  const primaryColor = useThemeColor({}, 'primary');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsOnline(connected);
      
      if (connected) {
        setSyncStatus('syncing');
        // Simulate sync process
        setTimeout(() => {
          setSyncStatus('synced');
        }, 2000);
      } else {
        setSyncStatus('offline');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (syncStatus === 'offline') {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1);
      colorProgress.value = withTiming(1); // Red
    } else if (syncStatus === 'syncing') {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1);
      colorProgress.value = withTiming(0.5); // Orange
    } else {
      opacity.value = withTiming(0, { duration: 1000 });
      scale.value = withTiming(0.8);
      colorProgress.value = withTiming(0); // Green
    }
  }, [syncStatus]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 0.5, 1],
      [primaryColor, warningColor, errorColor]
    );

    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '🔄 Синхронізація...';
      case 'offline':
        return '📱 Офлайн режим';
      default:
        return '✅ Синхронізовано';
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedText style={[styles.statusText, { color: 'white' }]}>
        {getStatusText()}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
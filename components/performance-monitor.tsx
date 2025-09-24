import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';

interface PerformanceMetrics {
  memoryUsage: number;
  batteryLevel: number;
  deviceType: string;
  systemVersion: string;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showMetrics, setShowMetrics] = useState(__DEV__);
  
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  useEffect(() => {
    if (!showMetrics) return;

    const loadMetrics = async () => {
      try {
        const [
          memoryUsage,
          batteryLevel,
          deviceType,
          systemVersion
        ] = await Promise.all([
          DeviceInfo.getUsedMemory(),
          DeviceInfo.getBatteryLevel(),
          DeviceInfo.getDeviceType(),
          DeviceInfo.getSystemVersion()
        ]);

        setMetrics({
          memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
          batteryLevel: Math.round(batteryLevel * 100),
          deviceType,
          systemVersion
        });
      } catch (error) {
        console.error('Failed to load performance metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [showMetrics]);

  if (!showMetrics || !metrics) return null;

  const getMemoryColor = () => {
    if (metrics.memoryUsage > 500) return errorColor;
    if (metrics.memoryUsage > 300) return warningColor;
    return primaryColor;
  };

  const getBatteryColor = () => {
    if (metrics.batteryLevel < 20) return errorColor;
    if (metrics.batteryLevel < 50) return warningColor;
    return primaryColor;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground, borderColor }]}>
      <ThemedText style={styles.title}>📊 Performance Monitor</ThemedText>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metric}>
          <ThemedText style={[styles.metricValue, { color: getMemoryColor() }]}>
            {metrics.memoryUsage}MB
          </ThemedText>
          <ThemedText style={styles.metricLabel}>Memory</ThemedText>
        </View>
        
        <View style={styles.metric}>
          <ThemedText style={[styles.metricValue, { color: getBatteryColor() }]}>
            {metrics.batteryLevel}%
          </ThemedText>
          <ThemedText style={styles.metricLabel}>Battery</ThemedText>
        </View>
      </View>
      
      <View style={styles.deviceInfo}>
        <ThemedText style={styles.deviceText}>
          {metrics.deviceType} • iOS {metrics.systemVersion}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    opacity: 0.9,
    zIndex: 1000,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  deviceInfo: {
    alignItems: 'center',
  },
  deviceText: {
    fontSize: 10,
    opacity: 0.6,
  },
});
import { useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './use-local-storage';

interface SyncConfig {
  maxSyncInterval: number;
  minSyncInterval: number;
  batteryThreshold: number;
  reducedMotionSync: boolean;
}

interface BatteryAPI extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

export function useBatterySync() {
  const [syncConfig] = useLocalStorage<SyncConfig>('sync-config', {
    maxSyncInterval: 60000, // 1 minute
    minSyncInterval: 10000, // 10 seconds
    batteryThreshold: 0.2,  // 20%
    reducedMotionSync: false
  });

  const batteryInfoRef = useRef<{
    level: number;
    charging: boolean;
    isLowBattery: boolean;
  }>({
    level: 1,
    charging: true,
    isLowBattery: false
  });

  // Detect battery status
  const updateBatteryInfo = useCallback(async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery() as BatteryAPI;
        batteryInfoRef.current = {
          level: battery.level,
          charging: battery.charging,
          isLowBattery: battery.level < syncConfig.batteryThreshold
        };
      }
    } catch (error) {
      // Fallback for unsupported browsers
      batteryInfoRef.current = {
        level: 1,
        charging: true,
        isLowBattery: false
      };
    }
  }, [syncConfig.batteryThreshold]);

  // Adaptive sync interval based on battery and user activity
  const getOptimalSyncInterval = useCallback(() => {
    const { isLowBattery, charging } = batteryInfoRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDocumentHidden = document.hidden;
    
    // Base interval
    let interval = syncConfig.minSyncInterval;
    
    // Increase interval for battery saving
    if (isLowBattery && !charging) {
      interval *= 3; // Triple the interval for low battery
    }
    
    if (prefersReducedMotion || syncConfig.reducedMotionSync) {
      interval *= 2; // Double for reduced motion preference
    }
    
    if (isDocumentHidden) {
      interval *= 4; // Quadruple for background tabs
    }
    
    return Math.min(interval, syncConfig.maxSyncInterval);
  }, [syncConfig]);

  // Efficient data persistence with debouncing
  const createBatteryEfficientSave = useCallback((saveFunction: () => void) => {
    let timeoutId: NodeJS.Timeout;
    let isScheduled = false;
    
    return () => {
      if (isScheduled) return;
      
      const interval = getOptimalSyncInterval();
      isScheduled = true;
      
      timeoutId = setTimeout(() => {
        if (!document.hidden) {
          saveFunction();
        }
        isScheduled = false;
      }, interval);
    };
  }, [getOptimalSyncInterval]);

  // Page visibility API for background sync management
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Reduce activity when tab is hidden
      // Cancel any pending animations or heavy operations
    } else {
      // Resume normal activity when tab becomes visible
      updateBatteryInfo();
    }
  }, [updateBatteryInfo]);

  // Initialize battery monitoring
  useEffect(() => {
    updateBatteryInfo();
    
    // Listen for battery events
    const setupBatteryListeners = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery() as BatteryAPI;
          
          const updateHandler = () => updateBatteryInfo();
          battery.addEventListener('chargingchange', updateHandler);
          battery.addEventListener('levelchange', updateHandler);
          
          return () => {
            battery.removeEventListener('chargingchange', updateHandler);
            battery.removeEventListener('levelchange', updateHandler);
          };
        }
      } catch (error) {
        console.warn('Battery API not supported');
      }
    };
    
    setupBatteryListeners();
    
    // Page visibility listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateBatteryInfo, handleVisibilityChange]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      batteryLevel: batteryInfoRef.current.level,
      isCharging: batteryInfoRef.current.charging
    };
  }, []);

  return {
    batteryInfo: batteryInfoRef.current,
    createBatteryEfficientSave,
    getOptimalSyncInterval,
    getPerformanceMetrics,
    syncConfig
  };
}
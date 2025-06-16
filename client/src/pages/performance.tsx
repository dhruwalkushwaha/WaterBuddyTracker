import { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Battery, Cpu, HardDrive, Gauge, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerformance, FEATURE_WEIGHTS } from '@/hooks/use-performance';
import { useBatterySync } from '@/hooks/use-battery-sync';
import { useLocation } from 'wouter';

export default function Performance() {
  const [, setLocation] = useLocation();
  const { metrics, refreshMetrics } = usePerformance();
  const { batteryInfo, getPerformanceMetrics, syncConfig } = useBatterySync();
  const [performanceScore, setPerformanceScore] = useState(0);

  // Calculate overall performance score
  useEffect(() => {
    if (metrics) {
      let score = 100;
      
      // Deduct points based on various factors
      if (metrics.renderTime > 16) score -= 10; // 60fps target
      if (metrics.memoryUsage.usedJSHeapSize > 50 * 1024 * 1024) score -= 15; // 50MB threshold
      
      const storageSize = parseFloat(metrics.storageUsage.localStorage);
      if (storageSize > 100) score -= 10; // 100KB threshold
      
      setPerformanceScore(Math.max(score, 0));
    }
  }, [metrics]);

  const getBatteryStatus = () => {
    if (batteryInfo.isLowBattery && !batteryInfo.charging) {
      return { label: 'Low Battery', color: 'text-red-500', icon: '🔴' };
    }
    if (batteryInfo.charging) {
      return { label: 'Charging', color: 'text-green-500', icon: '🔋' };
    }
    return { label: 'Normal', color: 'text-blue-500', icon: '⚡' };
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-50' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { grade: 'D', color: 'text-red-500', bg: 'bg-red-50' };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const status = getBatteryStatus();
  const grade = getPerformanceGrade(performanceScore);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Gauge className="text-xl" style={{ color: 'var(--water-color)' }} />
            <h1 className="text-xl font-bold">Performance</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Overall Score */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <CardContent className="p-6 text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold mb-4 ${grade.bg} ${grade.color}`}>
              {grade.grade}
            </div>
            <div className="text-3xl font-bold mb-2">{performanceScore}</div>
            <div className="text-sm text-gray-500">Performance Score</div>
            <Progress value={performanceScore} className="mt-4" />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <Battery className="h-6 w-6 mx-auto mb-2" style={{ color: status.color.replace('text-', '') }} />
              <div className="text-lg font-bold">{Math.round(batteryInfo.level * 100)}%</div>
              <div className="text-xs text-gray-500">{status.label}</div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">{metrics?.renderTime.toFixed(1) || 0}ms</div>
              <div className="text-xs text-gray-500">Render Time</div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <Cpu className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-lg font-bold">
                {metrics ? formatBytes(metrics.memoryUsage.usedJSHeapSize) : '0 MB'}
              </div>
              <div className="text-xs text-gray-500">Memory Used</div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <HardDrive className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold">{metrics?.storageUsage.localStorage || '0 KB'}</div>
              <div className="text-xs text-gray-500">Storage Used</div>
            </CardContent>
          </Card>
        </div>

        {/* Bundle Analysis */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="mr-2 h-5 w-5" />
              Bundle Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">JavaScript</span>
                <Badge variant="secondary">{metrics?.bundleSize.js || '104 KB'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">CSS</span>
                <Badge variant="secondary">{metrics?.bundleSize.css || '11 KB'}</Badge>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-sm">Total (gzipped)</span>
                <Badge>{metrics?.bundleSize.total || '115 KB'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Weight Analysis */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <CardHeader>
            <CardTitle>Feature Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(FEATURE_WEIGHTS).map(([key, feature]) => (
                <div key={key} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant="outline">{feature.size}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{feature.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Battery: {feature.batteryImpact}</span>
                    <span className="text-blue-600">Performance: {feature.performance}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Battery Optimization */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <CardHeader>
            <CardTitle>Battery Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Reduced Motion</span>
                <Badge variant={metrics?.batteryOptimization.animationsReduced ? 'default' : 'secondary'}>
                  {metrics?.batteryOptimization.animationsReduced ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sync Strategy</span>
                <Badge variant="outline">{metrics?.batteryOptimization.syncFrequency || 'On demand'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Background Activity</span>
                <Badge variant="secondary">{metrics?.batteryOptimization.backgroundActivity || 'Minimal'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <CardHeader>
            <CardTitle>Optimization Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {performanceScore < 90 && (
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-500">⚠️</span>
                  <span>Enable reduced motion in device settings for better battery life</span>
                </div>
              )}
              {batteryInfo.isLowBattery && (
                <div className="flex items-start space-x-2">
                  <span className="text-red-500">🔋</span>
                  <span>Low battery detected - animations automatically reduced</span>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span>App uses hardware acceleration for smooth 60fps animations</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span>Data stored locally - no network dependency</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span>Optimized for Google Pixel 7 display and touch response</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <Button 
          onClick={refreshMetrics}
          className="w-full"
          variant="outline"
        >
          Refresh Metrics
        </Button>
      </main>
    </div>
  );
}
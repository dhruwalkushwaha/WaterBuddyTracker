import { useState } from 'react';
import { ArrowLeft, TrendingUp, Calendar, Droplets, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useSimpleAnalytics } from '@/hooks/use-simple-analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useLocation } from 'wouter';

interface SimpleData {
  waterIntake: number;
  dailyGoal: number;
  glassSize: number;
  goodbugTaken: boolean;
  lastDate: string;
  streak: number;
  achievements: string[];
  theme: "light" | "dark";
  history?: Array<{
    date: string;
    waterIntake: number;
    goodbugTaken: boolean;
    goalMet: boolean;
  }>;
}

const initialData: SimpleData = {
  waterIntake: 0,
  dailyGoal: 2.0,
  glassSize: 250,
  goodbugTaken: false,
  lastDate: new Date().toDateString(),
  streak: 0,
  achievements: [],
  theme: "light",
  history: [],
};

export default function AnalyticsSimple() {
  const [, setLocation] = useLocation();
  const [data, setData] = useLocalStorage<SimpleData>('goodsip-data', initialData);
  const analytics = useSimpleAnalytics(data);
  const { last7Days, weeklyData, overallStats } = analytics;
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
  };

  const resetAnalytics = () => {
    setData({
      ...initialData,
      dailyGoal: data.dailyGoal,
      glassSize: data.glassSize,
      theme: data.theme,
      lastDate: new Date().toDateString(),
    });
    setIsResetDialogOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-xl" style={{ color: 'var(--water-color)' }} />
              <h1 className="text-xl font-bold">Analytics</h1>
            </div>
          </div>
          
          {/* Reset Button */}
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="p-2 rounded-lg border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Reset Analytics
                </DialogTitle>
                <DialogDescription>
                  This will permanently delete all your tracking history, streaks, and achievements. 
                  Your current settings (glass size, daily goal) will be preserved.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="space-x-2">
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={resetAnalytics}>
                  Reset All Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Overall Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                {overallStats.totalDays}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Total Days
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: colors.success }}>
                {overallStats.goalMetPercentage}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Goals Met
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: colors.warning }}>
                {overallStats.averageDaily}L
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Daily Average
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: colors.purple }}>
                {overallStats.goodbugCompliance}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                GoodBug Rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Streak Card */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <CardContent className="p-4 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-3xl font-bold" style={{ color: colors.warning }}>
              {overallStats.currentStreak}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Current Streak
            </div>
          </CardContent>
        </Card>

        {/* Last 7 Days Chart */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5" />
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="shortDate" fontSize={12} />
                  <YAxis fontSize={12} domain={[0, Math.max(data.dailyGoal, 3)]} />
                  <Bar dataKey="waterIntake" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: colors.primary }}></div>
                Water Intake (L)
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Goal: {data.dailyGoal}L
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        {weeklyData.length > 0 && (
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="weekStart" 
                      fontSize={10}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis fontSize={12} />
                    <Line 
                      type="monotone" 
                      dataKey="averageDaily" 
                      stroke={colors.primary} 
                      strokeWidth={3}
                      dot={{ r: 4, fill: colors.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Weekly Stats */}
              <div className="space-y-3">
                {weeklyData.map((week, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold">
                        Week of {new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <Badge variant="secondary">
                        {week.totalDays} days
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-2" style={{ color: colors.primary }} />
                        {week.averageDaily}L avg
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🎯</span>
                        {week.goalMetDays}/{week.totalDays} goals
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🦠</span>
                        {week.goodbugDays}/{week.totalDays} doses
                      </div>
                      <div className="text-right font-medium">
                        {week.totalWater}L total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {overallStats.totalDays === 0 && (
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-semibold mb-2">No Data Yet</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Start tracking your water intake to see analytics
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
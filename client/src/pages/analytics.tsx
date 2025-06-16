import { useState } from 'react';
import { ArrowLeft, TrendingUp, Calendar, Droplets, Pill, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useHydration } from '@/hooks/use-hydration';
import { useAnalytics } from '@/hooks/use-analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useLocation } from 'wouter';

export default function Analytics() {
  const [, setLocation] = useLocation();
  const { data } = useHydration();
  const analytics = useAnalytics(data);
  const weeklyData = analytics.weeklyData || [];
  const monthlyData = analytics.monthlyData || [];
  const last7Days = analytics.last7Days || [];
  const overallStats = analytics.overallStats || {
    totalDays: 0,
    averageDaily: 0,
    goalMetPercentage: 0,
    probioticCompliance: 0,
    totalWaterConsumed: 0,
  };
  const [activeTab, setActiveTab] = useState('weekly');

  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
  };

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
            <TrendingUp className="text-xl" style={{ color: 'var(--water-color)' }} />
            <h1 className="text-xl font-bold">Analytics</h1>
          </div>
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
                {Math.round(overallStats.goalMetPercentage)}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Goals Met
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: colors.warning }}>
                {overallStats.averageDaily.toFixed(1)}L
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Daily Average
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: colors.purple }}>
                {Math.round(overallStats.probioticCompliance)}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Probiotic Rate
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Bar dataKey="water" fill={colors.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="goal" fill={colors.success} opacity={0.3} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: colors.primary }}></div>
                Water Intake
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: colors.success, opacity: 0.3 }}></div>
                Daily Goal
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Weekly/Monthly */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            {weeklyData && weeklyData.length > 0 ? (
              <>
                {/* Weekly Chart */}
                <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="weekStartDate" 
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
                  </CardContent>
                </Card>

                {/* Weekly Stats */}
                <div className="space-y-3">
                  {Array.isArray(weeklyData) ? weeklyData.map((week, index) => (
                    <Card key={index} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold">
                            Week of {new Date(week.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <Badge variant="secondary">
                            {week.totalDays} days
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 mr-2" style={{ color: colors.primary }} />
                            {week.averageDaily.toFixed(1)}L avg
                          </div>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-2" style={{ color: colors.success }} />
                            {week.goalMetDays}/{week.totalDays} goals
                          </div>
                          <div className="flex items-center">
                            <Pill className="h-4 w-4 mr-2" style={{ color: colors.purple }} />
                            {week.probioticDays}/{week.totalDays} pills
                          </div>
                          <div className="text-right font-medium">
                            {week.totalWater.toFixed(1)}L total
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : null}
                </div>
              </>
            ) : (
              <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-lg font-semibold mb-2">No Weekly Data Yet</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Start tracking your water intake to see weekly analytics
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            {monthlyData && monthlyData.length > 0 ? (
              <>
                {/* Monthly Chart */}
                <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Bar dataKey="averageDaily" fill={colors.primary} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Stats */}
                <div className="space-y-3">
                  {Array.isArray(monthlyData) ? monthlyData.map((month, index) => (
                    <Card key={index} style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="font-semibold text-lg">
                            {month.month} {month.year}
                          </div>
                          <Badge variant="secondary">
                            {month.totalDays} days
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 mr-2" style={{ color: colors.primary }} />
                            {month.averageDaily.toFixed(1)}L avg
                          </div>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-2" style={{ color: colors.success }} />
                            {month.goalMetDays}/{month.totalDays} goals
                          </div>
                          <div className="flex items-center">
                            <Pill className="h-4 w-4 mr-2" style={{ color: colors.purple }} />
                            {month.probioticDays}/{month.totalDays} pills
                          </div>
                          <div className="flex items-center">
                            🔥 {month.bestStreak} day streak
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-right font-medium">
                            Total: {month.totalWater.toFixed(1)}L
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : []}
                </div>
              </>
            ) : (
              <Card style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">📅</div>
                  <div className="text-lg font-semibold mb-2">No Monthly Data Yet</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Continue tracking to see monthly trends and insights
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
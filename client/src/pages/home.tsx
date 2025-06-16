import { useState, useEffect } from 'react';
import { Settings, Droplets, Moon, Sun, Award, Pill, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme-provider';
import { useHydration } from '@/hooks/use-hydration';
import { useAchievements } from '@/hooks/use-achievements';
import { getDailyQuote } from '@/lib/quotes';
import { Toast, ToastProvider, ToastViewport, ToastDescription } from '@/components/ui/toast';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { data, addWater, toggleProbiotic, updateSettings, showToast, setShowToast } = useHydration();
  const { unlockedAchievements } = useAchievements(data.achievements);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dailyQuote] = useState(getDailyQuote());

  // Calculate progress
  const percentage = Math.min((data.waterIntake / data.dailyGoal) * 100, 100);
  
  // Progress messages
  const getProgressMessage = () => {
    if (percentage >= 100) return "Goal achieved! You're a hydration hero! 🎉";
    if (percentage >= 75) return "Almost there! The finish line is in sight! 🏁";
    if (percentage >= 50) return "Halfway there! You're doing amazing! 💪";
    if (percentage >= 25) return "Great start! Keep it flowing! 🌊";
    return "Let's start hydrating! 💧";
  };

  // Water circle fill class
  const getWaterFillClass = () => {
    if (percentage >= 100) return 'water-fill-100';
    if (percentage >= 75) return 'water-fill-75';
    if (percentage >= 50) return 'water-fill-50';
    if (percentage >= 25) return 'water-fill-25';
    return '';
  };

  // Handle settings update
  const handleSettingsUpdate = (field: string, value: string | number) => {
    updateSettings({ [field]: value });
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast, setShowToast]);

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Droplets className="text-2xl" style={{ color: 'var(--water-color)' }} />
              <h1 className="text-xl font-bold">GoodSip GoodBug</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/analytics">
                <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </Link>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium mb-2">Glass Size (ml)</Label>
                      <Select value={data.glassSize.toString()} onValueChange={(value) => handleSettingsUpdate('glassSize', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="200">200ml</SelectItem>
                          <SelectItem value="250">250ml</SelectItem>
                          <SelectItem value="300">300ml</SelectItem>
                          <SelectItem value="350">350ml</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="block text-sm font-medium mb-2">Probiotic Reminder Time</Label>
                      <Input 
                        type="time" 
                        value={data.reminderTime} 
                        onChange={(e) => handleSettingsUpdate('reminderTime', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label className="block text-sm font-medium mb-2">Daily Goal (L)</Label>
                      <Select value={data.dailyGoal.toString()} onValueChange={(value) => handleSettingsUpdate('dailyGoal', parseFloat(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.5">1.5L</SelectItem>
                          <SelectItem value="2.0">2.0L</SelectItem>
                          <SelectItem value="2.5">2.5L</SelectItem>
                          <SelectItem value="3.0">3.0L</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-400" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-6 space-y-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
          {/* Daily Progress Card */}
          <Card className="rounded-2xl shadow-lg transition-all duration-300" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold mb-2">Today's Hydration</h2>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--water-color)' }}>
                  {data.waterIntake.toFixed(1)}L / {data.dailyGoal.toFixed(1)}L
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {getProgressMessage()}
                </p>
              </div>
              
              {/* Water Circle Progress */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className={`w-full h-full rounded-full border-8 border-gray-200 dark:border-gray-600 water-wave ${getWaterFillClass()}`}>
                  <div className="absolute inset-4 rounded-full flex items-center justify-center">
                    <div className="text-center z-10">
                      <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
                      <div className="text-sm opacity-75">Complete</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glass Button */}
              <div className="text-center">
                <Button 
                  onClick={addWater}
                  className="glass-button px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, var(--water-color) 0%, hsl(207, 90%, 44%) 100%)' }}
                >
                  <span className="mr-2">+</span>
                  Add Glass ({data.glassSize}ml)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Streak Card */}
            <Card className="rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-lg font-bold" style={{ color: 'var(--warning-color)' }}>
                    {data.streak}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Day Streak</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Probiotic Card */}
            <Card 
              className="rounded-xl shadow-md cursor-pointer transition-all duration-200 hover:scale-105" 
              style={{ backgroundColor: 'var(--bg-secondary)' }}
              onClick={toggleProbiotic}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {data.probioticTaken ? '✅' : '💊'}
                  </div>
                  <div className="text-sm font-semibold">GoodBug</div>
                  <div 
                    className="text-xs" 
                    style={{ color: data.probioticTaken ? 'var(--success-color)' : 'var(--text-secondary)' }}
                  >
                    {data.probioticTaken ? 'Taken today!' : 'Not taken'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <Card className="rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Award className="mr-2 h-5 w-5" style={{ color: 'var(--warning-color)' }} />
                Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {unlockedAchievements.length > 0 ? (
                  unlockedAchievements.map((achievement) => (
                    <Badge 
                      key={achievement.id}
                      variant="secondary" 
                      className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 achievement-badge"
                    >
                      {achievement.icon} {achievement.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No achievements yet. Start hydrating!</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Quote */}
          <Card className="rounded-xl shadow-md text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-4">
              <div className="text-lg mb-2">💭</div>
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                "{dailyQuote.text}"
              </p>
              <div className="text-xs mt-2 opacity-75">- {dailyQuote.author}</div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 mt-8">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Made with love❤️ by Little Brother
          </p>
        </footer>

        {/* Toast Notifications */}
        {showToast && (
          <Toast 
            variant={showToast.type as any} 
            className="animate-fade-in"
            onOpenChange={(open) => !open && setShowToast(null)}
          >
            <ToastDescription>{showToast.message}</ToastDescription>
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}

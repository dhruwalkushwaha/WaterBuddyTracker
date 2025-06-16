import { useState, useEffect } from 'react';
import { Settings, Droplets, Moon, Sun, Award, TrendingUp, Plus, Minus } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme-provider';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAchievements } from '@/hooks/use-achievements';
import { getDailyQuote } from '@/lib/quotes';
import { Toast, ToastProvider, ToastViewport, ToastDescription } from '@/components/ui/toast';

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

export default function HomeSimple() {
  const { theme, setTheme } = useTheme();
  const [data, setData] = useLocalStorage<SimpleData>('goodsip-data', initialData);
  const { unlockedAchievements } = useAchievements(data.achievements);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dailyQuote] = useState(getDailyQuote());
  const [showToast, setShowToast] = useState<{ message: string; type: string } | null>(null);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  // Check for new day and save yesterday's data
  const checkNewDay = () => {
    const today = new Date().toDateString();
    if (data.lastDate !== today) {
      setData(prev => {
        let newStreak = prev.streak;
        const newAchievements = [...prev.achievements];
        const newHistory = [...(prev.history || [])];
        
        // Save yesterday's data if there was any activity
        if (prev.waterIntake > 0 || prev.goodbugTaken) {
          const yesterdayData = {
            date: prev.lastDate,
            waterIntake: Number(prev.waterIntake),
            goodbugTaken: Boolean(prev.goodbugTaken),
            goalMet: Number(prev.waterIntake) >= Number(prev.dailyGoal),
          };
          
          // Remove existing entry for same date if it exists
          const existingIndex = newHistory.findIndex(day => day.date === prev.lastDate);
          if (existingIndex >= 0) {
            newHistory[existingIndex] = yesterdayData;
          } else {
            newHistory.push(yesterdayData);
          }
        }
        
        // Update streak
        if (prev.waterIntake >= prev.dailyGoal) {
          newStreak += 1;
          if (newStreak === 3 && !prev.achievements.includes('streak_3')) {
            newAchievements.push('streak_3');
            setShowToast({ message: "Achievement unlocked: 3 Day Streak!", type: 'achievement' });
          }
        } else if (newStreak > 0) {
          newStreak = 0;
        }
        
        return {
          ...prev,
          waterIntake: 0,
          goodbugTaken: false,
          lastDate: today,
          streak: newStreak,
          achievements: newAchievements,
          history: newHistory,
        };
      });
    }
  };

  // Add water with haptic feedback simulation
  const addWater = () => {
    const glassAmount = data.glassSize / 1000;
    const newIntake = Math.min(data.waterIntake + glassAmount, data.dailyGoal + 1);
    
    setPressedButton('add-water');
    setTimeout(() => setPressedButton(null), 150);
    
    setData(prev => {
      const newAchievements = [...prev.achievements];
      const percentage = (newIntake / prev.dailyGoal) * 100;
      
      // Check milestones
      if (percentage >= 100 && !prev.achievements.includes('milestone_100')) {
        newAchievements.push('milestone_100');
        setShowToast({ message: "Congratulations! Goal achieved! 🎉", type: 'success' });
      } else if (percentage >= 75 && !prev.achievements.includes('milestone_75')) {
        newAchievements.push('milestone_75');
        setShowToast({ message: "Almost there! The finish line is in sight! 🏁", type: 'success' });
      } else if (percentage >= 50 && !prev.achievements.includes('milestone_50')) {
        newAchievements.push('milestone_50');
        setShowToast({ message: "Halfway there! You're doing amazing! 🌊", type: 'success' });
      } else if (percentage >= 25 && !prev.achievements.includes('milestone_25')) {
        newAchievements.push('milestone_25');
        setShowToast({ message: "Great start! Keep it flowing! 💧", type: 'success' });
      }
      
      return {
        ...prev,
        waterIntake: newIntake,
        achievements: newAchievements,
      };
    });
  };

  // Subtract water
  const subtractWater = () => {
    const glassAmount = data.glassSize / 1000;
    const newIntake = Math.max(data.waterIntake - glassAmount, 0);
    
    setPressedButton('subtract-water');
    setTimeout(() => setPressedButton(null), 150);
    
    setData(prev => ({ ...prev, waterIntake: newIntake }));
    setShowToast({ message: "Water intake adjusted", type: 'reminder' });
  };

  // Toggle GoodBug
  const toggleGoodBug = () => {
    setPressedButton('goodbug');
    setTimeout(() => setPressedButton(null), 150);
    
    setData(prev => {
      const newTaken = !prev.goodbugTaken;
      if (newTaken) {
        setShowToast({ message: "Good job taking your GoodBug! 🦠✨", type: 'success' });
      }
      return { ...prev, goodbugTaken: newTaken };
    });
  };

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    checkNewDay();
  }, []);

  // Calculate progress
  const percentage = Math.min((data.waterIntake / data.dailyGoal) * 100, 100);

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Droplets className="text-2xl" style={{ color: 'var(--water-color)' }} />
              <span className="text-2xl">🦠</span>
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
                      <Select value={data.glassSize.toString()} onValueChange={(value) => setData(prev => ({ ...prev, glassSize: parseInt(value) }))}>
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
                      <Label className="block text-sm font-medium mb-2">Daily Goal (L)</Label>
                      <Select value={data.dailyGoal.toString()} onValueChange={(value) => setData(prev => ({ ...prev, dailyGoal: parseFloat(value) }))}>
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

        <main className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Quick Actions Card */}
          <Card className="rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-6 space-y-6">
              {/* Water Section */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="h-6 w-6 mr-2" style={{ color: 'var(--water-color)' }} />
                  <h3 className="text-lg font-semibold">Water Intake</h3>
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--water-color)' }}>
                  {data.waterIntake.toFixed(1)}L / {data.dailyGoal.toFixed(1)}L
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                  <div 
                    className="h-4 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      background: 'linear-gradient(90deg, var(--water-color) 0%, var(--water-light) 100%)'
                    }}
                  />
                </div>
                
                {/* Water Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={addWater}
                    className={`glass-button p-4 rounded-xl text-white font-semibold transition-all duration-150 ${
                      pressedButton === 'add-water' ? 'scale-95 shadow-inner' : 'hover:scale-105'
                    }`}
                    style={{ background: 'linear-gradient(135deg, var(--water-color) 0%, hsl(207, 90%, 44%) 100%)' }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    +{data.glassSize}ml
                  </Button>
                  
                  {data.waterIntake > 0 && (
                    <Button
                      onClick={subtractWater}
                      variant="outline"
                      className={`p-4 rounded-xl font-medium border-2 transition-all duration-150 ${
                        pressedButton === 'subtract-water' ? 'scale-95' : 'hover:scale-105'
                      }`}
                      style={{ 
                        borderColor: 'var(--water-color)', 
                        color: 'var(--water-color)',
                      }}
                    >
                      <Minus className="h-5 w-5 mr-2" />
                      -{data.glassSize}ml
                    </Button>
                  )}
                </div>
              </div>

              {/* GoodBug Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">🦠</span>
                    <h3 className="text-lg font-semibold">GoodBug Probiotic</h3>
                  </div>
                  
                  <Button
                    onClick={toggleGoodBug}
                    className={`w-full p-4 rounded-xl font-semibold transition-all duration-150 ${
                      data.goodbugTaken 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    } ${pressedButton === 'goodbug' ? 'scale-95' : 'hover:scale-105'}`}
                  >
                    {data.goodbugTaken ? (
                      <>✓ Taken Today</>
                    ) : (
                      <>Take GoodBug</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-lg font-bold" style={{ color: 'var(--warning-color)' }}>
                  {data.streak}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Day Streak</div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-lg font-bold" style={{ color: 'var(--success-color)' }}>
                  {Math.round(percentage)}%
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Today's Goal</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          {unlockedAchievements.length > 0 && (
            <Card className="rounded-xl shadow-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Award className="mr-2 h-5 w-5" style={{ color: 'var(--warning-color)' }} />
                  Recent Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unlockedAchievements.slice(-3).map((achievement) => (
                    <Badge 
                      key={achievement.id}
                      variant="secondary" 
                      className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {achievement.icon} {achievement.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
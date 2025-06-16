import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Minus, Plus } from 'lucide-react';

interface QuickActionsProps {
  waterIntake: number;
  glassSize: number;
  dailyGoal: number;
  medications: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
  onAddWater: () => void;
  onSubtractWater: () => void;
  onTakeMedication: (medicationId: string) => void;
  onRemoveMedication: (medicationId: string) => void;
  getMedicationStatus: (medicationId: string) => { completed: boolean; timesTaken: number; required: number };
}

export function QuickActions({
  waterIntake,
  glassSize,
  dailyGoal,
  medications,
  onAddWater,
  onSubtractWater,
  onTakeMedication,
  onRemoveMedication,
  getMedicationStatus,
}: QuickActionsProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handleButtonPress = (action: string, callback: () => void) => {
    setPressedButton(action);
    callback();
    setTimeout(() => setPressedButton(null), 200);
  };

  const percentage = Math.min((waterIntake / dailyGoal) * 100, 100);

  return (
    <Card className="rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <CardContent className="p-6 space-y-6">
        {/* Water Quick Actions */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Droplets className="h-6 w-6 mr-2" style={{ color: 'var(--water-color)' }} />
              <h3 className="text-lg font-semibold">Water</h3>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--water-color)' }}>
              {waterIntake.toFixed(1)}L / {dailyGoal.toFixed(1)}L
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, var(--water-color) 0%, var(--water-light) 100%)'
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleButtonPress('add-water', onAddWater)}
              className={`glass-button p-4 rounded-xl text-white font-semibold transition-all duration-150 ${
                pressedButton === 'add-water' ? 'scale-95' : 'hover:scale-105'
              }`}
              style={{ background: 'linear-gradient(135deg, var(--water-color) 0%, hsl(207, 90%, 44%) 100%)' }}
            >
              <Plus className="h-5 w-5 mr-2" />
              +{glassSize}ml
            </Button>
            
            {waterIntake > 0 && (
              <Button
                onClick={() => handleButtonPress('subtract-water', onSubtractWater)}
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
                -{glassSize}ml
              </Button>
            )}
          </div>
        </div>

        {/* Medication Quick Actions */}
        {medications.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Medications</h3>
            </div>
            
            <div className="space-y-3">
              {medications.map((medication) => {
                const status = getMedicationStatus(medication.id);
                const isCompleted = status.completed;
                const hasAnyDoses = status.timesTaken > 0;
                
                return (
                  <div key={medication.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{medication.icon}</span>
                        <div>
                          <div className="font-medium">{medication.name}</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {status.timesTaken}/{status.required} doses today
                          </div>
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="text-green-500 font-medium text-sm">Complete ✓</div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleButtonPress(`take-${medication.id}`, () => onTakeMedication(medication.id))}
                        className={`p-3 rounded-lg text-white font-medium transition-all duration-150 ${
                          pressedButton === `take-${medication.id}` ? 'scale-95' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: medication.color }}
                        disabled={isCompleted}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Take Dose
                      </Button>
                      
                      {hasAnyDoses && (
                        <Button
                          onClick={() => handleButtonPress(`remove-${medication.id}`, () => onRemoveMedication(medication.id))}
                          variant="outline"
                          className={`p-3 rounded-lg font-medium border-2 transition-all duration-150 ${
                            pressedButton === `remove-${medication.id}` ? 'scale-95' : 'hover:scale-105'
                          }`}
                          style={{ 
                            borderColor: medication.color, 
                            color: medication.color,
                          }}
                        >
                          <Minus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
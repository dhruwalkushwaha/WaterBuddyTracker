import { useCallback } from 'react';
import type { HydrationData, Medication } from '@shared/schema';

export function useMedications(data: HydrationData, setData: (updater: (prev: HydrationData) => HydrationData) => void, setShowToast: (toast: { message: string; type: string } | null) => void) {
  
  // Get today's medication status
  const getTodayMedicationStatus = useCallback((medicationId: string) => {
    const today = data.lastDate;
    const todayData = data.history.find(day => day.date === today);
    const medicationData = todayData?.medicationsTaken.find(med => med.medicationId === medicationId);
    return medicationData || { medicationId, timesTaken: [], completed: false };
  }, [data.lastDate, data.history]);

  // Take medication
  const takeMedication = useCallback((medicationId: string) => {
    const medication = data.medications.find(med => med.id === medicationId);
    if (!medication) return;

    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setData(prev => {
      const newHistory = [...prev.history];
      const today = prev.lastDate;
      
      // Find or create today's data
      let todayIndex = newHistory.findIndex(day => day.date === today);
      if (todayIndex === -1) {
        newHistory.push({
          date: today,
          waterIntake: prev.waterIntake,
          medicationsTaken: [],
          goalMet: prev.waterIntake >= prev.dailyGoal,
        });
        todayIndex = newHistory.length - 1;
      }

      const todayData = newHistory[todayIndex];
      const medicationsTaken = [...todayData.medicationsTaken];
      
      // Find or create medication entry
      let medIndex = medicationsTaken.findIndex(med => med.medicationId === medicationId);
      if (medIndex === -1) {
        medicationsTaken.push({
          medicationId,
          timesTaken: [],
          completed: false,
        });
        medIndex = medicationsTaken.length - 1;
      }

      // Add current time to timesTaken
      const timesTaken = [...medicationsTaken[medIndex].timesTaken, currentTime];
      const requiredTimes = medication.times.length;
      const completed = timesTaken.length >= requiredTimes;

      medicationsTaken[medIndex] = {
        medicationId,
        timesTaken,
        completed,
      };

      // Update today's data
      newHistory[todayIndex] = {
        ...todayData,
        medicationsTaken,
      };

      setShowToast({ 
        message: `${medication.name} taken! ${timesTaken.length}/${requiredTimes} doses today`, 
        type: 'success' 
      });

      return {
        ...prev,
        history: newHistory,
      };
    });
  }, [data.medications, setData, setShowToast]);

  // Remove last medication dose
  const removeMedicationDose = useCallback((medicationId: string) => {
    const medication = data.medications.find(med => med.id === medicationId);
    if (!medication) return;

    setData(prev => {
      const newHistory = [...prev.history];
      const today = prev.lastDate;
      
      const todayIndex = newHistory.findIndex(day => day.date === today);
      if (todayIndex === -1) return prev;

      const todayData = newHistory[todayIndex];
      const medicationsTaken = [...todayData.medicationsTaken];
      
      const medIndex = medicationsTaken.findIndex(med => med.medicationId === medicationId);
      if (medIndex === -1 || medicationsTaken[medIndex].timesTaken.length === 0) return prev;

      // Remove last dose
      const timesTaken = [...medicationsTaken[medIndex].timesTaken];
      timesTaken.pop();
      
      const requiredTimes = medication.times.length;
      const completed = timesTaken.length >= requiredTimes;

      medicationsTaken[medIndex] = {
        medicationId,
        timesTaken,
        completed,
      };

      // Update today's data
      newHistory[todayIndex] = {
        ...todayData,
        medicationsTaken,
      };

      setShowToast({ 
        message: `${medication.name} dose removed. ${timesTaken.length}/${requiredTimes} doses today`, 
        type: 'reminder' 
      });

      return {
        ...prev,
        history: newHistory,
      };
    });
  }, [data.medications, setData, setShowToast]);

  // Add new medication
  const addMedication = useCallback((medication: Omit<Medication, 'id'>) => {
    const id = `med_${Date.now()}`;
    const newMedication = { ...medication, id };
    
    setData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication],
    }));

    setShowToast({ message: `${medication.name} added to your medications`, type: 'success' });
  }, [setData, setShowToast]);

  // Update medication
  const updateMedication = useCallback((medicationId: string, updates: Partial<Medication>) => {
    setData(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === medicationId ? { ...med, ...updates } : med
      ),
    }));
  }, [setData]);

  // Delete medication
  const deleteMedication = useCallback((medicationId: string) => {
    const medication = data.medications.find(med => med.id === medicationId);
    if (!medication) return;

    setData(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== medicationId),
    }));

    setShowToast({ message: `${medication.name} removed from medications`, type: 'reminder' });
  }, [data.medications, setData, setShowToast]);

  return {
    getTodayMedicationStatus,
    takeMedication,
    removeMedicationDose,
    addMedication,
    updateMedication,
    deleteMedication,
  };
}
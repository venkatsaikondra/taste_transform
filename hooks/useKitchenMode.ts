'use client';
import { useState, useEffect, useCallback } from 'react';

export const useKitchenMode = (steps: string[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);

  // 1. Function to read the step aloud
  const readStep = useCallback((index: number) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(steps[index]);
      utterance.rate = 0.9; // Slightly slower for clarity while cooking
      window.speechSynthesis.speak(utterance);
    }
  }, [steps]);

  // 2. Initialize Voice Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      if (transcript.includes('next')) {
        handleNext();
      } else if (transcript.includes('back') || transcript.includes('previous')) {
        handlePrev();
      } else if (transcript.includes('repeat')) {
        readStep(currentStep);
      }
    };

    if (isListening) recognition.start();
    return () => recognition.stop();
  }, [isListening, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const newIndex = currentStep + 1;
      setCurrentStep(newIndex);
      readStep(newIndex);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const newIndex = currentStep - 1;
      setCurrentStep(newIndex);
      readStep(newIndex);
    }
  };

  return { currentStep, handleNext, handlePrev, isListening, setIsListening, readStep };
};
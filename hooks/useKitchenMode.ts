'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult?: (event: unknown) => void;
  onerror?: (event: unknown) => void;
  start: () => void;
  stop: () => void;
};

export const useKitchenMode = (steps: string[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  // Ref so voice handlers always see the latest step without restarting recognition
  const currentStepRef = useRef(currentStep);

  const readStep = useCallback((index: number) => {
    if (typeof window === 'undefined') return;
    if (!steps || typeof index !== 'number' || index < 0 || index >= steps.length) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(steps[index]);
    // Slightly slower, warm pitch for a clean, sweet voice
    utterance.rate = 0.98;
    utterance.pitch = 1.12;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    // Try to pick a pleasant female/soft English voice when available
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const preferred = voices.find(v => /Samantha|Karen|Zira|Victoria|Allison|Serena|Google UK English Female|Nora|Amelia|Sofie/i.test(v.name));
      const enVoice = voices.find(v => /^en/.test(v.lang));
      if (preferred) utterance.voice = preferred;
      else if (enVoice) utterance.voice = enVoice;
      else if (voices.length) utterance.voice = voices[0];
    } catch (e) {
      // ignore voice selection failures; fallback to default
    }

    window.speechSynthesis.speak(utterance);
    return;
  }, [steps]);

  // Keep ref in sync, and auto-read only on step change (not on mount side-effects)
  const isFirstRender = useRef(true);
  useEffect(() => {
    currentStepRef.current = currentStep;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      readStep(currentStep); // Read on open
      return;
    }
    // Only fires when step actually changes (not from handleNext/Prev calling readStep)
    readStep(currentStep);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // If the steps array changes, ensure currentStep is within bounds
  useEffect(() => {
    setCurrentStep(prev => {
      if (!steps || steps.length === 0) return 0;
      return Math.min(prev, Math.max(0, steps.length - 1));
    });
  }, [steps.length]);

  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.warn('Wake Lock request failed:', message);
        }
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock && typeof wakeLock.release === 'function') {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!SpeechRecognition || !isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: unknown) => {
      const eventRecord = event as { results?: ArrayLike<unknown> };
      const results = eventRecord.results;
      if (!results || results.length === 0) return;
      const result = results[results.length - 1] as { isFinal?: boolean; [index: number]: { transcript?: unknown } };
      if (!result.isFinal) return;
      const transcript = String(result[0]?.transcript ?? '').toLowerCase();

      // Use ref so these always read the current step without restarting recognition
      if (transcript.includes('next')) {
        setCurrentStep(prev => {
          const next = Math.min(prev + 1, steps.length - 1);
          currentStepRef.current = next;
          readStep(next);
          return next;
        });
      } else if (
        transcript.includes('back') ||
        transcript.includes('previous') ||
        transcript.includes('before')
      ) {
        setCurrentStep(prev => {
          const prevIdx = Math.max(prev - 1, 0);
          currentStepRef.current = prevIdx;
          readStep(prevIdx);
          return prevIdx;
        });
      } else if (transcript.includes('repeat') || transcript.includes('again')) {
        readStep(currentStepRef.current);
      }
    };

    recognition.onerror = (event: unknown) => {
      const errorEvent = event as { error?: unknown };
      const message = typeof errorEvent.error === 'string' ? errorEvent.error : String(errorEvent.error ?? 'Unknown voice control error');
      console.warn('Voice control error:', message);
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('Voice recognition start failed', err);
    }

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors when recognition is already stopped
      }
    };
  }, [isListening, readStep, steps.length]);

  // Navigation: just update state; the useEffect above handles reading
  const handleNext = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, steps.length - 1);
      currentStepRef.current = next;
      // speak immediately
      readStep(next);
      return next;
    });
  }, [steps.length]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => {
      const prevIdx = Math.max(prev - 1, 0);
      currentStepRef.current = prevIdx;
      readStep(prevIdx);
      return prevIdx;
    });
  }, []);

  return { currentStep, handleNext, handlePrev, isListening, setIsListening, readStep };
};
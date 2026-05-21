'use client';

import React, { useEffect } from 'react';
import styles from './kitchen.module.css';
import { useKitchenMode } from '@/hooks/useKitchenMode';

export default function KitchenMode({ steps, onClose }: { steps: string[], onClose: () => void }) {
  const { currentStep, handleNext, handlePrev, isListening, setIsListening, readStep } = useKitchenMode(steps);

  // Keyboard shortcuts: ArrowRight = next, ArrowLeft = previous, Space = repeat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        readStep(currentStep);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev, readStep, currentStep]);
  if (!steps || steps.length === 0) {
    return (
      <div className={styles.overlay}>
        <div className={styles.header}>
          <button onClick={onClose} className={styles.exitBtn}>EXIT KITCHEN</button>
          <div className={styles.progressTracker}>No steps available</div>
          <div />
        </div>
        <main className={styles.content}>
          <div className={styles.stepCard}>
            <p className={styles.stepText}>No instructions found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button onClick={onClose} className={styles.exitBtn}>EXIT KITCHEN</button>
        <div className={styles.progressTracker}>
          STEP <span className={styles.progressCurrent}>{currentStep + 1}</span> OF {steps.length}
        </div>
        <button onClick={() => readStep(currentStep)} className={styles.repeatBtn}>
          🔊 REPEAT
        </button>
        {/* subtle voice descriptor */}
        <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '62px', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem'}}>Clean, sweet voice</div>
      </div>

      <main className={styles.content}>
        <div className={styles.stepCard}>
          <div className={styles.stepNumber}>STEP {currentStep + 1}</div>
          <p className={styles.stepText}>{steps[currentStep]}</p>
        </div>

        {/* Step dot indicators */}
        <div className={styles.dots}>
          {steps.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === currentStep ? styles.dotActive : ''} ${i < currentStep ? styles.dotDone : ''}`}
            />
          ))}
        </div>
      </main>

      <footer className={styles.controls}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={styles.navBtn}
          aria-label="Previous step"
        >
          ← PREVIOUS
        </button>

        <button
          onClick={() => setIsListening(!isListening)}
          className={`${styles.voiceBtn} ${isListening ? styles.active : ''}`}
          aria-label={isListening ? 'Stop voice control' : 'Start voice control'}
        >
          {isListening ? '🎙️ LISTENING...' : '🎤 VOICE CONTROL'}
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className={`${styles.navBtn} ${styles.navBtnNext}`}
          aria-label="Next step"
        >
          NEXT →
        </button>
      </footer>

      {/* Floating Prev/Next for easier access */}
      <div style={{position:'fixed', left:24, bottom:24}}>
        <button onClick={handlePrev} disabled={currentStep===0} className={styles.navBtn} style={{height:48,padding:'8px 12px'}}>← Prev</button>
      </div>
      <div style={{position:'fixed', right:24, bottom:24}}>
        <button onClick={handleNext} disabled={currentStep===steps.length-1} className={`${styles.navBtn} ${styles.navBtnNext}`} style={{height:48,padding:'8px 12px'}}>Next →</button>
      </div>
    </div>
  );
}
import React from 'react';
import styles from './kitchen.module.css';
import { useKitchenMode } from '@/hooks/useKitchenMode';

export default function KitchenMode({ steps, onClose }: { steps: string[], onClose: () => void }) {
  const { currentStep, handleNext, handlePrev, isListening, setIsListening, readStep } = useKitchenMode(steps);

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button onClick={onClose} className={styles.exitBtn}>EXIT_KITCHEN</button>
        <div className={styles.progressTracker}>
          STEP <span className={styles.progressCurrent}>{currentStep + 1}</span> OF {steps.length}
        </div>
        <button onClick={() => readStep(currentStep)} className={styles.repeatBtn}>
          🔊 REPEAT
        </button>
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
          ← BACK
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
    </div>
  );
}
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
          STEP {currentStep + 1} OF {steps.length}
        </div>
      </div>

      <main className={styles.content}>
        <div className={styles.stepCard}>
          <p className={styles.stepText}>{steps[currentStep]}</p>
        </div>
      </main>

      <footer className={styles.controls}>
        <button onClick={handlePrev} disabled={currentStep === 0} className={styles.navBtn}>BACK</button>
        
        <button 
          onClick={() => setIsListening(!isListening)} 
          className={`${styles.voiceBtn} ${isListening ? styles.active : ''}`}
        >
          {isListening ? '🎙️ LISTENING...' : '🎤 START VOICE CONTROL'}
        </button>

        <button onClick={handleNext} disabled={currentStep === steps.length - 1} className={styles.navBtn}>NEXT</button>
      </footer>
    </div>
  );
}
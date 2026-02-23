'use client';
import React from 'react';
import styles from './loading.module.css';

interface LoadingScreenProps {
  isVisible: boolean;
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.videoContainer}>
        {/* The video from your fridge animation */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className={styles.loadingVideo}
        >
          <source src="Animations/fridge_removed_marker.mp4" type="video/mp4" />
        </video>
        
        {/* Futuristic Loading Text */}
        <div className={styles.statusContainer}>
          <h2 className={styles.loadingText}>OPENING FRIDGE...</h2>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';
import React, { useState } from 'react';
import styles from './predict.module.css';
import LoadingScreen from '@/components/Loading/LoadingScreen';

export default function DishPredictor() {
  const [prediction, setPrediction] = useState<{ dishName: string, ingredients: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setLoading(true);
      
      try {
        const compressed = await compressImage(base64);
        setPreview(compressed);

        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: compressed, mimeType: file.type || 'image/jpeg' }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPrediction(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        alert(`SCAN_ERROR: ${message}`);
        console.error('[predict page]', err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.container}>
      <LoadingScreen isVisible={loading} />
      
      <div className={styles.scanHeader}>
        <h1 className={styles.glitchTitle}>REVERSE_ENGINEER.EXE</h1>
        <p className={styles.terminalText}>SYSTEM_STATUS: {loading ? 'SCANNING...' : 'AWAITING_INPUT'}</p>
      </div>

      <div className={`${styles.uploadBox} ${preview ? styles.hasPreview : ''}`}>
        {preview ? (
          <img src={preview} alt="Scanning..." className={styles.imagePreview} />
        ) : (
          <>
            <input type="file" accept="image/*" onChange={handleImageUpload} id="dish-upload" hidden />
            <label htmlFor="dish-upload" className={styles.uploadLabel}>
              <span className={styles.uploadIcon}>📷</span>
              UPLOAD_DISH_FOR_MOLECULAR_ANALYSIS
            </label>
          </>
        )}
        {preview && !loading && (
          <button onClick={() => {setPreview(null); setPrediction(null);}} className={styles.resetBtn}>
            SCAN_NEW_DISH
          </button>
        )}
      </div>

      {prediction && (
        <div className={styles.resultCard}>
          <div className={styles.cardGlow}></div>
          <h2 className={styles.dishName}>[IDENTIFIED]: {prediction.dishName.toUpperCase()}</h2>
          
          <div className={styles.ingredientList}>
            {prediction.ingredients.map((ing, i) => (
              <div key={i} className={styles.ingTag}>
                <span className={styles.neonDot}></span> {ing}
              </div>
            ))}
          </div>
          
          <button className={styles.pantryBtn}>IMPORT_TO_MY_PANTRY</button>
        </div>
      )}
    </div>
  );
}
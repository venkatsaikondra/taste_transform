'use client';
import React, { useState } from 'react';
import styles from './predict.module.css';

export default function DishPredictor() {
  const [prediction, setPrediction] = useState<{ dishName: string, ingredients: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setLoading(true);
      const res = await fetch('/api/predict-dish', {
        method: 'POST',
        body: JSON.stringify({ image: reader.result }),
      });
      const data = await res.json();
      setPrediction(data);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.glitchTitle}>REVERSE_ENGINEER_DISH</h1>
      
      <div className={styles.uploadBox}>
        <input type="file" accept="image/*" onChange={handleImageUpload} id="dish-upload" hidden />
        <label htmlFor="dish-upload" className={styles.uploadLabel}>
          {loading ? "SCANNING_MOLECULAR_STRUCTURE..." : "UPLOAD_DISH_PHOTO"}
        </label>
      </div>

      {prediction && (
        <div className={styles.resultCard}>
          <h2 className={styles.dishName}>IDENTIFIED: {prediction.dishName.toUpperCase()}</h2>
          <div className={styles.ingredientList}>
            {prediction.ingredients.map((ing, i) => (
              <div key={i} className={styles.ingTag}>
                <span className={styles.dot}></span> {ing}
              </div>
            ))}
          </div>
          <button className={styles.pantryBtn}>ADD_ALL_TO_PANTRY</button>
        </div>
      )}
    </div>
  );
}
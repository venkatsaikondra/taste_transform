'use client';
import React, { useState } from 'react';
import styles from './vision.module.css';

type PredictionResult = {
  dishName?: string;
  ingredients?: string[];
};

export default function DishPredictor() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setPrediction(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (!reader.result || typeof reader.result !== 'string') {
        setErrorMessage('Unable to read the selected image.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/predict-dish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: reader.result,
            mimeType: file.type || 'image/jpeg',
          }),
        });
        const data = await res.json();

        if (!res.ok || !data?.dishName) {
          setErrorMessage(data?.error || 'Dish could not be identified.');
          setPrediction(null);
        } else {
          setPrediction({
            dishName: String(data.dishName),
            ingredients: Array.isArray(data.ingredients)
              ? data.ingredients.map(String)
              : [],
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        setErrorMessage(message);
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const displayName = prediction?.dishName ? prediction.dishName.toUpperCase() : 'UNKNOWN DISH';

  return (
    <div className={styles.container}>
      <h1 className={styles.glitchTitle}>REVERSE_ENGINEER_DISH</h1>
      
      <div className={styles.uploadBox}>
        <input type="file" accept="image/*" onChange={handleImageUpload} id="dish-upload" hidden />
        <label htmlFor="dish-upload" className={styles.uploadLabel}>
          {loading ? "SCANNING_MOLECULAR_STRUCTURE..." : "UPLOAD_DISH_PHOTO"}
        </label>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      {prediction && (
        <div className={styles.resultCard}>
          <h2 className={styles.dishName}>IDENTIFIED: {displayName}</h2>
          <div className={styles.ingredientList}>
            {(prediction.ingredients && prediction.ingredients.length > 0) ? (
              prediction.ingredients.map((ing, i) => (
                <div key={i} className={styles.ingTag}>
                  <span className={styles.dot}></span> {ing}
                </div>
              ))
            ) : (
              <div className={styles.noIngredients}>No ingredients identified.</div>
            )}
          </div>
          <button className={styles.pantryBtn}>ADD_ALL_TO_PANTRY</button>
        </div>
      )}
    </div>
  );
}
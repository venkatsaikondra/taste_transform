'use client';
import React, { useEffect, useState } from 'react';
import styles from './community.module.css';
import LoadingScreen from '@/components/Loading/LoadingScreen';

export default function CommunityKitchen() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/community')
      .then(res => res.json())
      .then(data => {
        setRecipes(data.recipes || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.root}>
      <LoadingScreen isVisible={loading} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>COMMUNITY_KITCHEN</h1>
        <p className={styles.subtitle}>See what others are vibe-cooking</p>
      </div>

      <div className={styles.feedGrid}>
        {recipes.map((recipe: any) => (
          <div key={recipe._id} className={styles.recipeCard}>
            <div className={styles.cardHeader}>
              <span className={styles.vibeBadge}>{recipe.vibe}</span>
              <span className={styles.calBadge}>{recipe.totalCalories} kcal</span>
            </div>
            
            <h3 className={styles.recipeName}>{recipe.recipeName}</h3>
            
            <div className={styles.ingredientsPreview}>
              {recipe.ingredients.slice(0, 3).map((ing: any) => (
                <span key={ing.name}>{ing.emoji}</span>
              ))}
              {recipe.ingredients.length > 3 && <span>...</span>}
            </div>

            <div className={styles.cardActions}>
              <button className={styles.actionBtn}>❤️ {recipe.likes?.length || 0}</button>
              <button className={styles.actionBtn}>🍴 FORK</button>
              <button className={styles.viewBtn}>VIEW_FULL</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
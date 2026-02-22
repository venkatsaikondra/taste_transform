'use client';
import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { Trash2, Heart, Calendar, ChefHat, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Recipe = {
  _id: string;
  recipeName: string;
  ingredients: { name: string; emoji: string; quantity: number }[];
  steps: string;
  vibe: string;
  totalCalories: number;
  recipeText: string;
  isFavorite: boolean;
  createdAt: string;
};

const Dashboard = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch recipes');
      }

      setRecipes(data.recipes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete recipe');
      
      setRecipes(recipes.filter(r => r._id !== id));
      if (selectedRecipe?._id === id) setSelectedRecipe(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete recipe');
    }
  };

  const toggleFavorite = async (recipe: Recipe) => {
    try {
      const res = await fetch(`/api/recipes/${recipe._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !recipe.isFavorite }),
      });

      if (!res.ok) throw new Error('Failed to update recipe');

      const { recipe: updatedRecipe } = await res.json();
      setRecipes(recipes.map(r => r._id === recipe._id ? updatedRecipe : r));
      if (selectedRecipe?._id === recipe._id) setSelectedRecipe(updatedRecipe);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update recipe');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRecipeText = (text: string) => {
    const lines = text.split('\n');
    const formatted: { type: string; content: string }[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Remove all markdown formatting variations
      let cleaned = trimmed
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // **text** anywhere in line
        .replace(/\*([^*]+)\*/g, '$1')      // *text* anywhere in line
        .replace(/^\* /, '')                // * at start
        .replace(/^\- /, '');               // - at start

      // Detect section headers (including compound phrases)
      if (cleaned.match(/^(recipe\s*name|recipe|name|ingredients?|steps?|instructions?|directions?|tips?|variations?|tips\s+and\s+variations?):/i)) {
        formatted.push({ type: 'header', content: cleaned });
      }
      // Detect list items (including numbered lists)
      else if (line.match(/^\s*[\*\-•]\s+/) || line.match(/^\s*\d+[\.)]\s+/)) {
        // Remove list markers and clean
        cleaned = cleaned.replace(/^\d+[\.)]\s*/, '');
        formatted.push({ type: 'list', content: cleaned });
      }
      // Regular paragraph
      else {
        formatted.push({ type: 'text', content: cleaned });
      }
    }
    
    return formatted;
  };

  const getVibeColor = (vibe: string) => {
    switch (vibe) {
      case 'Safe':
        return '#22c55e';
      case 'Experimental':
        return '#f97316';
      case 'Chaos':
        return '#ec4899';
      default:
        return '#a78bfa';
    }
  };

  const parseRecipeText = (text: string) => {
    // Try to extract recipe name, ingredients, and steps from the AI-generated text
    const lines = text.split('\n').filter(l => l.trim());
    let parsedName = '';
    const parsedIngredients: string[] = [];
    const parsedSteps: string[] = [];
    
    let section: 'name' | 'ingredients' | 'steps' | 'none' = 'none';
    
    for (const line of lines) {
      const lower = line.toLowerCase();
      
      // Detect recipe name (usually first line or starts with "Recipe:")
      if (!parsedName && line.trim() && !lower.includes('ingredient') && !lower.includes('step')) {
        parsedName = line.replace(/^(recipe:|name:)/i, '').trim();
        continue;
      }
      
      // Detect ingredients section
      if (lower.includes('ingredient')) {
        section = 'ingredients';
        continue;
      }
      
      // Detect steps section
      if (lower.includes('step') || lower.includes('instruction') || lower.includes('direction')) {
        section = 'steps';
        continue;
      }
      
      // Add to appropriate section
      if (section === 'ingredients' && line.trim().match(/^[-•*\d.]/)) {
        parsedIngredients.push(line.trim());
      } else if (section === 'steps' && line.trim()) {
        parsedSteps.push(line.trim());
      }
    }
    
    return { parsedName, parsedIngredients, parsedSteps };
  };

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>
          <ChefHat className={styles.loadingIcon} size={48} />
          <p>Loading your recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.root}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchRecipes} className={styles.retryBtn}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* Ambient background blobs */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      <div className={styles.blob3}></div>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ChefHat className={styles.headerIcon} size={42} />
            <div>
              <h1 className={styles.title}>Recipe Dashboard</h1>
              <p className={styles.subtitle}>Your culinary creations</p>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{recipes.length}</span>
              <span className={styles.statLabel}>Total Recipes</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{recipes.filter(r => r.isFavorite).length}</span>
              <span className={styles.statLabel}>Favorites</span>
            </div>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className={styles.empty}>
            <ChefHat size={80} className={styles.emptyIcon} />
            <h2>No Recipes Yet</h2>
            <p>Head to the Fridge and generate your first recipe!</p>
            <button onClick={() => router.push('/fridge')} className={styles.emptyBtn}>
              Open Fridge
            </button>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Recipe Grid */}
            <div className={styles.recipeGrid}>
              {recipes.map((recipe) => {
                const { parsedName, parsedIngredients } = parseRecipeText(recipe.recipeText);
                const displayName = recipe.recipeName || parsedName || 'Untitled Recipe';
                
                return (
                  <div
                    key={recipe._id}
                    className={`${styles.recipeCard} ${selectedRecipe?._id === recipe._id ? styles.selected : ''}`}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{displayName}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(recipe);
                        }}
                        className={`${styles.favoriteBtn} ${recipe.isFavorite ? styles.favorited : ''}`}
                      >
                        <Heart size={18} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className={styles.cardIngredients}>
                      {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                        <span key={idx} className={styles.ingredientBadge}>
                          {ing.emoji} {ing.name}
                        </span>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <span className={styles.ingredientBadge}>+{recipe.ingredients.length - 5}</span>
                      )}
                      {recipe.ingredients.length === 0 && parsedIngredients.length > 0 && (
                        <span className={styles.ingredientCount}>{parsedIngredients.length} ingredients</span>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.cardMeta}>
                        <span className={styles.vibe} style={{ color: getVibeColor(recipe.vibe) }}>
                          <Flame size={14} /> {recipe.vibe}
                        </span>
                        {recipe.totalCalories > 0 && (
                          <span className={styles.calories}>{recipe.totalCalories} cal</span>
                        )}
                      </div>
                      <div className={styles.cardActions}>
                        <span className={styles.date}>
                          <Calendar size={12} /> {formatDate(recipe.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecipe(recipe._id);
                          }}
                          className={styles.deleteBtn}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recipe Detail Panel */}
            {selectedRecipe && (
              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <h2 className={styles.detailTitle}>
                    {selectedRecipe.recipeName || parseRecipeText(selectedRecipe.recipeText).parsedName || 'Recipe Details'}
                  </h2>
                  <button
                    onClick={() => toggleFavorite(selectedRecipe)}
                    className={`${styles.favoriteBtn} ${selectedRecipe.isFavorite ? styles.favorited : ''}`}
                  >
                    <Heart size={20} fill={selectedRecipe.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className={styles.detailMeta}>
                  <span className={styles.vibe} style={{ color: getVibeColor(selectedRecipe.vibe) }}>
                    <Flame size={16} /> {selectedRecipe.vibe} Mode
                  </span>
                  {selectedRecipe.totalCalories > 0 && (
                    <span className={styles.calories}>Total: {selectedRecipe.totalCalories} cal</span>
                  )}
                  <span className={styles.date}>
                    <Calendar size={14} /> {formatDate(selectedRecipe.createdAt)}
                  </span>
                </div>

                {selectedRecipe.ingredients.length > 0 && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>Ingredients</h3>
                    <ul className={styles.ingredientList}>
                      {selectedRecipe.ingredients.map((ing, idx) => (
                        <li key={idx}>
                          <span className={styles.emoji}>{ing.emoji}</span>
                          <span className={styles.ingName}>{ing.name}</span>
                          {ing.quantity > 0 && <span className={styles.ingQty}>× {ing.quantity}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Recipe</h3>
                  <div className={styles.recipeContent}>
                    {formatRecipeText(selectedRecipe.recipeText).map((item, idx) => {
                      if (item.type === 'header') {
                        return (
                          <h4 key={idx} className={styles.recipeHeader}>
                            {item.content}
                          </h4>
                        );
                      } else if (item.type === 'list') {
                        return (
                          <div key={idx} className={styles.recipeListItem}>
                            <span className={styles.listBullet}>•</span>
                            <span>{item.content}</span>
                          </div>
                        );
                      } else {
                        return (
                          <p key={idx} className={styles.recipeParagraph}>
                            {item.content}
                          </p>
                        );
                      }
                    })}
                  </div>
                </div>

                <button
                  onClick={() => deleteRecipe(selectedRecipe._id)}
                  className={styles.deleteFullBtn}
                >
                  <Trash2 size={18} /> Delete Recipe
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

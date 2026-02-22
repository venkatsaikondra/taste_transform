'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './fridge.module.css';

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'veggies',
    label: 'Veggies',
    emoji: '🥦',
    color: '#22c55e',
    items: [
      { id: 'v1', name: 'Broccoli', emoji: '🥦', cal: 55 },
      { id: 'v2', name: 'Carrot', emoji: '🥕', cal: 41 },
      { id: 'v3', name: 'Tomato', emoji: '🍅', cal: 22 },
      { id: 'v4', name: 'Spinach', emoji: '🌿', cal: 23 },
      { id: 'v5', name: 'Bell Pepper', emoji: '🫑', cal: 31 },
      { id: 'v6', name: 'Mushroom', emoji: '🍄', cal: 22 },
      { id: 'v7', name: 'Corn', emoji: '🌽', cal: 86 },
      { id: 'v8', name: 'Eggplant', emoji: '🍆', cal: 35 },
    ],
  },
  {
    id: 'proteins',
    label: 'Proteins',
    emoji: '🥩',
    color: '#f97316',
    items: [
      { id: 'p1', name: 'Chicken', emoji: '🍗', cal: 239 },
      { id: 'p2', name: 'Eggs', emoji: '🥚', cal: 78 },
      { id: 'p3', name: 'Salmon', emoji: '🐟', cal: 208 },
      { id: 'p4', name: 'Tofu', emoji: '⬜', cal: 76 },
      { id: 'p5', name: 'Beef', emoji: '🥩', cal: 250 },
      { id: 'p6', name: 'Shrimp', emoji: '🦐', cal: 84 },
    ],
  },
  {
    id: 'pantry',
    label: 'Pantry',
    emoji: '🫙',
    color: '#a78bfa',
    items: [
      { id: 'pa1', name: 'Rice', emoji: '🍚', cal: 206 },
      { id: 'pa2', name: 'Pasta', emoji: '🍝', cal: 220 },
      { id: 'pa3', name: 'Garlic', emoji: '🧄', cal: 4 },
      { id: 'pa4', name: 'Olive Oil', emoji: '🫙', cal: 119 },
      { id: 'pa5', name: 'Lemon', emoji: '🍋', cal: 29 },
      { id: 'pa6', name: 'Chili', emoji: '🌶️', cal: 18 },
      { id: 'pa7', name: 'Cheese', emoji: '🧀', cal: 113 },
      { id: 'pa8', name: 'Butter', emoji: '🧈', cal: 102 },
    ],
  },
];

const VIBES = ['Safe', 'Experimental', 'Chaos'];

type CartItem = {
  id: string;
  name: string;
  emoji: string;
  cal: number;
  qty: number;
};

type VideoResult = {
  videoId: string;
  title: string;
  thumbnail: string;
};

// ─── Particle ────────────────────────────────────────────────────────────────

function Particle({ emoji, startX, startY, endX, endY, onDone }: {
  emoji: string; startX: number; startY: number; endX: number; endY: number; onDone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dx = endX - startX;
    const dy = endY - startY;

    el.animate(
      [
        { transform: `translate(0px, 0px) scale(1) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.2 - 80}px) scale(1.4) rotate(15deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3) rotate(30deg)`, opacity: 0 },
      ],
      { duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' }
    ).onfinish = onDone;
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: startX,
        top: startY,
        fontSize: '2rem',
        pointerEvents: 'none',
        zIndex: 9999,
        userSelect: 'none',
      }}
    >
      {emoji}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Fridge() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vibe, setVibe] = useState(0);
  const [particles, setParticles] = useState<{ id: number; emoji: string; sx: number; sy: number; ex: number; ey: number }[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const cartRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);

  // Recipe generation UI state
  const [recipeText, setRecipeText] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  const launchParticle = (emoji: string, itemRect: DOMRect) => {
    const cartEl = cartRef.current;
    if (!cartEl) return;
    const cartRect = cartEl.getBoundingClientRect();

    const id = particleIdRef.current++;
    setParticles(p => [...p, {
      id,
      emoji,
      sx: itemRect.left + itemRect.width / 2 - 16,
      sy: itemRect.top + itemRect.height / 2 - 16,
      ex: cartRect.left + cartRect.width / 2 - 16,
      ey: cartRect.top + 40,
    }]);
  };

  const addRipple = (x: number, y: number) => {
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
  };

  const handleItemClick = (item: typeof CATEGORIES[0]['items'][0], e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    launchParticle(item.emoji, rect);
    addRipple(e.clientX, e.clientY);

    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => {
    const item = prev.find(c => c.id === id);
    if (!item) return prev;
    if (item.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    return prev.filter(c => c.id !== id);
  });

  const totalCal = cart.reduce((sum, c) => sum + c.cal * c.qty, 0);
  const vibeColor = vibe === 0 ? '#22c55e' : vibe === 1 ? '#f97316' : '#ec4899';
  const vibeLabel = VIBES[vibe];

  // Parse and format recipe text
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

  // Generate recipe by sending selected ingredient names to the server route
  async function generateRecipe() {
    setGenError(null);
    setRecipeText(null);
    setVideos([]);
    setSaveSuccess(false);
    const ingredients = cart.map(c => c.name);
    if (ingredients.length === 0) {
      setGenError('Add some ingredients to the pot before generating a recipe.');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data?.error || 'Failed to generate recipe');
      } else {
        setRecipeText(data?.recipe ?? JSON.stringify(data));

        // YouTube search — use first 2 ingredients + "recipe" as query
        try {
          const youtubeRes = await fetch(
            `/api/youtube?query=${encodeURIComponent(ingredients.slice(0, 2).join(' ') + ' recipe')}`
          );
          if (youtubeRes.ok) {
            const ytData = await youtubeRes.json();
            setVideos(ytData.videos ?? []);
          }
        } catch {
          // YouTube is optional — silently ignore errors
        }
      }
    } catch (err: any) {
      setGenError(err?.message ?? String(err));
    } finally {
      setGenerating(false);
    }
  }

  // Save recipe to dashboard
  async function saveRecipe() {
    if (!recipeText) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      // Extract recipe name from the text (usually first line)
      const lines = recipeText.split('\n').filter(l => l.trim());
      const recipeName = lines[0]?.replace(/^(recipe:|name:)/i, '').trim() || 'Untitled Recipe';

      const res = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName,
          ingredients: cart.map(c => ({ name: c.name, emoji: c.emoji, quantity: c.qty })),
          steps: recipeText,
          vibe: vibeLabel,
          totalCalories: totalCal,
          recipeText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setGenError('Please log in to save recipes');
        } else {
          setGenError(data?.error || 'Failed to save recipe');
        }
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.root}>
      {/* Ambient background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      {/* Ripple effects */}
      {ripples.map(r => (
        <div key={r.id} className={styles.ripple} style={{ left: r.x, top: r.y }} />
      ))}

      {/* Particles */}
      {particles.map(p => (
        <Particle
          key={p.id}
          emoji={p.emoji}
          startX={p.sx}
          startY={p.sy}
          endX={p.ex}
          endY={p.ey}
          onDone={() => setParticles(prev => prev.filter(x => x.id !== p.id))}
        />
      ))}

      <div className={styles.layout}>

        {/* ── LEFT: Fridge ── */}
        <div className={styles.fridge}>
          <div className={styles.fridgeHeader}>
            <span className={styles.fridgeIcon}>❄️</span>
            <div>
              <h1 className={styles.fridgeTitle}>Digital Pantry</h1>
              <p className={styles.fridgeSub}>Pick your ingredients</p>
            </div>
          </div>

          {/* Category tabs */}
          <div className={styles.tabs}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
                style={{ '--cat-color': cat.color } as React.CSSProperties}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              >
                <span className={styles.tabEmoji}>{cat.emoji}</span>
                <span>{cat.label}</span>
                {activeCategory === cat.id && <span className={styles.tabArrow}>▾</span>}
              </button>
            ))}
          </div>

          {/* Item grid */}
          <div className={`${styles.itemGrid} ${currentCategory ? styles.itemGridVisible : ''}`}>
            {currentCategory ? (
              <>
                <div className={styles.categoryBanner} style={{ '--cat-color': currentCategory.color } as React.CSSProperties}>
                  <span>{currentCategory.emoji}</span>
                  <span>{currentCategory.label}</span>
                  <span className={styles.categoryCount}>{currentCategory.items.length} items</span>
                </div>
                <div className={styles.itemsWrap}>
                  {currentCategory.items.map((item, i) => {
                    const inCart = cart.find(c => c.id === item.id);
                    return (
                      <button
                        key={item.id}
                        className={`${styles.item} ${inCart ? styles.itemInCart : ''}`}
                        style={{ animationDelay: `${i * 0.05}s`, '--cat-color': currentCategory.color } as React.CSSProperties}
                        onClick={(e) => handleItemClick(item, e)}
                      >
                        <div className={styles.itemEmoji}>{item.emoji}</div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemCal}>{item.cal} kcal</div>
                        {inCart && (
                          <div className={styles.itemBadge} style={{ background: currentCategory.color }}>
                            {inCart.qty}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyEmoji}>👆</div>
                <p>Select a category above to browse ingredients</p>
              </div>
            )}
          </div>

          {/* Vibe slider */}
        </div>

        {/* ── RIGHT: Cooking Pot / Cart ── */}
        <div className={styles.pot} ref={cartRef}>
          <div className={styles.potHeader}>
            <div className={styles.potIcon}>🫕</div>
            <div>
              <h2 className={styles.potTitle}>Cooking Pot</h2>
              <p className={styles.potSub}>{cart.length === 0 ? 'Empty — add ingredients!' : `${cart.reduce((s, c) => s + c.qty, 0)} items · ${totalCal} kcal`}</p>
            </div>
          </div>

          <div className={styles.cartItems}>
            {cart.length === 0 ? (
              <div className={styles.cartEmpty}>
                <div className={styles.cartEmptyPot}>🫕</div>
                <p>Click ingredients to toss them in!</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <span className={styles.cartEmoji}>{item.emoji}</span>
                  <div className={styles.cartInfo}>
                    <span className={styles.cartName}>{item.name}</span>
                    <span className={styles.cartCal}>{item.cal * item.qty} kcal</span>
                  </div>
                  <div className={styles.cartControls}>
                    <button className={styles.qtyBtn} onClick={() => removeFromCart(item.id)}>−</button>
                    <span className={styles.qty}>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => {
                      const cat = CATEGORIES.flatMap(c => c.items).find(i => i.id === item.id);
                      if (cat) setCart(prev => prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
                    }}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className={styles.cartFooter}>
              <div className={styles.totalRow}>
                <span>Total Calories</span>
                <span className={styles.totalCal}>{totalCal} kcal</span>
              </div>
              <button
                className={styles.cookBtn}
                style={{ '--vibe-color': vibeColor } as React.CSSProperties}
                onClick={() => generateRecipe()}
                disabled={generating}
              >
                <span>{generating ? 'Generating…' : `Cook with ${vibeLabel} Mode`}</span>
                <span>{vibe === 0 ? '🍽️' : vibe === 1 ? '🔬' : '🚀'}</span>
              </button>
              <button
                className={styles.clearBtn}
                onClick={() => {
                  setCart([]);
                  setRecipeText(null);
                  setGenError(null);
                  setVideos([]);
                }}
              >
                Clear Pot
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Recipe viewer section - inline below ingredients */}
      {recipeText && (
        <div className={styles.recipeSection}>
          <div className={styles.recipeSectionHeader}>
            <h3 className={styles.recipeSectionTitle}>🍳 Your Recipe</h3>
            <div className={styles.recipeActions}>
              <button 
                onClick={saveRecipe} 
                className={`${styles.saveBtnSmall} ${saveSuccess ? styles.saveBtnSuccess : ''}`}
                disabled={saving || saveSuccess}
                title="Save to Dashboard"
              >
                {saving ? '💾' : saveSuccess ? '✓' : '💾'}
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(recipeText); }} className={styles.iconBtn} title="Copy">📋</button>
              <button onClick={() => { setRecipeText(null); setVideos([]); setGenError(null); }} className={styles.iconBtn} title="Close">✕</button>
            </div>
          </div>
          <div className={styles.recipeBody}>
            {formatRecipeText(recipeText).map((item, idx) => {
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
      )}

      {/* YouTube video recommendations */}
      {videos.length > 0 && (
        <div className={styles.videoSection}>
          <h3 className={styles.videoHeading}>VISUAL_GUIDES_FOUND</h3>
          <div className={styles.videoGrid}>
            {videos.map((vid) => (
              <a
                key={vid.videoId}
                href={`https://youtube.com/watch?v=${vid.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoCard}
              >
                <img src={vid.thumbnail} alt={vid.title} />
                <p>{vid.title}</p>
                <span className={styles.watchBadge}>▶ WATCH_TUTORIAL</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {genError && (
        <div className={styles.genError}>{genError}</div>
      )}
    </div>
  );
}
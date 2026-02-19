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


type CartItem = {
  id: string;
  name: string;
  emoji: string;
  cal: number;
  qty: number;
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
              <h1 className={styles.fridgeTitle}>Fridge</h1>
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
        
              <button className={styles.clearBtn} onClick={() => setCart([])}>
                Clear Pot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  }
'use client';
import React, { useState, useRef, useEffect } from 'react';
import styles from './fridge.module.css';
import LoadingScreen from '../Loading/LoadingScreen';
// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'veggies',
    label: 'Veggies',
    emoji: '🥦',
    color: '#22c55e',
    items: [
      { id: 'v1',  name: 'Broccoli',      emoji: '🥦', cal: 55  },
      { id: 'v2',  name: 'Carrot',        emoji: '🥕', cal: 41  },
      { id: 'v3',  name: 'Tomato',        emoji: '🍅', cal: 22  },
      { id: 'v4',  name: 'Spinach',       emoji: '🌿', cal: 23  },
      { id: 'v5',  name: 'Bell Pepper',   emoji: '🫑', cal: 31  },
      { id: 'v6',  name: 'Mushroom',      emoji: '🍄', cal: 22  },
      { id: 'v7',  name: 'Corn',          emoji: '🌽', cal: 86  },
      { id: 'v8',  name: 'Eggplant',      emoji: '🍆', cal: 35  },
      { id: 'v9',  name: 'Zucchini',      emoji: '🥒', cal: 17  },
      { id: 'v10', name: 'Onion',         emoji: '🧅', cal: 40  },
      { id: 'v11', name: 'Potato',        emoji: '🥔', cal: 77  },
      { id: 'v12', name: 'Avocado',       emoji: '🥑', cal: 160 },
      { id: 'v13', name: 'Sweet Potato',  emoji: '🍠', cal: 86  },
      { id: 'v14', name: 'Asparagus',     emoji: '🎋', cal: 20  },
      { id: 'v15', name: 'Cabbage',       emoji: '🥬', cal: 25  },
      { id: 'v16', name: 'Kale',          emoji: '🌱', cal: 35  },
      { id: 'v17', name: 'Cauliflower',   emoji: '🥦', cal: 25  },
      { id: 'v18', name: 'Brussels Sprout', emoji: '🟢', cal: 43 },
      { id: 'v19', name: 'Cucumber',      emoji: '🥒', cal: 16  },
      { id: 'v20', name: 'Leek',          emoji: '🌿', cal: 31  },
      { id: 'v21', name: 'Celery',        emoji: '🌿', cal: 14  },
      { id: 'v22', name: 'Beetroot',      emoji: '🔴', cal: 43  },
      { id: 'v23', name: 'Radish',        emoji: '🔴', cal: 19  },
      { id: 'v24', name: 'Peas',          emoji: '🟢', cal: 62  },
      { id: 'v25', name: 'Green Beans',   emoji: '🌿', cal: 31  },
      { id: 'v26', name: 'Artichoke',     emoji: '🟢', cal: 47  },
      { id: 'v27', name: 'Pumpkin',       emoji: '🎃', cal: 26  },
      { id: 'v28', name: 'Bok Choy',      emoji: '🥬', cal: 13  },
    ],
  },

  {
    id: 'proteins',
    label: 'Proteins',
    emoji: '🥩',
    color: '#f97316',
    items: [
      { id: 'p1',  name: 'Chicken',    emoji: '🍗', cal: 239 },
      { id: 'p2',  name: 'Eggs',       emoji: '🥚', cal: 78  },
      { id: 'p3',  name: 'Salmon',     emoji: '🐟', cal: 208 },
      { id: 'p4',  name: 'Tofu',       emoji: '⬜', cal: 76  },
      { id: 'p5',  name: 'Beef',       emoji: '🥩', cal: 250 },
      { id: 'p6',  name: 'Shrimp',     emoji: '🦐', cal: 84  },
      { id: 'p7',  name: 'Pork',       emoji: '🥓', cal: 242 },
      { id: 'p8',  name: 'Lentils',    emoji: '🫘', cal: 116 },
      { id: 'p9',  name: 'Chickpeas',  emoji: '🥣', cal: 164 },
      { id: 'p10', name: 'Turkey',     emoji: '🦃', cal: 189 },
      { id: 'p11', name: 'Paneer',     emoji: '🧀', cal: 265 },
      { id: 'p12', name: 'Tuna',       emoji: '🐟', cal: 132 },
      { id: 'p13', name: 'Sardines',   emoji: '🐟', cal: 208 },
      { id: 'p14', name: 'Lamb',       emoji: '🐑', cal: 294 },
      { id: 'p15', name: 'Duck',       emoji: '🦆', cal: 337 },
      { id: 'p16', name: 'Crab',       emoji: '🦀', cal: 97  },
      { id: 'p17', name: 'Lobster',    emoji: '🦞', cal: 98  },
      { id: 'p18', name: 'Scallops',   emoji: '🐚', cal: 111 },
      { id: 'p19', name: 'Tempeh',     emoji: '🫘', cal: 195 },
      { id: 'p20', name: 'Edamame',    emoji: '🟢', cal: 121 },
      { id: 'p21', name: 'Black Beans',emoji: '🫘', cal: 132 },
      { id: 'p22', name: 'Greek Yogurt',emoji:'🥛', cal: 100 },
      { id: 'p23', name: 'Cottage Cheese', emoji: '🧀', cal: 98 },
      { id: 'p24', name: 'Whey Protein', emoji: '💪', cal: 120 },
    ],
  },

  {
    id: 'pantry',
    label: 'Pantry',
    emoji: '🫙',
    color: '#a78bfa',
    items: [
      { id: 'pa1',  name: 'Rice',          emoji: '🍚', cal: 206 },
      { id: 'pa2',  name: 'Pasta',         emoji: '🍝', cal: 220 },
      { id: 'pa3',  name: 'Garlic',        emoji: '🧄', cal: 4   },
      { id: 'pa4',  name: 'Olive Oil',     emoji: '🫙', cal: 119 },
      { id: 'pa5',  name: 'Lemon',         emoji: '🍋', cal: 29  },
      { id: 'pa6',  name: 'Chili',         emoji: '🌶️', cal: 18  },
      { id: 'pa7',  name: 'Cheese',        emoji: '🧀', cal: 113 },
      { id: 'pa8',  name: 'Butter',        emoji: '🧈', cal: 102 },
      { id: 'pa9',  name: 'Soy Sauce',     emoji: '🧴', cal: 9   },
      { id: 'pa10', name: 'Honey',         emoji: '🍯', cal: 64  },
      { id: 'pa11', name: 'Flour',         emoji: '🥡', cal: 364 },
      { id: 'pa12', name: 'Milk',          emoji: '🥛', cal: 42  },
      { id: 'pa13', name: 'Coconut Milk',  emoji: '🥥', cal: 230 },
      { id: 'pa14', name: 'Bread',         emoji: '🍞', cal: 265 },
      { id: 'pa15', name: 'Ginger',        emoji: '🫚', cal: 80  },
      { id: 'pa16', name: 'Tomato Paste',  emoji: '🥫', cal: 82  },
      { id: 'pa17', name: 'Vinegar',       emoji: '🧴', cal: 3   },
      { id: 'pa18', name: 'Mustard',       emoji: '🟡', cal: 3   },
      { id: 'pa19', name: 'Oats',          emoji: '🥣', cal: 307 },
      { id: 'pa20', name: 'Breadcrumbs',   emoji: '🍞', cal: 395 },
      { id: 'pa21', name: 'Cornstarch',    emoji: '🫙', cal: 381 },
      { id: 'pa22', name: 'Tahini',        emoji: '🫙', cal: 89  },
      { id: 'pa23', name: 'Peanut Butter', emoji: '🥜', cal: 188 },
      { id: 'pa24', name: 'Sesame Oil',    emoji: '🫙', cal: 120 },
      { id: 'pa25', name: 'Fish Sauce',    emoji: '🧴', cal: 6   },
      { id: 'pa26', name: 'Worcestershire',emoji: '🧴', cal: 13  },
      { id: 'pa27', name: 'Sugar',         emoji: '🍬', cal: 387 },
      { id: 'pa28', name: 'Brown Sugar',   emoji: '🟤', cal: 380 },
      { id: 'pa29', name: 'Baking Powder', emoji: '🫙', cal: 2   },
      { id: 'pa30', name: 'Vegetable Broth',emoji:'🫙', cal: 12  },
    ],
  },

  {
    id: 'fruits',
    label: 'Fruits',
    emoji: '🍎',
    color: '#ec4899',
    items: [
      { id: 'f1',  name: 'Apple',       emoji: '🍎', cal: 95  },
      { id: 'f2',  name: 'Banana',      emoji: '🍌', cal: 89  },
      { id: 'f3',  name: 'Strawberry',  emoji: '🍓', cal: 49  },
      { id: 'f4',  name: 'Blueberry',   emoji: '🫐', cal: 57  },
      { id: 'f5',  name: 'Mango',       emoji: '🥭', cal: 99  },
      { id: 'f6',  name: 'Orange',      emoji: '🍊', cal: 62  },
      { id: 'f7',  name: 'Grapes',      emoji: '🍇', cal: 62  },
      { id: 'f8',  name: 'Pineapple',   emoji: '🍍', cal: 50  },
      { id: 'f9',  name: 'Watermelon',  emoji: '🍉', cal: 30  },
      { id: 'f10', name: 'Peach',       emoji: '🍑', cal: 59  },
      { id: 'f11', name: 'Pear',        emoji: '🍐', cal: 57  },
      { id: 'f12', name: 'Cherry',      emoji: '🍒', cal: 50  },
      { id: 'f13', name: 'Kiwi',        emoji: '🥝', cal: 42  },
      { id: 'f14', name: 'Raspberry',   emoji: '🍓', cal: 32  },
      { id: 'f15', name: 'Pomegranate', emoji: '🔴', cal: 83  },
      { id: 'f16', name: 'Papaya',      emoji: '🧡', cal: 43  },
      { id: 'f17', name: 'Lychee',      emoji: '🔴', cal: 66  },
      { id: 'f18', name: 'Coconut',     emoji: '🥥', cal: 283 },
      { id: 'f19', name: 'Lime',        emoji: '🍋', cal: 20  },
      { id: 'f20', name: 'Fig',         emoji: '🫐', cal: 74  },
    ],
  },

  {
    id: 'dairy',
    label: 'Dairy & Eggs',
    emoji: '🥛',
    color: '#60a5fa',
    items: [
      { id: 'd1',  name: 'Whole Milk',      emoji: '🥛', cal: 149 },
      { id: 'd2',  name: 'Skim Milk',       emoji: '🥛', cal: 86  },
      { id: 'd3',  name: 'Heavy Cream',     emoji: '🥛', cal: 414 },
      { id: 'd4',  name: 'Sour Cream',      emoji: '🥄', cal: 60  },
      { id: 'd5',  name: 'Cream Cheese',    emoji: '🧀', cal: 99  },
      { id: 'd6',  name: 'Cheddar Cheese',  emoji: '🧀', cal: 113 },
      { id: 'd7',  name: 'Mozzarella',      emoji: '🧀', cal: 85  },
      { id: 'd8',  name: 'Parmesan',        emoji: '🧀', cal: 111 },
      { id: 'd9',  name: 'Feta',            emoji: '🧀', cal: 75  },
      { id: 'd10', name: 'Brie',            emoji: '🧀', cal: 95  },
      { id: 'd11', name: 'Plain Yogurt',    emoji: '🥣', cal: 61  },
      { id: 'd12', name: 'Oat Milk',        emoji: '🥛', cal: 120 },
      { id: 'd13', name: 'Almond Milk',     emoji: '🥛', cal: 30  },
      { id: 'd14', name: 'Soy Milk',        emoji: '🥛', cal: 80  },
      { id: 'd15', name: 'Ghee',            emoji: '🧈', cal: 130 },
      { id: 'd16', name: 'Egg White',       emoji: '🥚', cal: 17  },
      { id: 'd17', name: 'Egg Yolk',        emoji: '🟡', cal: 55  },
      { id: 'd18', name: 'Ricotta',         emoji: '🧀', cal: 87  },
      { id: 'd19', name: 'Whipped Cream',   emoji: '🍦', cal: 51  },
      { id: 'd20', name: 'Condensed Milk',  emoji: '🥛', cal: 123 },
    ],
  },

  {
    id: 'grains',
    label: 'Grains & Baked',
    emoji: '🌾',
    color: '#d97706',
    items: [
      { id: 'g1',  name: 'White Rice',      emoji: '🍚', cal: 206 },
      { id: 'g2',  name: 'Brown Rice',      emoji: '🍚', cal: 216 },
      { id: 'g3',  name: 'Quinoa',          emoji: '🌾', cal: 222 },
      { id: 'g4',  name: 'Spaghetti',       emoji: '🍝', cal: 220 },
      { id: 'g5',  name: 'Penne',           emoji: '🍝', cal: 220 },
      { id: 'g6',  name: 'Sourdough',       emoji: '🍞', cal: 185 },
      { id: 'g7',  name: 'Whole Wheat Bread',emoji:'🍞', cal: 128 },
      { id: 'g8',  name: 'Bagel',           emoji: '🥯', cal: 245 },
      { id: 'g9',  name: 'Croissant',       emoji: '🥐', cal: 231 },
      { id: 'g10', name: 'Tortilla',        emoji: '🫓', cal: 146 },
      { id: 'g11', name: 'Naan',            emoji: '🫓', cal: 262 },
      { id: 'g12', name: 'Pita',            emoji: '🫓', cal: 165 },
      { id: 'g13', name: 'Cornmeal',        emoji: '🌽', cal: 442 },
      { id: 'g14', name: 'Barley',          emoji: '🌾', cal: 193 },
      { id: 'g15', name: 'Couscous',        emoji: '🍚', cal: 176 },
      { id: 'g16', name: 'Millet',          emoji: '🌾', cal: 207 },
      { id: 'g17', name: 'Buckwheat',       emoji: '🌾', cal: 155 },
      { id: 'g18', name: 'Granola',         emoji: '🥣', cal: 471 },
      { id: 'g19', name: 'Waffle',          emoji: '🧇', cal: 218 },
      { id: 'g20', name: 'Pancake',         emoji: '🥞', cal: 175 },
    ],
  },

  {
    id: 'beverages',
    label: 'Beverages',
    emoji: '☕',
    color: '#14b8a6',
    items: [
      { id: 'b1',  name: 'Water',           emoji: '💧', cal: 0   },
      { id: 'b2',  name: 'Black Coffee',    emoji: '☕', cal: 2   },
      { id: 'b3',  name: 'Latte',           emoji: '🥛', cal: 120 },
      { id: 'b4',  name: 'Espresso',        emoji: '☕', cal: 5   },
      { id: 'b5',  name: 'Green Tea',       emoji: '🍵', cal: 2   },
      { id: 'b6',  name: 'Black Tea',       emoji: '🍵', cal: 2   },
      { id: 'b7',  name: 'Orange Juice',    emoji: '🍊', cal: 112 },
      { id: 'b8',  name: 'Apple Juice',     emoji: '🍎', cal: 114 },
      { id: 'b9',  name: 'Smoothie',        emoji: '🥤', cal: 150 },
      { id: 'b10', name: 'Protein Shake',   emoji: '💪', cal: 200 },
      { id: 'b11', name: 'Energy Drink',    emoji: '⚡', cal: 110 },
      { id: 'b12', name: 'Cola',            emoji: '🥤', cal: 140 },
      { id: 'b13', name: 'Beer',            emoji: '🍺', cal: 153 },
      { id: 'b14', name: 'Red Wine',        emoji: '🍷', cal: 125 },
      { id: 'b15', name: 'Sparkling Water', emoji: '💧', cal: 0   },
      { id: 'b16', name: 'Kombucha',        emoji: '🍵', cal: 30  },
      { id: 'b17', name: 'Coconut Water',   emoji: '🥥', cal: 46  },
      { id: 'b18', name: 'Chocolate Milk',  emoji: '🥛', cal: 180 },
      { id: 'b19', name: 'Matcha Latte',    emoji: '🍵', cal: 90  },
      { id: 'b20', name: 'Oat Milk Coffee', emoji: '☕', cal: 100 },
    ],
  },

  {
    id: 'spices',
    label: 'Spices & Herbs',
    emoji: '🌿',
    color: '#84cc16',
    items: [
      { id: 's1',  name: 'Salt',            emoji: '🧂', cal: 0  },
      { id: 's2',  name: 'Black Pepper',    emoji: '⚫', cal: 6  },
      { id: 's3',  name: 'Cumin',           emoji: '🟤', cal: 8  },
      { id: 's4',  name: 'Turmeric',        emoji: '🟡', cal: 8  },
      { id: 's5',  name: 'Paprika',         emoji: '🔴', cal: 6  },
      { id: 's6',  name: 'Cinnamon',        emoji: '🟤', cal: 6  },
      { id: 's7',  name: 'Oregano',         emoji: '🌿', cal: 5  },
      { id: 's8',  name: 'Thyme',           emoji: '🌿', cal: 3  },
      { id: 's9',  name: 'Rosemary',        emoji: '🌿', cal: 3  },
      { id: 's10', name: 'Basil',           emoji: '🌿', cal: 1  },
      { id: 's11', name: 'Coriander',       emoji: '🌿', cal: 5  },
      { id: 's12', name: 'Cayenne',         emoji: '🌶️', cal: 6  },
      { id: 's13', name: 'Garlic Powder',   emoji: '🧄', cal: 9  },
      { id: 's14', name: 'Onion Powder',    emoji: '🧅', cal: 8  },
      { id: 's15', name: 'Bay Leaves',      emoji: '🍃', cal: 2  },
      { id: 's16', name: 'Cardamom',        emoji: '🌿', cal: 6  },
      { id: 's17', name: 'Cloves',          emoji: '🟤', cal: 7  },
      { id: 's18', name: 'Nutmeg',          emoji: '🟤', cal: 12 },
      { id: 's19', name: 'Vanilla Extract', emoji: '🫙', cal: 12 },
      { id: 's20', name: 'Smoked Paprika',  emoji: '🔴', cal: 6  },
      { id: 's21', name: "Za'atar",         emoji: '🌿', cal: 8  },
      { id: 's22', name: 'Curry Powder',    emoji: '🟡', cal: 7  },
      { id: 's23', name: 'Garam Masala',    emoji: '🟤', cal: 8  },
      { id: 's24', name: 'Chili Flakes',    emoji: '🌶️', cal: 6  },
      { id: 's25', name: 'Dill',            emoji: '🌿', cal: 1  },
      { id: 's26', name: 'Mint',            emoji: '🌿', cal: 1  },
      { id: 's27', name: 'Tarragon',        emoji: '🌿', cal: 2  },
      { id: 's28', name: 'Star Anise',      emoji: '⭐', cal: 7  },
    ],
  },

  {
    id: 'snacks',
    label: 'Snacks & Sweets',
    emoji: '🍫',
    color: '#f43f5e',
    items: [
      { id: 'sn1',  name: 'Dark Chocolate', emoji: '🍫', cal: 170 },
      { id: 'sn2',  name: 'Milk Chocolate', emoji: '🍫', cal: 150 },
      { id: 'sn3',  name: 'Potato Chips',   emoji: '🥔', cal: 152 },
      { id: 'sn4',  name: 'Popcorn',        emoji: '🍿', cal: 31  },
      { id: 'sn5',  name: 'Crackers',       emoji: '🟫', cal: 137 },
      { id: 'sn6',  name: 'Almonds',        emoji: '🥜', cal: 164 },
      { id: 'sn7',  name: 'Cashews',        emoji: '🥜', cal: 157 },
      { id: 'sn8',  name: 'Walnuts',        emoji: '🥜', cal: 185 },
      { id: 'sn9',  name: 'Trail Mix',      emoji: '🥜', cal: 131 },
      { id: 'sn10', name: 'Granola Bar',    emoji: '🍫', cal: 190 },
      { id: 'sn11', name: 'Donut',          emoji: '🍩', cal: 253 },
      { id: 'sn12', name: 'Cookie',         emoji: '🍪', cal: 148 },
      { id: 'sn13', name: 'Brownie',        emoji: '🍫', cal: 112 },
      { id: 'sn14', name: 'Muffin',         emoji: '🧁', cal: 340 },
      { id: 'sn15', name: 'Cupcake',        emoji: '🧁', cal: 305 },
      { id: 'sn16', name: 'Ice Cream',      emoji: '🍦', cal: 137 },
      { id: 'sn17', name: 'Gummy Bears',    emoji: '🐻', cal: 143 },
      { id: 'sn18', name: 'Rice Cakes',     emoji: '⬜', cal: 35  },
      { id: 'sn19', name: 'Protein Bar',    emoji: '💪', cal: 200 },
      { id: 'sn20', name: 'Hummus',         emoji: '🥙', cal: 70  },
      { id: 'sn21', name: 'Nachos',         emoji: '🧀', cal: 290 },
      { id: 'sn22', name: 'Pretzels',       emoji: '🥨', cal: 108 },
      { id: 'sn23', name: 'Peanuts',        emoji: '🥜', cal: 166 },
      { id: 'sn24', name: 'Sunflower Seeds',emoji: '🌻', cal: 165 },
    ],
  },
];

const VIBES = ['Safe'];

type Item = {
  id: string;
  name: string;
  emoji: string;
  cal: number;
};

type CartItem = Item & { qty: number };

type VideoResult = {
  videoId: string;
  title: string;
  thumbnail: string;
};

// ─── Particle ────────────────────────────────────────────────────────────────

function Particle({
  emoji, startX, startY, endX, endY, onDone,
}: {
  emoji: string; startX: number; startY: number; endX: number; endY: number; onDone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dx = endX - startX;
    const dy = endY - startY;

    const anim = el.animate(
      [
        { transform: 'translate(0px, 0px) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.2 - 80}px) scale(1.4) rotate(15deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3) rotate(30deg)`, opacity: 0 },
      ],
      { duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' }
    );
    anim.onfinish = onDone;
    // Cleanup if unmounted
    return () => anim.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vibe, setVibe] = useState(0);
  const [particles, setParticles] = useState<
    { id: number; emoji: string; sx: number; sy: number; ex: number; ey: number }[]
  >([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const cartRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);
  const generationRef = useRef<HTMLDivElement>(null);

  // Recipe generation state
  const [recipeText, setRecipeText] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);


  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetch from MongoDB Atlas
    const timer = setTimeout(() => setIsAppLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // ── Filtered items based on search ──────────────────────────────────────────
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return currentCategory?.items ?? [];
    const q = searchQuery.toLowerCase();
    return currentCategory?.items.filter(item =>
      item.name.toLowerCase().includes(q)
    ) ?? [];
  }, [currentCategory, searchQuery]);

  // Also support searching across ALL categories when no category selected
  const globalSearchResults = React.useMemo(() => {
    if (!searchQuery.trim() || activeCategory) return [];
    const q = searchQuery.toLowerCase();
    const results: (Item & { categoryColor: string; categoryLabel: string })[] = [];
    for (const cat of CATEGORIES) {
      for (const item of cat.items) {
        if (item.name.toLowerCase().includes(q)) {
          results.push({ ...item, categoryColor: cat.color, categoryLabel: cat.label });
        }
      }
    }
    return results;
  }, [searchQuery, activeCategory]);

  // ── Particle launcher ────────────────────────────────────────────────────────
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

  const handleItemClick = (item: Item, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    launchParticle(item.emoji, rect);
    addRipple(e.clientX, e.clientY);

    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart(prev => {
      const item = prev.find(c => c.id === id);
      if (!item) return prev;
      if (item.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter(c => c.id !== id);
    });

  const increaseQty = (id: string) =>
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c));

  const totalCal = cart.reduce((sum, c) => sum + c.cal * c.qty, 0);
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const vibeColor = vibe === 0 ? '#22c55e' : vibe === 1 ? '#f97316' : '#ec4899';
  const vibeLabel = VIBES[vibe];

  // Format recipe text by removing markdown and detecting sections
  const formatRecipeText = (text: string) => {
    const formatted: Array<{ type: 'header' | 'list' | 'text'; content: string }> = [];
    const lines = text.split('\n');
    
    for (let line of lines) {
      let cleaned = line.trim();
      if (!cleaned) continue;
      
      // Remove markdown bold/italic
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
      
      // Detect headers
      if (
        /^(Recipe Name|Ingredients|Instructions|Steps|Tips and Variations|Notes|Nutrition|Servings)/i.test(cleaned)
      ) {
        formatted.push({ type: 'header', content: cleaned });
      }
      // Detect list items
      else if (/^[-•*]\s/.test(cleaned)) {
        cleaned = cleaned.replace(/^[-•*]\s/, '');
        formatted.push({ type: 'list', content: cleaned });
      }
      else {
        formatted.push({ type: 'text', content: cleaned });
      }
    }
    
    return formatted;
  };

  // ── Recipe generation ────────────────────────────────────────────────────────
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
        body: JSON.stringify({ ingredients, vibe: vibeLabel }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGenError(data?.error || 'Failed to generate recipe. Please try again.');
        return;
      }

      setRecipeText(data.recipe ?? JSON.stringify(data));

      // Scroll to recipe section
      setTimeout(() => {
        generationRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 200);

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
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'Network error. Please try again.');
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
          videos: videos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Save error:', data.error);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  }

  // ── Handle category toggle + clear search ───────────────────────────────────
  const handleCategoryClick = (catId: string) => {
    setActiveCategory(prev => {
      if (prev === catId) {
        setSearchQuery('');
        return null;
      }
      setSearchQuery('');
      return catId;
    });
  };

  // ── Determine what items to show ─────────────────────────────────────────────
  const showGlobalSearch = !activeCategory && searchQuery.trim().length > 0;

  return (
    <>
    <LoadingScreen isVisible={isAppLoading || generating} />
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

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={activeCategory
                ? `Search in ${currentCategory?.label ?? ''}…`
                : 'Search all ingredients…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className={styles.tabs}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
                style={{ '--cat-color': cat.color } as React.CSSProperties}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <span className={styles.tabEmoji}>{cat.emoji}</span>
                <span>{cat.label}</span>
                {activeCategory === cat.id && <span className={styles.tabArrow}>▾</span>}
              </button>
            ))}
          </div>

          {/* Item grid */}
          <div className={`${styles.itemGrid} ${(currentCategory || showGlobalSearch) ? styles.itemGridVisible : ''}`}>

            {/* Global search results (no category selected) */}
            {showGlobalSearch ? (
              <>
                <div className={styles.categoryBanner} style={{ '--cat-color': '#94a3b8' } as React.CSSProperties}>
                  <span>🔎</span>
                  <span>Search Results</span>
                  <span className={styles.categoryCount}>{globalSearchResults.length} found</span>
                </div>
                {globalSearchResults.length > 0 ? (
                  <div className={styles.itemsWrap}>
                    {globalSearchResults.map((item, i) => {
                      const inCart = cart.find(c => c.id === item.id);
                      return (
                        <button
                          key={item.id}
                          className={`${styles.item} ${inCart ? styles.itemInCart : ''}`}
                          style={{
                            animationDelay: `${i * 0.04}s`,
                            '--cat-color': item.categoryColor,
                          } as React.CSSProperties}
                          onClick={(e) => handleItemClick(item, e)}
                        >
                          <div className={styles.itemEmoji}>{item.emoji}</div>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemCal}>{item.cal} kcal</div>
                          <div className={styles.itemCatLabel} style={{ color: item.categoryColor }}>
                            {item.categoryLabel}
                          </div>
                          {inCart && (
                            <div className={styles.itemBadge} style={{ background: item.categoryColor }}>
                              {inCart.qty}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyEmoji}>🤷</div>
                    <p>No ingredients match &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                )}
              </>
            ) : currentCategory ? (
              <>
                <div
                  className={styles.categoryBanner}
                  style={{ '--cat-color': currentCategory.color } as React.CSSProperties}
                >
                  <span>{currentCategory.emoji}</span>
                  <span>{currentCategory.label}</span>
                  <span className={styles.categoryCount}>
                    {searchQuery ? `${filteredItems.length} / ` : ''}{currentCategory.items.length} items
                  </span>
                </div>
                {filteredItems.length > 0 ? (
                  <div className={styles.itemsWrap}>
                    {filteredItems.map((item, i) => {
                      const inCart = cart.find(c => c.id === item.id);
                      return (
                        <button
                          key={item.id}
                          className={`${styles.item} ${inCart ? styles.itemInCart : ''}`}
                          style={{
                            animationDelay: `${i * 0.05}s`,
                            '--cat-color': currentCategory.color,
                          } as React.CSSProperties}
                          onClick={(e) => handleItemClick(item, e)}
                        >
                          <div className={styles.itemEmoji}>{item.emoji}</div>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemCal}>{item.cal} kcal</div>
                          {inCart && (
                            <div
                              className={styles.itemBadge}
                              style={{ background: currentCategory.color }}
                            >
                              {inCart.qty}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyEmoji}>🔍</div>
                    <p>No results for &ldquo;{searchQuery}&rdquo; in {currentCategory.label}</p>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyEmoji}>👆</div>
                <p>Select a category or search to browse ingredients</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cooking Pot / Cart ── */}
        <div className={styles.pot} ref={cartRef}>
          <div className={styles.potHeader}>
            <div className={styles.potIcon}>🫕</div>
            <div>
              <h2 className={styles.potTitle}>Cooking Pot</h2>
              <p className={styles.potSub}>
                {cart.length === 0
                  ? 'Empty — add ingredients!'
                  : `${totalItems} item${totalItems !== 1 ? 's' : ''} · ${totalCal} kcal`}
              </p>
            </div>
          </div>

          {/* Vibe selector */}
          <div className={styles.vibeSection}>
            <div className={styles.vibeHeader}>
              <span className={styles.vibeLabel}>Cooking Vibe</span>
              <span className={styles.vibeValue} style={{ color: vibeColor }}>{vibeLabel}</span>
            </div>
            <div className={styles.vibePills}>
              {VIBES.map((v, i) => (
                <button
                  key={v}
                  className={`${styles.vibePill} ${vibe === i ? styles.vibePillActive : ''}`}
                  style={{ '--vibe-col': (i === 0 ? '#22c55e' : i === 1 ? '#f97316' : '#ec4899') } as React.CSSProperties}
                  onClick={() => setVibe(i)}
                >
                  {i === 0 ? '🍽️' : i === 1 ? '🔬' : '🚀'} {v}
                </button>
              ))}
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
                    <button className={styles.qtyBtn} onClick={() => increaseQty(item.id)}>+</button>
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

              {genError && (
                <div className={styles.errorBanner}>
                  ⚠️ {genError}
                </div>
              )}

              <button
                className={styles.cookBtn}
                style={{ '--vibe-color': vibeColor } as React.CSSProperties}
                onClick={generateRecipe}
                disabled={generating}
              >
                <span>{generating ? 'Generating…' : `Cook with ${vibeLabel} Mode`}</span>
                <span>{vibe === 0 ? '🍽️' : vibe === 1 ? '🔬' : '🚀'}</span>
              </button>

              <button className={styles.clearBtn} onClick={() => {
                setCart([]);
                setRecipeText(null);
                setGenError(null);
                setVideos([]);
              }}>
                Clear Pot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── LLM + YouTube Generation Section ── */}
      {(recipeText || generating) && (
        <div ref={generationRef} className={styles.generationWrapper}>
          <div className={styles.recipeCard}>
            <div className={styles.recipeHeader}>
              <h2 className={styles.glowText}>GENERATED_RECIPE.exe</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  onClick={saveRecipe} 
                  className={`${styles.saveBtnSmall} ${saveSuccess ? styles.saveBtnSuccess : ''}`}
                  disabled={saving || saveSuccess}
                  title="Save to Dashboard"
                  style={{ fontSize: '1rem', padding: '0.4rem 0.6rem' }}
                >
                  {saving ? '💾' : saveSuccess ? '✓ Saved' : '💾'}
                </button>
                <button
                  onClick={() => { setRecipeText(null); setVideos([]); setGenError(null); }}
                  className={styles.closeBtn}
                >
                  ×
                </button>
              </div>
            </div>

            {generating ? (
              <div className={styles.loadingPulse}>
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
                <span>Analyzing ingredients &amp; crafting recipe…</span>
              </div>
            ) : (
              <div className={styles.recipeContent}>
                <div className={styles.recipeBody}>
                  {formatRecipeText(recipeText || '').map((item, idx) => {
                    if (item.type === 'header') {
                      return (
                        <h4 key={idx} className={styles.recipeHeaderText}>
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
          </div>

          {/* YouTube Recommendations */}
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
        </div>
      )}

      {genError && (
        <div className={styles.genError}>{genError}</div>
      )}
    </div>
    </>
   
  );
}
'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './community.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ingredient { name: string; emoji: string; calories: number }
interface Comment {
  _id: string;
  authorId: string;
  text: string;
  createdAt: string;
  likes: string[];
}
interface Recipe {
  _id: string;
  recipeName: string;
  vibe: string;
  totalCalories: number;
  ingredients: Ingredient[];
  instructions?: string;
  likes: string[];
  likesCount: number;
  createdAt: string;
  authorId?: string;
  authorName?: string;
  parentRecipeId?: string;
  imageUrl?: string;
  comments?: Comment[];
  commentCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VIBES = ['all', 'cozy', 'spicy', 'fresh', 'hearty', 'quick', 'fancy', 'vegan', 'keto'];
const VIBE_EMOJIS: Record<string, string> = {
  all:    '✦ All Recipes',
  cozy:   '🍵 Comfort Food',
  spicy:  '🌶️ Spicy Food',
  fresh:  '🌿 Fresh & Light',
  hearty: '🥩 Filling Meals',
  quick:  '⚡ Quick Meals',
  fancy:  '✨ Special Dishes',
  vegan:  '🌱 Vegan Food',
  keto:   '🥑 Keto Diet',
};
const SORTS = [
  { value: 'newest',        label: '🕐 NEW'   },
  { value: 'popular',       label: '🔥 HOT'   },
  { value: 'calories_low',  label: '🥗 LIGHT' },
  { value: 'calories_high', label: '🍔 HEAVY' },
];

interface UserProfile { _id: string; username: string; email?: string }

const REACTIONS = ['❤️', '🔥', '😍', '👏', '🤤', '⭐'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function parseInstructions(instructions: string): { isSteps: boolean; content?: string; steps?: string[] } {
  const lines = instructions.split('\n').map(line => line.trim()).filter(line => line);
  const steps: string[] = [];
  let hasNumberedSteps = false;

  for (const line of lines) {
    if (/^\d+[\.\)]\s/.test(line)) {
      hasNumberedSteps = true;
      steps.push(line.replace(/^\d+[\.\)]\s/, '').trim());
    } else if (hasNumberedSteps) {
      steps.push(line);
    } else {
      return { isSteps: false, content: instructions };
    }
  }

  return { isSteps: hasNumberedSteps, steps };
}

// ─── Floating Heart ───────────────────────────────────────────────────────────
function FloatingHeart({ id, x, y, emoji, onDone }: { id: number; x: number; y: number; emoji: string; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 900);
    return () => clearTimeout(t);
  }, [id, onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        fontSize: '1.5rem',
        animation: 'floatUp 0.9s ease-out forwards',
        userSelect: 'none',
      }}
    >
      {emoji}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`${styles.toast} ${visible ? styles.toastVisible : ''}`}>
      {message}
    </div>
  );
}

// ─── Live Activity Ticker ─────────────────────────────────────────────────────
const ACTIVITY_FEED = [
  '🍳 @chef_marco just posted Truffle Pasta',
  '❤️ @yumi liked Miso Glazed Salmon',
  '🍴 @dev_cook forked Spicy Ramen',
  '💬 @foodlover commented on Avocado Toast',
  '🔥 @hungry_hacker posted Late Night Tacos',
  '⭐ @zen_kitchen liked Tofu Stir Fry',
];

function ActivityTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % ACTIVITY_FEED.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.activityTicker}>
      <span className={styles.tickerDot} />
      <span className={`${styles.tickerText} ${visible ? styles.tickerVisible : styles.tickerHidden}`}>
        {ACTIVITY_FEED[idx]}
      </span>
    </div>
  );
}

// ─── Like Button ──────────────────────────────────────────────────────────────
function LikeButton({ recipeId, count, liked, onLike }: {
  recipeId: string;
  count: number;
  liked: boolean;
  onLike: (id: string, e: React.MouseEvent) => void;
}) {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
    onLike(recipeId, e);
  };

  return (
    <button
      className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ''} ${animating ? styles.likeBtnPop : ''}`}
      onClick={handleClick}
      title={liked ? 'unlike' : 'like'}
    >
      <span className={styles.likeHeart}>{liked ? '❤️' : '🤍'}</span>
      <span className={styles.likeCount}>{count}</span>
    </button>
  );
}

// ─── Reaction Bar ─────────────────────────────────────────────────────────────
function ReactionBar({ recipeId }: { recipeId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({
    '❤️': 0, '🔥': 0, '😍': 0, '👏': 0, '🤤': 0, '⭐': 0
  });
  const [open, setOpen] = useState(false);

  const pick = (emoji: string) => {
    if (selected === emoji) {
      setCounts(c => ({ ...c, [emoji]: Math.max(0, c[emoji] - 1) }));
      setSelected(null);
    } else {
      if (selected) setCounts(c => ({ ...c, [selected]: Math.max(0, c[selected] - 1) }));
      setCounts(c => ({ ...c, [emoji]: c[emoji] + 1 }));
      setSelected(emoji);
    }
    setOpen(false);
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const topReactions = Object.entries(counts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className={styles.reactionWrap}>
      <button className={styles.reactionToggle} onClick={() => setOpen(o => !o)}>
        {selected || '😶'} {total > 0 ? total : 'react'}
      </button>
      {topReactions.length > 0 && (
        <span className={styles.topReactions}>
          {topReactions.map(([emoji]) => emoji).join('')}
        </span>
      )}
      {open && (
        <div className={styles.reactionPicker}>
          {REACTIONS.map(r => (
            <button
              key={r}
              className={`${styles.reactionPickerBtn} ${selected === r ? styles.reactionPickerActive : ''}`}
              onClick={() => pick(r)}
              title={r}
            >
              {r}
              {counts[r] > 0 && <span className={styles.reactionPickerCount}>{counts[r]}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────────
function CommentSection({ recipeId, comments, onAddComment }: {
  recipeId: string;
  comments: Comment[];
  onAddComment: (recipeId: string, text: string) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await onAddComment(recipeId, text.trim());
    setText('');
    setSubmitting(false);
  };

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentInputRow}>
        <div className={styles.commentAvatar}>👤</div>
        <input
          className={styles.commentInput}
          placeholder="add a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <button className={styles.commentSubmit} onClick={submit} disabled={submitting || !text.trim()}>
          {submitting ? '...' : '↵'}
        </button>
      </div>
      {comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map(c => (
            <div key={c._id} className={styles.commentItem}>
              <span className={styles.commentAuthor}>@{c.authorId}</span>
              <span className={styles.commentText}>{c.text}</span>
              <span className={styles.commentTime}>{timeAgo(c.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Fork Modal ───────────────────────────────────────────────────────────────
function ForkModal({ recipe, onConfirm, onClose, loading }: {
  recipe: Recipe;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.forkModal} onClick={e => e.stopPropagation()}>
        <div className={styles.forkIconBig}>🍴</div>
        <h3 className={styles.forkTitle}>FORK THIS RECIPE?</h3>
        <p className={styles.forkDesc}>
          Clone <strong>"{recipe.recipeName}"</strong> into your private kitchen.
          Remix it however you want — it won't affect the original.
        </p>
        <div className={styles.forkActions}>
          <button className={styles.cancelBtn} onClick={onClose}>CANCEL</button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? 'FORKING...' : 'FORK IT →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ recipe, likedIds, onLike, onFork, onComment, isNew }: {
  recipe: Recipe;
  likedIds: Set<string>;
  onLike: (id: string, e: React.MouseEvent) => void;
  onFork: (r: Recipe) => void;
  onComment: (recipeId: string, text: string) => Promise<void>;
  isNew?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const liked = likedIds.has(recipe._id);
  const comments = recipe.comments || [];

  // Sync expanded state when isNew becomes true (new post just submitted)
  useEffect(() => {
    if (isNew) setExpanded(true);
  }, [isNew]);

  return (
    <article className={`${styles.postCard} ${isNew ? styles.postCardNew : ''}`}>
      <div className={styles.postBody}>
        {/* Post header */}
        <div className={styles.postMeta}>
          <span className={styles.vibePill}>
            {VIBE_EMOJIS[recipe.vibe] || '✦'} {recipe.vibe}
          </span>
          {recipe.parentRecipeId && <span className={styles.forkedPill}>🍴 forked</span>}
          <span className={styles.postAuthor}>
            <span className={styles.avatarDot} />
            <strong>@{recipe.authorName || recipe.authorId || 'anonymous'}</strong>
          </span>
          <span className={styles.postTime}>{timeAgo(recipe.createdAt)}</span>
          <button
            className={`${styles.bookmarkBtn} ${bookmarked ? styles.bookmarkActive : ''}`}
            onClick={() => setBookmarked(b => !b)}
            title={bookmarked ? 'saved' : 'save'}
          >
            {bookmarked ? '🔖' : '📄'}
          </button>
        </div>

        {/* Title */}
        <h2 className={styles.postTitle}>{recipe.recipeName}</h2>

        {/* Ingredient emoji row */}
        <div className={styles.ingredientRow}>
          {recipe.ingredients.map((ing, i) => (
            <span key={i} className={styles.ingEmojiBig} title={ing.name}>{ing.emoji}</span>
          ))}
        </div>

        {/* Instructions — slide down when isNew, collapsible otherwise */}
        {recipe.instructions && (
          <div className={`${styles.instructionsWrap} ${isNew ? styles.instructionsWrapNew : ''}`}>
            {isNew && (
              <div className={styles.newInstructionsBadge}>
                📋 preparation process
              </div>
            )}
            {(() => {
              const parsed = parseInstructions(recipe.instructions);
              if (parsed.isSteps && parsed.steps) {
                return (
                  <ol className={`${styles.instructionsSteps} ${expanded ? styles.instructionsStepsExpanded : ''} ${isNew ? styles.instructionsStepsNew : ''}`}>
                    {parsed.steps.map((step, index) => (
                      <li key={index} className={styles.stepItem}>
                        {step}
                      </li>
                    ))}
                  </ol>
                );
              } else {
                return (
                  <p className={`${styles.instructionsText} ${expanded ? styles.instructionsExpanded : ''} ${isNew ? styles.instructionsTextNew : ''}`}>
                    {parsed.content || recipe.instructions}
                  </p>
                );
              }
            })()}
            {!isNew && (
              <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
                {expanded ? '▲ collapse' : '▼ read more'}
              </button>
            )}
          </div>
        )}

        {/* Ingredients detail */}
        <div className={styles.ingredientChips}>
          {recipe.ingredients.map((ing, i) => (
            <span key={i} className={styles.ingChip}>
              {ing.emoji} {ing.name}
              {ing.calories > 0 && <em>{ing.calories}cal</em>}
            </span>
          ))}
        </div>

        {/* Action bar */}
        <div className={styles.actionBar}>
          <LikeButton
            recipeId={recipe._id}
            count={recipe.likesCount}
            liked={liked}
            onLike={onLike}
          />

          <button
            className={styles.actionBarBtn}
            onClick={() => setShowComments(s => !s)}
          >
            💬 <span>{comments.length + (recipe.commentCount || 0)}</span>
          </button>

          <ReactionBar recipeId={recipe._id} />

          <button className={styles.actionBarBtn} onClick={() => onFork(recipe)}>
            🍴 fork
          </button>
          <button className={styles.actionBarBtn} onClick={() => {
            navigator.clipboard?.writeText(window.location.href + '#' + recipe._id);
          }}>
            🔗
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <CommentSection
            recipeId={recipe._id}
            comments={comments}
            onAddComment={onComment}
          />
        )}
      </div>
    </article>
  );
}

// ─── New Post Modal ───────────────────────────────────────────────────────────
function NewPostModal({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (data: { recipeName: string; vibe: string; instructions: string }) => Promise<void>;
  loading: boolean;
}) {
  const [recipeName, setRecipeName] = useState('');
  const [vibe, setVibe] = useState('cozy');
  const [instructions, setInstructions] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    if (!recipeName.trim()) return;
    await onSubmit({ recipeName: recipeName.trim(), vibe, instructions: instructions.trim() });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.newPostModal} onClick={e => e.stopPropagation()}>
        <div className={styles.newPostHeader}>
          <h2 className={styles.newPostTitle}>📝 POST YOUR DISH</h2>
          <button className={styles.modalCloseX} onClick={onClose}>✕</button>
        </div>

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          {[1, 2].map(s => (
            <button key={s} className={`${styles.stepDot} ${step === s ? styles.stepDotActive : step > s ? styles.stepDotDone : ''}`} onClick={() => setStep(s)}>
              {step > s ? '✓' : s}
            </button>
          ))}
          <div className={styles.stepLine} />
        </div>

        {step === 1 && (
          <>
            <label className={styles.fieldLabel}>RECIPE NAME</label>
            <input
              className={styles.fieldInput}
              placeholder="e.g. Midnight Ramen with Soft Egg"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              autoFocus
            />
            <label className={styles.fieldLabel}>VIBE</label>
            <div className={styles.vibeSelect}>
              {VIBES.filter(v => v !== 'all').map(v => (
                <button
                  key={v}
                  className={`${styles.vibeSelectBtn} ${vibe === v ? styles.vibeSelectActive : ''}`}
                  onClick={() => setVibe(v)}
                >
                  {VIBE_EMOJIS[v]} {v}
                </button>
              ))}
            </div>
            <div className={styles.newPostActions}>
              <button className={styles.cancelBtn} onClick={onClose}>CANCEL</button>
              <button className={styles.confirmBtn} onClick={() => setStep(2)} disabled={!recipeName.trim()}>
                NEXT →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className={styles.fieldLabel}>INSTRUCTIONS / NOTES</label>
            <textarea
              className={styles.fieldTextarea}
              placeholder="Tell the community how you made it..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={6}
              autoFocus
            />
            <div className={styles.newPostActions}>
              <button className={styles.cancelBtn} onClick={() => setStep(1)}>← BACK</button>
              <button
                className={styles.confirmBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'POSTING...' : 'POST TO COMMUNITY →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Trending Tags ────────────────────────────────────────────────────────────
function TrendingTags({ onSelect }: { onSelect: (tag: string) => void }) {
  const tags = ['#pasta', '#onepot', '#under30min', '#nooven', '#highprotein', '#mealprep', '#comfort'];
  return (
    <div className={styles.sideCard}>
      <h3 className={styles.sideCardTitle}>TRENDING TAGS</h3>
      <div className={styles.trendingTags}>
        {tags.map(tag => (
          <button key={tag} className={styles.trendingTag} onClick={() => onSelect(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityKitchen() {
  const [recipes, setRecipes]         = useState<Recipe[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(false);

  const [search, setSearch]           = useState('');
  const [activeVibe, setActiveVibe]   = useState('all');
  const [sort, setSort]               = useState('popular');
  const [page, setPage]               = useState(1);

  const [likedIds, setLikedIds]       = useState<Set<string>>(new Set());
  const [forkTarget, setForkTarget]   = useState<Recipe | null>(null);
  const [forkLoading, setForkLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Track which recipe IDs were just posted (for slide-down animation)
  const [newRecipeIds, setNewRecipeIds] = useState<Set<string>>(new Set());

  const [toast, setToast]             = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Floating hearts
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const heartId = useRef(0);

  const removeHeart = useCallback((id: number) => {
    setHearts(prev => prev.filter(h => h.id !== id));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams({
        search, vibe: activeVibe, sort,
        limit: '20', page: String(page),
      });
      const res  = await fetch(`/api/community?${params}`);
      const data = await res.json();
      setRecipes(data.recipes || []);
      setTotal(data.total || 0);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [search, activeVibe, sort, page]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);
  useEffect(() => { setPage(1); }, [search, activeVibe, sort]);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/users/me');
        const json = await res.json();
        if (json?.user) {
          setCurrentUser({ _id: json.user._id, username: json.user.username, email: json.user.email });
        }
      } catch (err) {
        console.warn('Unable to fetch current user for community', err);
      }
    }
    loadUser();
  }, []);

  const getCurrentUserId = () => currentUser?._id || '';

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  // ── Like (with floating heart) ────────────────────────────────────────────
  const handleLike = async (recipeId: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const emoji = likedIds.has(recipeId) ? '💔' : '❤️';
    setHearts(prev => [...prev, { id: ++heartId.current, x: rect.left + rect.width / 2, y: rect.top, emoji }]);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        showToast('⚠ login required');
        setHearts(prev => prev.filter(h => h.id !== heartId.current));
        return;
      }
      const res  = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', recipeId, userId }),
      });
      const data = await res.json();
      setLikedIds(prev => {
        const next = new Set(prev);
        data.liked ? next.add(recipeId) : next.delete(recipeId);
        return next;
      });
      setRecipes(prev =>
        prev.map(r => r._id === recipeId ? { ...r, likesCount: data.likesCount } : r)
      );
    } catch {
      showToast('❌ failed to like');
    }
  };

  // ── Comment ───────────────────────────────────────────────────────────────
  const handleComment = async (recipeId: string, text: string) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        showToast('⚠ login required');
        return;
      }
      const res  = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', recipeId, userId, text }),
      });
      const data = await res.json();
      if (data.comment) {
        setRecipes(prev => prev.map(r =>
          r._id === recipeId
            ? { ...r, comments: [...(r.comments || []), data.comment] }
            : r
        ));
        showToast('💬 comment posted!');
      }
    } catch {
      showToast('❌ comment failed');
    }
  };

  // ── Fork ──────────────────────────────────────────────────────────────────
  const handleForkConfirm = async () => {
    if (!forkTarget) return;
    setForkLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        showToast('⚠ login required');
        return;
      }
      const res  = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fork', recipeId: forkTarget._id, userId }),
      });
      const data = await res.json();
      if (data.forked) {
        showToast('🍴 forked to your kitchen!');
        setForkTarget(null);
      }
    } catch {
      showToast('❌ fork failed');
    } finally {
      setForkLoading(false);
    }
  };

  // ── New Post ──────────────────────────────────────────────────────────────
  const handleNewPost = async (data: { recipeName: string; vibe: string; instructions: string }) => {
    setPostLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        showToast('⚠ login required');
        setPostLoading(false);
        return;
      }

      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', userId, ...data }),
      });
      const result = await res.json();
      if (result.recipe) {
        setRecipes(prev => [{ ...result.recipe, authorName: currentUser?.username || 'anonymous' }, ...prev]);
        setTotal(t => t + 1);
        setShowNewPost(false);
        // Mark this recipe as newly posted → triggers slide-down animation
        setNewRecipeIds(prev => new Set(prev).add(result.recipe._id));
        showToast('🍽 posted to community!');
      }
    } catch {
      showToast('❌ post failed');
    } finally {
      setPostLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>
      <Toast message={toast} visible={toastVisible} />

      {/* Floating hearts */}
      {hearts.map(h => (
        <FloatingHeart key={h.id} {...h} onDone={removeHeart} />
      ))}

      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerLeft}>
            <div className={styles.bannerIcon}>🍳</div>
            <div>
              <h1 className={styles.bannerTitle}>r/community_kitchen</h1>
              <p className={styles.bannerSub}>
                {total.toLocaleString()} recipes shared · fork anything · cook everything
              </p>
            </div>
          </div>
          <div className={styles.bannerRight}>
            <ActivityTicker />
            <button className={styles.newPostBtn} onClick={() => setShowNewPost(true)}>
              + POST DISH
            </button>
          </div>
        </div>

        <div className={styles.statsBar}>
          <span className={styles.statItem}>🔥 {total} recipes</span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.statItem}>🍴 fork any recipe</span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.statItem}>💬 comment & discuss</span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.statItem}>❤️ like what you love</span>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>ABOUT</h3>
            <p className={styles.sideCardText}>
              A community for sharing vibe-cooked recipes. Browse, fork, remix, and discuss.
            </p>
            <button className={styles.newPostBtnSide} onClick={() => setShowNewPost(true)}>
              + CREATE POST
            </button>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>FILTER BY VIBE</h3>
            <div className={styles.sideVibes}>
              {VIBES.map(v => (
                <button
                  key={v}
                  className={`${styles.sideVibeBtn} ${activeVibe === v ? styles.sideVibeBtnActive : ''}`}
                  onClick={() => setActiveVibe(v)}
                >
                  <span>{VIBE_EMOJIS[v] || '#'}</span>
                  {v === 'all' ? 'all' : v}
                </button>
              ))}
            </div>
          </div>

          <TrendingTags onSelect={tag => setSearch(tag.replace('#', ''))} />

          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>RULES</h3>
            <ol className={styles.rulesList}>
              <li>Be kind to fellow cooks</li>
              <li>Credit forks properly</li>
              <li>No spam recipes</li>
              <li>Share vibes, not hate</li>
            </ol>
          </div>
        </aside>

        {/* ── Feed ── */}
        <main className={styles.feed}>
          {/* Controls */}
          <div className={styles.feedControls}>
            <div className={styles.sortTabs}>
              {SORTS.map(s => (
                <button
                  key={s.value}
                  className={`${styles.sortTab} ${sort === s.value ? styles.sortTabActive : ''}`}
                  onClick={() => setSort(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className={styles.searchWrap}>
              <span className={styles.searchIconInline}>⌕</span>
              <input
                type="text"
                className={styles.searchInputInline}
                placeholder="search recipes, tags..."
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Error */}
          {fetchError && (
            <div className={styles.errorBanner}>
              ⚠ CONNECTION_FAILED
              <button className={styles.retryBtn} onClick={fetchRecipes}>RETRY</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && recipes.length === 0 && (
            <div className={styles.skeletonList}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} style={{ width: '30%' }} />
                    <div className={styles.skeletonLine} style={{ width: '70%', height: '1.1rem' }} />
                    <div className={styles.skeletonLine} style={{ width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !fetchError && recipes.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🍽</span>
              <p>NO_RECIPES_FOUND</p>
              <span className={styles.emptyHint}>try a different vibe or search term</span>
              <button className={styles.newPostBtn} onClick={() => setShowNewPost(true)}>
                be the first to post →
              </button>
            </div>
          )}

          {/* Posts */}
          <div className={styles.postList}>
            {recipes.map((recipe) => (
              <PostCard
                key={recipe._id}
                recipe={recipe}
                likedIds={likedIds}
                onLike={handleLike}
                onFork={setForkTarget}
                onComment={handleComment}
                isNew={newRecipeIds.has(recipe._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >← PREV</button>
              <span className={styles.pageInfo}>{page} / {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >NEXT →</button>
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {forkTarget && (
        <ForkModal
          recipe={forkTarget}
          onConfirm={handleForkConfirm}
          onClose={() => setForkTarget(null)}
          loading={forkLoading}
        />
      )}
      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={handleNewPost}
          loading={postLoading}
        />
      )}
    </div>
  );
}
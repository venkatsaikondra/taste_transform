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
  parentRecipeId?: string;
  imageUrl?: string;
  comments?: Comment[];
  commentCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VIBES = ['all', 'cozy', 'spicy', 'fresh', 'hearty', 'quick', 'fancy', 'vegan', 'keto'];
const SORTS = [
  { value: 'newest',        label: '🕐 NEW'     },
  { value: 'popular',       label: '🔥 HOT'     },
  { value: 'calories_low',  label: '🥗 LIGHT'   },
  { value: 'calories_high', label: '🍔 HEAVY'   },
];

const MOCK_USER_ID = 'user_demo_123';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`${styles.toast} ${visible ? styles.toastVisible : ''}`}>
      {message}
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
function PostCard({ recipe, likedIds, onLike, onFork, onComment }: {
  recipe: Recipe;
  likedIds: Set<string>;
  onLike: (id: string) => void;
  onFork: (r: Recipe) => void;
  onComment: (recipeId: string, text: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const liked = likedIds.has(recipe._id);
  const comments = recipe.comments || [];

  return (
    <article className={styles.postCard}>
      {/* Sidebar vote column */}
      <div className={styles.voteCol}>
        <button
          className={`${styles.voteBtn} ${liked ? styles.voteBtnActive : ''}`}
          onClick={() => onLike(recipe._id)}
          title={liked ? 'unlike' : 'like'}
        >
          ▲
        </button>
        <span className={`${styles.voteCount} ${liked ? styles.voteCountActive : ''}`}>
          {recipe.likesCount}
        </span>
        <button className={styles.voteBtn} style={{ opacity: 0.3 }}>▼</button>
      </div>

      {/* Main content */}
      <div className={styles.postBody}>
        {/* Post header */}
        <div className={styles.postMeta}>
          <span className={styles.vibePill}>{recipe.vibe}</span>
          {recipe.parentRecipeId && <span className={styles.forkedPill}>🍴 forked</span>}
          <span className={styles.postAuthor}>
            posted by <strong>@{recipe.authorId || 'anonymous'}</strong>
          </span>
          <span className={styles.postTime}>{timeAgo(recipe.createdAt)}</span>
          <span className={styles.calPill}>{recipe.totalCalories} kcal</span>
        </div>

        {/* Title */}
        <h2 className={styles.postTitle}>{recipe.recipeName}</h2>

        {/* Ingredient emoji row */}
        <div className={styles.ingredientRow}>
          {recipe.ingredients.map((ing, i) => (
            <span key={i} className={styles.ingEmojiBig} title={ing.name}>{ing.emoji}</span>
          ))}
        </div>

        {/* Expand/collapse instructions */}
        {recipe.instructions && (
          <div className={styles.instructionsWrap}>
            <p className={`${styles.instructionsText} ${expanded ? styles.instructionsExpanded : ''}`}>
              {recipe.instructions}
            </p>
            <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
              {expanded ? '▲ collapse' : '▼ read more'}
            </button>
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
          <button
            className={styles.actionBarBtn}
            onClick={() => setShowComments(s => !s)}
          >
            💬 {comments.length + (recipe.commentCount || 0)} comments
          </button>
          <button className={styles.actionBarBtn} onClick={() => onFork(recipe)}>
            🍴 fork
          </button>
          <button className={styles.actionBarBtn} onClick={() => {
            navigator.clipboard?.writeText(window.location.href + '#' + recipe._id);
          }}>
            🔗 share
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
        <p className={styles.newPostSubtitle}>Share what you cooked with the community</p>

        <label className={styles.fieldLabel}>RECIPE NAME</label>
        <input
          className={styles.fieldInput}
          placeholder="e.g. Midnight Ramen with Soft Egg"
          value={recipeName}
          onChange={e => setRecipeName(e.target.value)}
        />

        <label className={styles.fieldLabel}>VIBE</label>
        <div className={styles.vibeSelect}>
          {VIBES.filter(v => v !== 'all').map(v => (
            <button
              key={v}
              className={`${styles.vibeSelectBtn} ${vibe === v ? styles.vibeSelectActive : ''}`}
              onClick={() => setVibe(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <label className={styles.fieldLabel}>INSTRUCTIONS / NOTES</label>
        <textarea
          className={styles.fieldTextarea}
          placeholder="Tell the community how you made it..."
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          rows={5}
        />

        <div className={styles.newPostActions}>
          <button className={styles.cancelBtn} onClick={onClose}>CANCEL</button>
          <button
            className={styles.confirmBtn}
            onClick={handleSubmit}
            disabled={loading || !recipeName.trim()}
          >
            {loading ? 'POSTING...' : 'POST TO COMMUNITY →'}
          </button>
        </div>
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

  const [toast, setToast]             = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  // ── Like ──────────────────────────────────────────────────────────────────
  const handleLike = async (recipeId: string) => {
    try {
      const res  = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', recipeId, userId: MOCK_USER_ID }),
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
      showToast(data.liked ? '❤️ liked!' : '🤍 unliked');
    } catch {
      showToast('❌ failed to like');
    }
  };

  // ── Comment ───────────────────────────────────────────────────────────────
  const handleComment = async (recipeId: string, text: string) => {
    try {
      const res  = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', recipeId, userId: MOCK_USER_ID, text }),
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
      const res  = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fork', recipeId: forkTarget._id, userId: MOCK_USER_ID }),
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
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', userId: MOCK_USER_ID, ...data }),
      });
      const result = await res.json();
      if (result.recipe) {
        setRecipes(prev => [result.recipe, ...prev]);
        setTotal(t => t + 1);
        setShowNewPost(false);
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
          <button className={styles.newPostBtn} onClick={() => setShowNewPost(true)}>
            + POST DISH
          </button>
        </div>

        {/* Inline stats bar */}
        <div className={styles.statsBar}>
          <span className={styles.statItem}>🔥 {total} recipes</span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.statItem}>🍴 fork any recipe</span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.statItem}>💬 comment & discuss</span>
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
                  {v === 'all' ? '# all' : `# ${v}`}
                </button>
              ))}
            </div>
          </div>

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
                placeholder="search recipes..."
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
                  <div className={styles.skeletonVote} />
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
            {recipes.map((recipe, i) => (
              <PostCard
                key={recipe._id}
                recipe={recipe}
                likedIds={likedIds}
                onLike={handleLike}
                onFork={setForkTarget}
                onComment={handleComment}
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
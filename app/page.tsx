// app/page.tsx
'use client';

import { useMemo } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import ReviewForm from '../components/ReviewForm';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';



import ContactForm from '../components/ContactForm';
import QuestionForm from '../components/QuestionForm';
import ViewQuestions from '../components/ViewQuestions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export default function Home() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({});
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userType, setUserType] = useState('');
const [restaurant_info, setrestaurant_info] = useState<any | null>(null);

// ---------- Restaurant info (load from server) ----------
// const [restaurant_info, setrestaurant_info] = useState<any | null>(null);
const [restaurantLoading, setRestaurantLoading] = useState(true);
const [restaurantError, setRestaurantError] = useState<string | null>(null);

// ---------- Restaurant info (load from Supabase directly) ----------
useEffect(() => {
  let mounted = true;

  async function loadFromSupabase() {
    try {
      setRestaurantLoading(true);
      setRestaurantError(null);

      // Fetch the latest restaurant_info row (order by updated_at desc, limit 1)
      const { data, error, status } = await supabase
        .from('restaurant_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error && status !== 406) {
        // 406 can happen for empty result depending on settings; still handle it
        throw error;
      }

      if (mounted) {
        // If no rows, data will be [] — set null so UI falls back to placeholders
        const row = Array.isArray(data) && data.length ? data[0] : null;
        setrestaurant_info(row);
      }
    } catch (err: any) {
      console.error('Failed to load restaurant_info from Supabase:', err);
      if (mounted) setRestaurantError(err?.message ?? 'Failed to load restaurant info');
    } finally {
      if (mounted) setRestaurantLoading(false);
    }
  }

  loadFromSupabase();

  return () => {
    mounted = false;
  };
}, []); // run once on mount
// ---------------------------------------------------------


// ---------------------------------------------------------


  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New: filter state used for the review widgets on home
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // search state (home)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // ---------- Skeleton helpers (UI-only) ----------
  const SkeletonCategory = () => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full mb-3" />
      <div className="w-24 h-4 bg-gray-200 rounded-full" />
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="aspect-video bg-gray-200 rounded-md mb-4" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="flex justify-between items-center">
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
      </div>
    </div>
  );





const BUCKETNAME = 'menu-images'; // adjust if your bucket name differs

// resolve icon URLs for categories (memoized)
const categoryIconMap = useMemo(() => {
  const map: Record<string, string | null> = {};
  (categories || []).forEach((cat: any) => {
    const raw = (cat.icon ?? cat.icon_url ?? '') as string;
    if (!raw) {
      map[cat.id] = null;
      return;
    }
    // data URI or absolute URL -> use directly
    if (raw.startsWith('data:') || raw.startsWith('http://') || raw.startsWith('https://')) {
      map[cat.id] = raw;
      return;
    }
    // otherwise treat as storage path/filename inside BUCKETNAME
    let path = raw;
    if (path.startsWith(`${BUCKETNAME}/`)) path = path.replace(`${BUCKETNAME}/`, '');
    if (path.startsWith('/')) path = path.slice(1);
    try {
      const { data } = supabase.storage.from(BUCKETNAME).getPublicUrl(path);
      map[cat.id] = data?.publicUrl ?? null;
    } catch (err) {
      console.warn('getPublicUrl error for', path, err);
      map[cat.id] = null;
    }
  });
  return map;
}, [categories, supabase]);







  const SkeletonReview = () => (
    <div className="bg-gray-200 rounded-2xl h-40 p-4" />
  );
  // ---------- end skeleton helpers ----------

  // ---------- unified cart helpers ----------
  const saveCart = (cartObj: { [key: number]: number }) => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartObj));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
    setCartItems(cartObj);
  };

  const addToCart = (itemId: number, qty = 1) => {
    try {
      const currentCartRaw = localStorage.getItem('cartItems') || '{}';
      const currentCartObj = JSON.parse(currentCartRaw || '{}') as { [key: string]: number };
      const id = String(itemId);
      const currentQty = Number(currentCartObj[id] || 0);
      const updatedQty = currentQty + qty;
      const next = { ...currentCartObj, [id]: updatedQty };
      // normalize keys to numbers
      const normalized = Object.fromEntries(
        Object.entries(next).map(([k, v]) => [Number(k), v])
      ) as { [key: number]: number };
      saveCart(normalized);
    } catch (e) {
      console.warn('Error updating cart', e);
      // fallback to state-only update
      setCartItems(prev => {
        const next = { ...prev, [itemId]: (prev[itemId] || 0) + qty };
        try { localStorage.setItem('cartItems', JSON.stringify(next)); } catch {}
        return next;
      });
    }
  };

  const updateQuantity = (itemId: number, newQty: number) => {
    try {
      const currentCartRaw = localStorage.getItem('cartItems') || '{}';
      const currentCartObj = JSON.parse(currentCartRaw || '{}') as { [key: string]: number };
      const id = String(itemId);

      if (newQty <= 0) {
        const { [id]: _, ...rest } = currentCartObj;
        const normalized = Object.fromEntries(
          Object.entries(rest).map(([k, v]) => [Number(k), v])
        ) as { [key: number]: number };
        saveCart(normalized);
        return;
      }

      const next = { ...currentCartObj, [id]: newQty };
      const normalized = Object.fromEntries(
        Object.entries(next).map(([k, v]) => [Number(k), v])
      ) as { [key: number]: number };
      saveCart(normalized);
    } catch (e) {
      console.warn('Error updating cart quantity', e);
      setCartItems(prev => {
        if (newQty <= 0) {
          const { [itemId]: _, ...rest } = prev;
          try { localStorage.setItem('cartItems', JSON.stringify(rest)); } catch {}
          return rest;
        }
        const next = { ...prev, [itemId]: newQty };
        try { localStorage.setItem('cartItems', JSON.stringify(next)); } catch {}
        return next;
      });
    }
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + (qty as number), 0);
  };

  const getTotalPrice = () => {
    const findPrice = (id: number) => {
      const fromFeatured = featuredItems.find((i: any) => i.id === id);
      if (fromFeatured) return fromFeatured.price;
      try {
        const cached = JSON.parse(localStorage.getItem('menuItems') || 'null');
        if (Array.isArray(cached)) {
          const item = cached.find((i: any) => i.id === id);
          if (item) return item.price;
        }
      } catch (e) {
        // ignore
      }
      return 0;
    };

    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      const id = parseInt(itemId);
      const price = findPrice(id);
      return total + price * (qty as number);
    }, 0);
  };
  // ---------- end cart helpers ----------


  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const rate = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0)));
      counts[rate] = (counts[rate] || 0) + 1;
    }
    return counts;
  }, [reviews]);

  const totalReviews = useMemo(() => reviews.length, [reviews]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10; // one decimal like Play Store
  }, [reviews]);

  // filtered list to render (home uses reviews slice directly, but keep this in case you change)
  const visibleReviews = useMemo(() => {
    if (filterRating === 'all') return reviews;
    return reviews.filter(r => Math.round(Number(r.rating) || 0) === filterRating);
  }, [reviews, filterRating]);

  const ratingPercent = (star: number) => {
    if (totalReviews === 0) return 0;
    return Math.round(((ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0) / totalReviews) * 100);
  };

  useEffect(() => {
    // Load user type
    const type = localStorage.getItem('userType') || 'user';
    setUserType(type);

    // Load restaurant info (cached)
    const savedInfo = JSON.parse(localStorage.getItem('restaurant_info') || 'null');
    if (savedInfo) {
      setrestaurant_info(savedInfo);
    } else {
      localStorage.setItem('restaurant_info', JSON.stringify(restaurant_info));
    }

    // Load cart from localStorage (ensure home page state is in sync)
    try {
      const savedCart = JSON.parse(localStorage.getItem('cartItems') || '{}') || {};
      // normalize keys to numbers
      const normalized = Object.fromEntries(
        Object.entries(savedCart).map(([k, v]) => [Number(k), v])
      ) as { [key: number]: number };
      setCartItems(normalized);
    } catch (e) {
      setCartItems({});
    }

    setReviews([]);
    setFeaturedItems([]);
    setCategories([]);

    loadMenuData();
    loadReviews();

    // close search if clicked outside
    const onDocClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recompute searchResults whenever searchTerm changes
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const q = searchTerm.trim().toLowerCase();
    // use in-memory menuItems first; fallback to localStorage cached menu
    const source = menuItems.length ? menuItems : (JSON.parse(localStorage.getItem('menuItems') || '[]') as any[]);
    if (!Array.isArray(source) || source.length === 0) {
      setSearchResults([]);
      return;
    }

    const results = source.filter((item: any) => {
      return (
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q) ||
        String(item.category?.name || item.category || '').toLowerCase().includes(q)
      );
    }).slice(0, 8); // limit results
    setSearchResults(results);
  }, [searchTerm, menuItems]);










const parseTimeSafe = (v: any): number => {
  if (!v && v !== 0) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const asNum = Number(v);
    if (!Number.isNaN(asNum) && String(v).trim().length >= 10) return asNum;
    const asDate = Date.parse(v);
    if (!Number.isNaN(asDate)) return asDate;
    return 0;
  }
  try {
    const cast = new Date(v as any).getTime();
    return Number.isNaN(cast) ? 0 : cast;
  } catch {
    return 0;
  }
};

const deriveFlagsForItem = (item: any, now = Date.now(), newThresholdMs = 7 * 24 * 60 * 60 * 1000) => {
  const createdRaw = item.created_at ?? null;
  const updatedRaw = item.updated_at ?? null;

  const created = parseTimeSafe(createdRaw);
  const updated = parseTimeSafe(updatedRaw);

  const isEdited = typeof item.isEdited === 'boolean'
    ? !!item.isEdited
    : (updated > 0 && created > 0 && updated !== created);

  const isNew = typeof item.isNew === 'boolean'
    ? !!item.isNew
    : (created > 0 && (now - created) <= newThresholdMs);

  const lastChanged = Math.max(created || 0, updated || 0);

  return { created, updated, isEdited, isNew, lastChanged };
};

const loadMenuData = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'getMenuData' })
    });

    const data = await response.json();

    // DEBUG (optional): console.debug('admin-menu-service returned menuItems sample:', (data?.menuItems || []).slice(0,5));

    if (data.success) {
      const items = Array.isArray(data.menuItems) ? data.menuItems : [];

      const categoriesWithCounts = (data.categories || []).map((cat: any) => ({
        ...cat,
        count: items.filter((item: any) => item.category_id === cat.id).length
      }));
      setCategories(categoriesWithCounts);

      const now = Date.now();
      const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

      const enriched = items.map((it: any) => {
        const meta = deriveFlagsForItem(it, now, NEW_THRESHOLD_MS);
        return { ...it, __meta: meta };
      });

// Robust comparator: priority (new/edited) first, then lastChanged desc (newest first)
enriched.sort((a: any, b: any) => {
  const A = a.__meta ?? {};
  const B = b.__meta ?? {};

  const aPriority = (A.isNew || A.isEdited) ? 1 : 0;
  const bPriority = (B.isNew || B.isEdited) ? 1 : 0;
  if (aPriority !== bPriority) return bPriority - aPriority; // higher priority first

  // numeric compare of lastChanged (descending -> newest first)
  const aLast = Number(A.lastChanged || 0);
  const bLast = Number(B.lastChanged || 0);
  if (bLast !== aLast) return bLast - aLast;

  // fallback to created timestamp (descending)
  const aCreated = Number(A.created || 0);
  const bCreated = Number(B.created || 0);
  if (bCreated !== aCreated) return bCreated - aCreated;

  // final deterministic fallback: id descending (so higher id (newer) comes first)
  // if your ids are numeric use numeric compare:
  const aIdNum = Number(a.id);
  const bIdNum = Number(b.id);
  if (!Number.isNaN(aIdNum) && !Number.isNaN(bIdNum)) {
    return bIdNum - aIdNum;
  }
  // otherwise string locale compare (ascending), but invert to get newest first
  return String(b.id || '').localeCompare(String(a.id || ''));
});






      setFeaturedItems(enriched.slice(0, 3).map((i: any) => i));
      setMenuItems(enriched.map((i: any) => i));

      try {
        localStorage.setItem('menuItems', JSON.stringify(enriched));
      } catch (e) {
        console.warn('Unable to cache menu items', e);
      }
    } else {
      console.warn('admin-menu-service returned success=false', data);
    }
  } catch (error) {
    console.error('Error loading menu data from database:', error);
  } finally {
    setLoading(false);
  }
};













  


  const loadReviews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ action: 'getReviews' })
      });

      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews from database:', error);
      setReviews([]);
    }
  };

  const addReview = async (newReview: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'createReview',
          reviewData: {
            name: newReview.name,
            email: newReview.email,
            rating: newReview.rating,
            text: newReview.text
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        successToast.innerHTML = `<div class="flex items-center space-x-2"><i class="ri-check-circle-line text-xl"></i><span>Thank you for your review! It has been posted.</span></div>`;
        document.body.appendChild(successToast);
        setTimeout(() => {
          successToast.style.opacity = '0';
          successToast.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(successToast)) {
              document.body.removeChild(successToast);
            }
          }, 300);
        }, 4000);
        await loadReviews();
      } else {
        alert('Error submitting review: ' + (data.error || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please check your connection and try again.');
    }
  };

  // handle selection: go to menu page and (optionally) pass item id in query
  const onSelectResult = (item: any) => {
    setSearchOpen(false);
    setSearchTerm('');
    // navigate to menu page with item id — you can adapt this handling
    router.push(`/menu?item=${item.id}`);
  };

  // Small Stars helper component used in the reviews/metrics UI
  const Stars = ({ value, size = 'text-lg' }: { value: number; size?: string }) => {
    const v = Math.round(Number(value) || 0);
    return (
      <div className={`inline-flex items-center ${size}`}>
        {[1,2,3,4,5].map((i) => (
          <i key={i} className={`ri-star-${i <= v ? 'fill' : 'line'} text-yellow-400 ${i < 5 ? 'mr-0.5' : ''}`}></i>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(251,146,60,0.8), rgba(220,38,38,0.8)), url('https://readdy.ai/api/search-image?query=Traditional%20Newari%20restaurant%20interior&width=1200&height=600')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Authentic Newari Cuisine</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
  Experience traditional flavors at {restaurant_info?.name ?? 'Our Restaurant'} in the heart of Pokhara
</p>


          {/* Search bar (replaces Track Order) */}
          <div ref={searchRef} className="max-w-2xl mx-auto w-full relative">
            <div className="flex items-center gap-4 justify-center">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-200 text-lg"></i>
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                      setSearchTerm('');
                    }
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      onSelectResult(searchResults[0]);
                    }
                  }}
                  placeholder="Search menu items..."
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white bg-opacity-20 placeholder-white placeholder-opacity-90 focus:bg-white focus:bg-opacity-100 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  // quick go to full menu page with optional query param
                  if (searchTerm && searchTerm.trim().length > 0) {
                    // push search param to menu for later extension
                    router.push(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
                  } else {
                    router.push('/menu');
                  }
                }}
                className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Browse Menu
              </button>
            </div>

            {/* live dropdown */}
            {searchOpen && searchTerm.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-3 bg-white rounded-xl shadow-lg z-50 max-h-96 overflow-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-gray-600">No results</div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelectResult(item)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-4 border-b last:border-b-0"
                    >
                      <img
                        src={item.image_url || item.image || 'https://readdy.ai/api/search-image?query=delicious%20nepali%20food&width=120&height=80'}
                        alt={item.name}
                        loading="lazy"
                        className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className="font-semibold text-gray-800">{item.name}</div>
                          <div className="text-orange-600 font-bold">₨{item.price}</div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{item.category?.name || item.category || ''}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </section>



<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-800">
      Browse Categories
    </h2>

    {loading ? (
      // Skeleton grid for categories
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full h-40 bg-gray-200 rounded-xl" />
        ))}
      </div>
    ) : categories.length === 0 ? (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-folder-line text-3xl text-gray-400"></i>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">
          No Categories Yet
        </h3>
        <p className="text-gray-500 mb-6">
          Categories will appear here once the owner adds them
        </p>
        <Link
          href="/menu"
          className="inline-block bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap"
        >
          View Menu
        </Link>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((category: any, index: number) => {
          const src = categoryIconMap?.[category.id] ?? null;

          return (
            <Link
              key={category.id ?? index}
              href={`/menu?category=${encodeURIComponent(category.slug || category.id)}`}
              className="block group"
            >
              <div className="relative w-full h-40 sm:h-48 lg:h-56 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
                {src ? (
                  <img
                    src={src}
                    alt={category.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <i className="ri-restaurant-line text-4xl text-gray-400"></i>
                  </div>
                )}

                {/* Overlay for name */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-lg sm:text-xl">
                  {category.name}
                </div>
              </div>
            </Link>
          );
        })}
      

      </div>


    )}
  </div>
</section>















      {/* Featured Items */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Dishes</h2>

          {loading ? (
            // Skeleton cards for featured items
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="animate-pulse"><SkeletonCard /></div>
              <div className="animate-pulse"><SkeletonCard /></div>
              <div className="animate-pulse hidden lg:block"><SkeletonCard /></div>
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-restaurant-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Menu Items Yet</h3>
              <p className="text-gray-500 mb-6">Featured dishes will appear here once the owner adds menu items</p>
              <Link href="/menu" className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap">
                View Menu
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
             
             
{featuredItems.map((item) => {
  const meta = item.__meta || {};
  const isNew = !!meta.isNew;
  const isEdited = !!meta.isEdited;

  return (
    <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
      <div className="aspect-video relative">
        <img
          src={item.image_url || item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover object-top"
        />

        {/* Badges in top-left */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-semibold">NEW</span>}
          {isEdited && <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full font-semibold">EDITED</span>}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
          <span className="text-xl font-bold text-orange-600">₨{item.price}</span>
        </div>

        <p className="text-gray-600 mb-4">{item.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {item.category?.name || item.category}
          </span>

          {cartItems[item.id] ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newQty = Math.max(0, (cartItems[item.id] || 0) - 1);
                  updateQuantity(item.id, newQty);
                }}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer"
              >
                <i className="ri-subtract-line"></i>
              </button>

              <span className="font-semibold text-lg">{cartItems[item.id]}</span>

              <button
                onClick={() => addToCart(item.id, 1)}
                className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer"
              >
                <i className="ri-add-line"></i>
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item.id, 1)}
              className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
})}




            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/menu" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
{/* Customer Reviews Section */}
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
      What Our Customers Say
    </h2>
        {/* Top metrics: avg rating, total, distribution */}
       {/* Responsive rating summary (mobile-first) */}







<div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
    {/* Left column: average + stars */}
    <div className="flex-shrink-0 text-center md:text-left mb-4 md:mb-0">
      <div className="text-3xl md:text-4xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
      <div className="mt-1"><Stars value={averageRating} size="text-sm md:text-base" /></div>
      <div className="text-xs md:text-sm text-gray-500 mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</div>
    </div>

    {/* vertical divider on md+ */}
    <div className="hidden md:block w-px h-16 bg-gray-100" />

    {/* Right column: distribution rows */}
    <div className="flex-1">
      {[5, 4, 3, 2, 1].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setFilterRating(prev => (prev === star ? 'all' : star))}
          className="w-full flex items-center gap-3 mb-3 md:mb-4 px-1 py-2 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
          aria-pressed={filterRating === star}
          title={filterRating === star ? `Showing ${star}-star reviews. Click to clear.` : `Show ${star}-star reviews`}
        >
          {/* star label (fixed width) */}
          <span className="w-9 text-sm md:text-sm flex-shrink-0 text-left">{star}★</span>

          {/* bar: fills remaining horizontal space */}
          <div className="flex-1">
            <div className="bg-gray-100 rounded-full h-3 md:h-4 overflow-hidden">
              <div
                className="h-3 md:h-4 rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${ratingPercent(star)}%` }}
                aria-hidden
              />
            </div>
          </div>

          {/* count pill - larger tappable target on mobile */}
          <span className={`ml-3 text-sm md:text-sm font-medium px-3 py-1 rounded-full ${filterRating === star ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
            {ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0}
          </span>
        </button>
      ))}

      {/* actions: See all or Show all */}
      <div className="mt-3 md:mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Link
          href="/reviews"
          className="inline-flex justify-center items-center px-5 py-2 md:px-6 md:py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition"
        >
          See All Reviews
        </Link>


      </div>
    </div>
  </div>
</div>








    {reviews.length === 0 ? (
      // Reviews skeleton
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="animate-pulse"><SkeletonReview /></div>
        <div className="animate-pulse"><SkeletonReview /></div>
        <div className="animate-pulse hidden lg:block"><SkeletonReview /></div>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {(visibleReviews.slice(0, 6)).map((review) => (
          <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <i className="ri-user-line text-orange-600 text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{review.customer_name || review.name || 'Anonymous'}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`ri-star-${i < (Number(review.rating) || 0) ? 'fill' : 'line'} text-yellow-400`}
                    ></i>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">"{review.review_text || review.text || ''}"</p>
            <p className="text-sm text-gray-500">
              {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
            </p>
            {review.is_featured && (
              <div className="mt-2">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                  Featured Review
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    )}


    <div className="max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Share Your Experience
      </h3>
      <ReviewForm onSubmit={addReview} />
    </div>
  </div>










</section>

<div className="bg-white rounded-2xl shadow-lg p-8">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send us a Message</h2>
  <QuestionForm />








{/* View answered user questions */}
<div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Visitor Q&A</h2>
      <ViewQuestions />
</div>

</div>





      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-800">{getTotalItems()} items in cart</span>
              <span className="ml-4 font-bold text-orange-600 text-lg">₨{getTotalPrice().toLocaleString()}</span>
            </div>
            <Link href="/cart" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap">
              View Cart
            </Link>
          </div>
        </div>
      )}

      {/* Location Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Visit Us</h2>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Restaurant Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-restaurant-line text-xl text-orange-600 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">{restaurant_info?.name ?? 'Our Restaurant'}</p>
                    <p className="text-gray-600">Authentic Newari cuisine in Pokhara</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-map-pin-line text-xl text-orange-600 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Address</p>
                    <p className="text-gray-600">{restaurant_info?.address ?? 'Address not set'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-phone-line text-xl text-orange-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Phone</p>
<a
  href={restaurant_info?.phone ? `tel:${restaurant_info.phone}` : '#'}
  className="text-orange-600 hover:text-orange-700 cursor-pointer"
  onClick={(e) => { if (!restaurant_info?.phone) e.preventDefault(); }}
>
  {restaurant_info?.phone ?? 'Phone not set'}
</a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-mail-line text-xl text-orange-600"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
<a
  href={restaurant_info?.email ? `mailto:${restaurant_info.email}` : '#'}
  className="text-orange-600 hover:text-orange-700 cursor-pointer"
  onClick={(e) => { if (!restaurant_info?.email) e.preventDefault(); }}
>
  {restaurant_info?.email ?? 'Email not set'}
</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-time-line text-xl text-orange-600 mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800">Opening Hours</p>
                    <p className="text-gray-600">Daily: 9:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

<div
  className="aspect-video rounded-2xl overflow-hidden cursor-pointer"
  onClick={() => {
    if (restaurant_info?.coordinates) {
      window.open(`https://www.google.com/maps/place/${restaurant_info.coordinates}`, '_blank');
    } else {
      // optional: show message or do nothing
      console.warn('No coordinates available');
    }
  }}
>
  <iframe
    src={restaurant_info?.coordinates
      ? `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d219.70586196168153!2d83.9908873!3d28.2287612!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399595c315c578db%3A0x4c21b4257a106489!2sNewari%20Bhatti%20and%20Kathmandu%20momo%20ghar!5e0!3m2!1sen!2snp!4v1757060425626!5m2!1sen!2snp`
      : 'about:blank'
    }
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title={restaurant_info?.name ? `${restaurant_info.name} Location` : 'Location'}
  />
</div>


          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <i className="ri-restaurant-line text-white text-lg"></i>
                </div>
                <span className="font-['Pacifico'] text-xl text-orange-400">Newari Bhatti & Kathmandu Momo Ghar</span>
              </div>
              <p className="text-gray-400">Serving authentic Newari cuisine and traditional Nepali flavors since 2015. Experience the taste of Nepal in Pokhara.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/menu" className="text-gray-400 hover:text-orange-400 cursor-pointer">Menu</Link></li>
                <li><Link href="/orders" className="text-gray-400 hover:text-orange-400 cursor-pointer">Track Order</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-orange-400 cursor-pointer">Contact Us</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-orange-400 cursor-pointer">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                
<p className="flex items-center">
  <i className="ri-phone-line mr-2"></i>
  <a
    href={restaurant_info?.phone ? `tel:${restaurant_info.phone}` : '#'}
    className="hover:text-orange-400 cursor-pointer"
    onClick={(e) => { if (!restaurant_info?.phone) e.preventDefault(); }}
  >
    {restaurant_info?.phone ?? 'Phone not set'}
  </a>
</p>



<p className="flex items-center">
  <i className="ri-mail-line mr-2"></i>
  <a
    href={restaurant_info?.email ? `mailto:${restaurant_info.email}` : '#'}
    className="hover:text-orange-400 cursor-pointer"
    onClick={(e) => { if (!restaurant_info?.email) e.preventDefault(); }}
  >
    {restaurant_info?.email ?? 'Email not set'}
  </a>
</p>


<p className="flex items-center">
  <i className="ri-map-pin-line mr-2"></i>
  {restaurant_info?.address ?? 'Address not set'}
</p>


              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer">
                  <i className="ri-facebook-fill text-white"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 cursor-pointer">
                  <i className="ri-instagram-line text-white"></i>
                </a>
              </div>
            </div>
          </div>

<div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
  <p>&copy; 2024 {restaurant_info?.name ?? 'Our Restaurant'}. All rights reserved.</p>
</div>
        </div>
      </footer>
    </div>
  );
}

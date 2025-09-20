// app/reviews/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '../../components/Header';
import ReviewForm from '../../components/ReviewForm';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9); // initial items to show
  const [filterRating, setFilterRating] = useState<number | 'all'>('all'); // 'all' | 5 | 4 | ...

  // loadReviews defined inside component so addReview can call it
  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        return;
      }

      const arr = (data || []) as any[];

      // Normalize common fields so the UI can use the same props
      const normalized = arr.map((r: any) => ({
        ...r,
        customer_name: r.customer_name || r.name || r.full_name || 'Anonymous',
        review_text: r.review_text || r.text || r.comment || '',
        rating: Number(r.rating) || 0,
        created_at: r.created_at || r.createdAt || null,
        is_featured: !!r.is_featured
      }));

      // Put featured first
      const featured = normalized.filter((r) => r.is_featured);
      const others = normalized.filter((r) => !r.is_featured);
      setReviews([...featured, ...others]);
    } catch (err) {
      console.error('Unexpected error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // small toast
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

        // reload reviews after successful submission
        await loadReviews();
      } else {
        alert('Error submitting review: ' + (data.error || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please check your connection and try again.');
    }
  };

  const loadMore = () => setVisibleCount((prev) => prev + 9);

  const SkeletonReview = () => <div className="bg-gray-200 rounded-2xl h-40 p-4" />;

  // -------- Metrics and filtering ----------
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

  const ratingPercent = (star: number) => {
    if (totalReviews === 0) return 0;
    return Math.round(((ratingCounts[star] || 0) / totalReviews) * 100);
  };

  // helper to render star icons
  const Stars = ({ value, size = 'text-lg' }: { value: number; size?: string }) => {
    const v = Math.round(Number(value) || 0);
    return (
      <div className={`inline-flex items-center ${size}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <i key={i} className={`ri-star-${i <= v ? 'fill' : 'line'} text-yellow-400 ${i < 5 ? 'mr-0.5' : ''}`}></i>
        ))}
      </div>
    );
  };

  // toggle or set filter
  const handleFilterClick = (star: number) => {
    setFilterRating((prev) => (prev === star ? 'all' : star));
    setVisibleCount(9);
  };

  // sorted + filtered list used for rendering
  const sortedReviews = useMemo(() => {
    let list = [...reviews];

    if (filterRating !== 'all') {
      list = list.filter((r) => Math.round(Number(r.rating) || 0) === filterRating);
    }

    // Sort newest first
    list.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });

    return list;
  }, [reviews, filterRating]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>
          <Link href="/" className="text-orange-600 hover:text-orange-700">Back to Home</Link>
        </div>

        <p className="text-gray-600 mb-8 max-w-xl">
          Featured reviews appear first. Read what customers say about Newari Bhatti & Kathmandu Momo Ghar.
        </p>








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


                <button
                onClick={() => { setFilterRating('all'); setVisibleCount(9); }}
                className={`inline-flex justify-center items-center px-5 py-2 md:px-6 md:py-3 rounded-full font-semibold transition ${filterRating === 'all' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                Show all
                </button>
            </div>
            </div>
        </div>
        </div>








        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <SkeletonReview />
            <SkeletonReview />
            <SkeletonReview />
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <i className="ri-chat-3-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500">No reviews match this filter.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {sortedReviews.slice(0, visibleCount).map((review) => (
                <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-user-line text-orange-600 text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{review.customer_name || 'Anonymous'}</h4>
                        <div className="flex items-center">
                          <Stars value={Math.round(Number(review.rating) || 0)} size="text-base" />
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">"{review.review_text || ''}"</p>

                  {review.is_featured && (
                    <div className="mt-3">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">Featured Review</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {visibleCount < sortedReviews.length && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-white border border-gray-200 px-6 py-3 rounded-full font-semibold hover:shadow transition"
                >
                  Load more reviews
                </button>
              </div>
            )}
          </>
        )}











        <div className="max-w-2xl mx-auto mt-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Share Your Experience
          </h3>
          <ReviewForm onSubmit={addReview} />
        </div>








        
      </div>
    </div>
  );
}
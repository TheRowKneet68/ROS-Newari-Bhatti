
'use client';

import { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (review: { name: string; email: string; rating: number; text: string }) => void;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    text: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.text.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', rating: 5, text: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <form id="review-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              id="reviewer-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your name"
              maxLength={50}
              required
            />
          </div>
          
          <div>
            <label htmlFor="reviewer-email" className="block text-sm font-medium text-gray-700 mb-2">
              Your Email *
            </label>
            <input
              id="reviewer-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`text-2xl cursor-pointer transition-colors ${
                  star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                <i className="ri-star-fill"></i>
              </button>
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {formData.rating} star{formData.rating !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="review-text"
            name="text"
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            placeholder="Share your experience at Newari Bhatti..."
            rows={4}
            maxLength={500}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.text.length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            isSubmitting
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
}

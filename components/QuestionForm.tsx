'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function QuestionForm() {
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        question: question.trim(),
        // keep answer null initially; is_answered defaults to false
      };

      const { error } = await supabase
        .from('user_questions')
        .insert([payload]);

      if (error) {
        console.error('Supabase insert question error:', error);
        setError('Failed to submit. Please try again.');
        // no throw — keep UI usable
      } else {
        setQuestion('');
        setSent(true);
        setTimeout(() => setSent(false), 4000);
      }
    } catch (err) {
      console.error('Unexpected error while submitting question:', err);
      setError('Unexpected error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Your question (anonymous)</label>
        <textarea
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          placeholder="Ask us anything about the menu, opening hours, delivery..."
        />
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send Question'}
          </button>
          {sent && <span className="text-sm text-green-600">Question submitted we will get back to you soon, thanks! </span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ViewQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // This will only return rows visible to the current JWT / anon per RLS:
        const { data, error } = await supabase
          .from('user_questions')
          .select('*')
          .eq('is_answered', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('ViewQuestions supabase select error:', error);
          setQuestions([]);
        } else {
          if (mounted) setQuestions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Unexpected error loading questions:', err);
        setQuestions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="space-y-4">Loading questions…</div>;
  }

  if (!questions.length) {
    return <div className="text-gray-600">No answered questions yet.</div>;
  }

  return (







<div className="space-y-6">
  {questions.map((q) => (
    <div key={q.id} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      {/* Timestamp */}
      <div className="text-xs text-gray-400 mb-3">
        Asked on {new Date(q.created_at).toLocaleString()}
      </div>

      {/* Question */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <i className="ri-question-line text-blue-600 text-lg"></i>
          <h3 className="font-semibold text-gray-900">Question</h3>
        </div>
        <p className="text-gray-800 bg-blue-50 border-l-4 border-blue-400 pl-3 py-2 rounded-md leading-relaxed">
          {q.question}
        </p>
      </div>

      {/* Answer */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <i className="ri-chat-3-line text-green-600 text-lg"></i>
          <h3 className="font-semibold text-gray-900">Answer</h3>
        </div>
        {q.answer ? (
          <p className="text-gray-700 bg-green-50 border-l-4 border-green-400 pl-3 py-2 rounded-md leading-relaxed">
            {q.answer}
          </p>
        ) : (
          <p className="text-gray-500 italic">No answer yet</p>
        )}
      </div>
    </div>
  ))}
</div>












  );
}

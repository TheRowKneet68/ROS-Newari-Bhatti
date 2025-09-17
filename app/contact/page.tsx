
'use client';

import Header from '../../components/Header';
import ContactForm from '../../components/ContactForm';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import QuestionForm from '../../components/QuestionForm';
import ViewQuestions from '../../components/ViewQuestions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ContactPage() {



  const [userType, setUserType] = useState('');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [restaurantInfo, setRestaurantInfo] = useState<any | null>(null);

  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [savingFaq, setSavingFaq] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  // Load userType from localStorage (if you set this elsewhere in app) - still ok to use
  useEffect(() => {
    const userTypeStored = localStorage.getItem('userType') || 'user';
    setUserType(userTypeStored);
  }, []);

  // ---- Load restaurant info from DB (with localStorage fallback) ----
  const loadRestaurantInfo = async () => {
    setLoadingRestaurant(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Supabase restaurant_info select error:', error);
        // fallback to localStorage
        const saved = JSON.parse(localStorage.getItem('restaurantInfo') || 'null');
        if (saved) setRestaurantInfo(saved);
      } else {
        const row = Array.isArray(data) && data.length ? data[0] : null;
        setRestaurantInfo(row);
        try { localStorage.setItem('restaurantInfo', JSON.stringify(row)); } catch (e) {}
      }
    } catch (err) {
      console.error('Unexpected error loading restaurant info:', err);
      const saved = JSON.parse(localStorage.getItem('restaurantInfo') || 'null');
      if (saved) setRestaurantInfo(saved);
    } finally {
      setLoadingRestaurant(false);
    }
  };

  // ---- Load FAQs from DB (with local fallback) ----

// ---- Load FAQs from DB (with local fallback) ----
const loadFaqs = async () => {
  setLoadingFaqs(true);
  try {
    // fetch active faqs for public display, but if user is admin fetch all
    const isAdmin = (localStorage.getItem('userType') || 'user') === 'admin'
                 || (localStorage.getItem('userType') || 'user') === 'superadmin';

    let query = supabase
      .from('restaurant_faqs')
      .select('*')
      .order('created_at', { ascending: true });

    // For public visitors show only active; admin sees all
    if (!isAdmin) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase restaurant_faqs select error:', error);
      const saved = JSON.parse(localStorage.getItem('restaurantFaqs') || 'null');
      if (Array.isArray(saved)) setFaqs(saved);
      else setFaqs([]);
    } else {
      setFaqs(Array.isArray(data) ? (data as any[]) : []);
      try { localStorage.setItem('restaurantFaqs', JSON.stringify(data ?? [])); } catch (e) {}
    }
  } catch (err) {
    console.error('Unexpected error loading faqs:', err);
    const saved = JSON.parse(localStorage.getItem('restaurantFaqs') || 'null');
    if (Array.isArray(saved)) setFaqs(saved);
  } finally {
    setLoadingFaqs(false);
  }
};




  // run on mount
  useEffect(() => {
    loadRestaurantInfo();
    loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



const toggleFaqActive = async (id: number, newActive: boolean) => {
  try {
    const { data, error } = await supabase
      .from('restaurant_faqs')
      .update({ is_active: newActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) {
      console.error('Failed to toggle faq active:', error);
      alert('Failed to update FAQ visibility: ' + (error.message || ''));
      return;
    }
    // update local UI
    setFaqs(prev => prev.map(f => f.id === id ? ({ ...f, is_active: newActive, ...(Array.isArray(data) && data[0] ? data[0] : {}) }) : f));
  } catch (e) {
    console.error('Unexpected toggleFaqActive error', e);
  }
};



const addFaq = async (faqData: { question: string; answer: string }) => {
  setSavingFaq(true);
  try {
    const payload = { ...faqData, is_active: true };
    const { data, error } = await supabase
      .from('restaurant_faqs')
      .insert([payload])
      .select(); // returns inserted rows

    console.log('Supabase insert response:', { data, error });

    if (error) {
      console.error('Supabase insert faq error:', error);
      // fallback to local
      const newFaq = { id: Date.now(), ...payload };
      const updatedFaqs = [...faqs, newFaq];
      setFaqs(updatedFaqs);
      try { localStorage.setItem('restaurantFaqs', JSON.stringify(updatedFaqs)); } catch (e) {}
    } else {
      // successful insert — re-fetch latest from DB to ensure consistency & RLS visibility
      await loadFaqs();
    }
    setShowAddFaqModal(false);
  } finally {
    setSavingFaq(false);
  }
};






  


// add near top of file (just above updateFaq) if not already present:
const safeParseId = (id: any) => {
  // faq.id in DB is bigserial -> number. If id is string that looks like number, coerce.
  if (id === null || id === undefined) return null;
  if (typeof id === 'number') return id;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

// Replace your existing updateFaq with this:
const updateFaq = async (id: any, faqData: { question: string; answer: string }) => {
  // guard: ensure id exists
  const parsedId = safeParseId(id);
  if (parsedId === null) {
    console.error('updateFaq called with invalid id:', id, 'faqData:', faqData);
    // perform local update as fallback to keep UI responsive (do not crash)
    const localUpdated = faqs.map(faq => faq.id === id ? { ...faq, ...faqData } : faq);
    setFaqs(localUpdated);
    try { localStorage.setItem('restaurantFaqs', JSON.stringify(localUpdated)); } catch (e) {}
    // show user-friendly message
    alert('Unable to update FAQ in database: invalid id. Updated locally.');
    return;
  }

  setSavingFaq(true);
  try {
    // call supabase and capture full response
    const { data, error } = await supabase
      .from('restaurant_faqs')
      .update({ ...faqData, updated_at: new Date().toISOString() })
      .eq('id', parsedId)
      .select();

    if (error) {
      // don't let it throw — log full error object so we can debug
      console.error('Supabase update faq error:', error);
      // helpful debugging output for you to paste here if you need help:
      // console.log(JSON.stringify(error, null, 2));
      // fallback to local update so UI remains consistent
      const updatedFaqs = faqs.map(faq => faq.id === parsedId ? { ...faq, ...faqData } : faq);
      setFaqs(updatedFaqs);
      try { localStorage.setItem('restaurantFaqs', JSON.stringify(updatedFaqs)); } catch (e) {}
      // If RLS blocked it you'll typically see error.message like "new row violates row-level security policy"
      alert('Failed to update FAQ in database: ' + (error.message || JSON.stringify(error)));
      return;
    }

    // success path - update state with DB returned row if available
    const updated = Array.isArray(data) && data[0] ? data[0] : null;
    if (updated) {
      const next = faqs.map(faq => faq.id === parsedId ? updated : faq);
      setFaqs(next);
      try { localStorage.setItem('restaurantFaqs', JSON.stringify(next)); } catch (e) {}
    } else {
      // if DB didn't return updated row, apply optimistic update using local data
      const next = faqs.map(faq => faq.id === parsedId ? { ...faq, ...faqData } : faq);
      setFaqs(next);
      try { localStorage.setItem('restaurantFaqs', JSON.stringify(next)); } catch (e) {}
    }

    setEditingFaq(null);
  } catch (err) {
    // catch unexpected runtime errors and log them
    console.error('Unexpected exception in updateFaq:', err);
    alert('Unexpected error while updating FAQ. See console for details.');
  } finally {
    setSavingFaq(false);
  }
};














  const deleteFaq = async (id: number) => {
    // if (!confirm('Are you sure you want to delete this FAQ?')) return;
    setSavingFaq(true);
    try {
      const { error } = await supabase.from('restaurant_faqs').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete faq error:', error);
        // fallback local delete
        const updatedFaqs = faqs.filter(faq => faq.id !== id);
        setFaqs(updatedFaqs);
        try { localStorage.setItem('restaurantFaqs', JSON.stringify(updatedFaqs)); } catch (e) {}
      } else {
        const updatedFaqs = faqs.filter(faq => faq.id !== id);
        setFaqs(updatedFaqs);
        try { localStorage.setItem('restaurantFaqs', JSON.stringify(updatedFaqs)); } catch (e) {}
      }
    } finally {
      setSavingFaq(false);
    }
  };





  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Contact Us</h1>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-orange-600 text-xl"></i>
                  </div>
                  <div>


<h3 className="font-semibold text-gray-800 mb-1">Restaurant Name</h3>
<p className="text-gray-600">
  {loadingRestaurant ? 'Loading…' : (restaurantInfo?.name ?? 'Our Restaurant')}
</p>

                  
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-map-pin-line text-orange-600 text-xl"></i>
                  </div>
                  <div>

<h3 className="font-semibold text-gray-800 mb-1">Address</h3>
<p className="text-gray-600">
  {loadingRestaurant ? 'Loading…' : (restaurantInfo?.address ?? 'Address not set')}
</p>

                  
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-phone-line text-orange-600 text-xl"></i>
                  </div>
                  <div>



<h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
<a
  href={restaurantInfo?.phone ? `tel:${restaurantInfo.phone}` : '#'}
  className="text-orange-600 hover:text-orange-700 cursor-pointer"
  onClick={(e) => { if (!restaurantInfo?.phone) e.preventDefault(); }}
>
  {loadingRestaurant ? 'Loading…' : (restaurantInfo?.phone ?? 'Phone not set')}
</a>




                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-mail-line text-orange-600 text-xl"></i>
                  </div>
                  <div>





<h3 className="font-semibold text-gray-800 mb-1">Email</h3>
<a
  href={restaurantInfo?.email ? `mailto:${restaurantInfo.email}` : '#'}
  className="text-orange-600 hover:text-orange-700 cursor-pointer"
  onClick={(e) => { if (!restaurantInfo?.email) e.preventDefault(); }}
>
  {loadingRestaurant ? 'Loading…' : (restaurantInfo?.email ?? 'Email not set')}
</a>




                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-time-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Operating Hours</h3>
                    <p className="text-gray-600">Daily: 9:00 AM - 10:00 PM</p>
                    <p className="text-sm text-gray-500">Open all week including holidays</p>
                  </div>
                </div>
              </div>
            </div>






{/* Contact Form -> anonymous question form */}
<div className="bg-white rounded-2xl shadow-lg p-8">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send us a Message</h2>
  <QuestionForm />
</div>












          </div>

          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Find Us</h2>




<div
  className="aspect-video rounded-lg overflow-hidden cursor-pointer"
  onClick={() => {
    if (restaurantInfo?.coordinates) {
      window.open(`https://www.google.com/maps/place/${restaurantInfo.coordinates}`, '_blank');
    } else {
      // optional: show toast or do nothing
      console.warn('No coordinates available');
    }
  }}
>
  <iframe
    src={restaurantInfo?.coordinates
      ? `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d219.70586196168153!2d83.9908873!3d28.2287612!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399595c315c578db%3A0x4c21b4257a106489!2sNewari%20Bhatti%20and%20Kathmandu%20momo%20ghar!5e0!3m2!1sen!2snp!4v1757060425626!5m2!1sen!2snp`
      : 'about:blank'}
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title={restaurantInfo?.name ? `${restaurantInfo.name} Location` : 'Location'}
  />
</div>













            
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <p className="text-orange-700 text-sm">
                <i className="ri-cursor-line mr-2"></i>
                Click on the map to open in Google Maps for directions
              </p>
            </div>
          </div>




















{/* View answered user questions */}
<div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Visitor Q&A</h2>
  <ViewQuestions />
</div>













        </div>
      </div>
    </div>
  );
}

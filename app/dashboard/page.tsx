
'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import React from 'react';
import { useState, useEffect } from 'react';
import OrderModal from './OrderModal';
import { createClient } from '@supabase/supabase-js';
import { useRef } from 'react';





const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// right after const supabase = createClient(...)
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.sup = supabase;
  // debug: print URL and anon key presence (DO NOT log secret service_role anywhere)
  console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE ANON KEY present?', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}


export default function DashboardPage() {
  const [userQuestions, setUserQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const BUCKETNAME = 'menu-images';

  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const lastOrderCountRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const lastCancelledCountRef = useRef<number | null>(null);

  // audio refs for beep

  const audioCtxRef = useRef<AudioContext | null>(null);
  const chirpTimeoutRef = useRef<number | null>(null);
  const chirpIntervalRef = useRef<number | null>(null);
  const beepOscRef = useRef<OscillatorNode | null>(null);
  const beepGainRef = useRef<GainNode | null>(null);
  const beepTimeoutRef = useRef<number | null>(null);
  const unlockedRef = useRef(false);

  
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const [cancelledOrders, setCancelledOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'total'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const [userType, setUserType] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [showRestaurantInfoModal, setShowRestaurantInfoModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);


// image upload states
const [pickedFile, setPickedFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement | null>(null);

const [uploadingImage, setUploadingImage] = useState(false);
const [uploadProgress, setUploadProgress] = useState<number | null>(null);
const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);


const [restaurantInfo, setRestaurantInfo] = useState({
  name: 'Newari Bhatti and Kathmandu Momo Ghar',
  phone: '+977-9829117277',
  email: 'info@newaribhatti.com',
  address: 'PCM College Agardi, Nadipur, Pokhara 33700, Nepal',
  coordinates: '28.22886241546525, 83.99098268394296'
});
const [restaurantLoading, setRestaurantLoading] = useState(false);





  // ----- Image upload states & helpers -----
// Add these to your existing useState declarations

/**
 * Compress a File to JPEG via canvas.
 * quality between 0.0 - 1.0 (lower => smaller). We use low values for minimal size.
 */




// helper to create a unique filename
const makeFilename = (originalName: string) => {
  const ext = originalName.split('.').pop() ?? 'jpg';
  const name = originalName.replace(/\.[^/.]+$/, '');
  return `${name}_${Date.now()}.${ext}`;
};





// call this from your input onChange or wherever you handle upload
async function uploadImageFile(file: File, userId?: string) {
  if (!file) throw new Error('No file provided');

  // debug: inspect file
  console.log('Uploading file:', file.name, file.size, file.type);


  const folder = userId ? `users/${userId}` : 'uploads';
  const filename = makeFilename(file.name);
  const path = `${folder}/${filename}`; // no leading slash

  try {
    // Use upsert: true if you want overwrites, otherwise false to prevent accidental overwrite.
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKETNAME)
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      return { success: false, error: uploadError };
    }

    console.log('Upload success', data);

    // Get a public URL (if bucket is public)
    const { data: publicData } = supabase.storage.from(BUCKETNAME).getPublicUrl(path);
    const publicUrl = publicData?.publicUrl ?? null;
    console.log('Public URL:', publicUrl);

    // If bucket is private and you need a signed URL:
    // const { data: signedData, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
    // then use signedData.signedUrl

    return { success: true, path, publicUrl };
  } catch (err) {
    console.log('Unexpected upload exception', err);
    return { success: false, error: err };
  }
}


// proper React input change handler


const loadUserQuestions = async () => {
  setLoadingQuestions(true);
  try {
    const { data, error } = await supabase
      .from('user_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading questions:', error);
      setUserQuestions([]);
    } else {
      setUserQuestions(data ?? []);
    }
  } finally {
    setLoadingQuestions(false);
  }
};

useEffect(() => {
  loadUserQuestions();
}, []);






const askQuestion = async (questionText: string) => {
  try {
    const { error } = await supabase
      .from('user_questions')
      .insert([{ question: questionText }]);

    if (error) {
      console.error('Error asking question:', error);
      alert('Could not send your question.');
    } else {
      alert('Your question has been submitted!');
      loadUserQuestions();
    }
  } catch (err) {
    console.error('Unexpected error asking question:', err);
  }
};






const replyToQuestion = async (id: number, answerText: string) => {
  try {
    const { error } = await supabase
      .from('user_questions')
      .update({
        answer: answerText,
        is_answered: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error replying to question:', error);
      alert('Could not reply.');
    } else {
      loadUserQuestions();
    }
  } catch (err) {
    console.error('Unexpected error replying:', err);
  }
};














  const handleFileInputChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    console.log('[handleFileInputChange] called');
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setPickedFile(null);
      setPreviewUrl(null);
      return;
    }
    setPickedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadError(null);
    setUploadedImageUrl(null);

    try {
      setUploading(true);
      const compressed = await compressImageFile(file, 0.45, 1400).catch(() => file as any);
      const res = await uploadCompressedImageToSupabaseSafe(supabase, BUCKETNAME, compressed, 'menu-item');
      if (!res.success) {
        console.error('[auto upload] failed', res.error);
        setUploadError(res.error?.message ?? JSON.stringify(res.error) ?? 'Upload failed');
        return;
      }
      setUploadedImageUrl(res.publicUrl || null);
      console.log('[auto upload] done', res);
    } catch (err) {
      console.error('[auto upload] exception', err);
      setUploadError((err as any)?.message ?? 'Upload exception');
    } finally {
      setUploading(false);
    }
  };















// small helper to call from code if you ever want to pass a File directly
const handleFileSelectFromFile = (f?: File | null) => {
  const file = f ?? null;
  if (!file) {
    setPickedFile(null);
    setPreviewUrl(null);
    return;
  }
  setPickedFile(file);
  setPreviewUrl(URL.createObjectURL(file));
  setUploadedImageUrl(null);
  setUploadError(null);
};


// 1) compressImageFile - single, robust implementation
async function compressImageFile(file: File, quality = 0.45, maxWidth = 1400): Promise<Blob> {
  if (typeof window === 'undefined') return file;
  if (!file || !file.type?.startsWith?.('image/')) return file;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
    image.src = url;
  });

  const ratio = Math.min(1, maxWidth / img.width);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(img, 0, 0, width, height);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas toBlob returned null'));
      resolve(blob);
    }, 'image/jpeg', quality);
  });
}











const handleFileSelect = (f?: File | null) => {
  const file = f ?? fileInputRef.current?.files?.[0] ?? null;
  if (!file) { setPickedFile(null); setPreviewUrl(null); return; }
  setPickedFile(file);
  setPreviewUrl(URL.createObjectURL(file));
  setUploadedImageUrl(null);
  setUploadError(null);
};






  async function uploadCompressedImageToSupabaseSafe(
    supClient: ReturnType<typeof createClient>,
    bucket: string,
    blob: Blob,
    prefix = 'img'
  ): Promise<{ success: boolean; publicUrl?: string | null; path?: string | null; error?: any }> {
    console.log('[uploadCompressedImageToSupabaseSafe] start', { bucket, prefix, blobSize: blob.size });
    if (!supClient) return { success: false, error: 'Supabase client missing' };
    if (!bucket) return { success: false, error: 'Bucket name missing' };

    try {
      const filename = `${prefix}-${makeFilename('upload')}`;
      const uploadBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'image/jpeg' });

      const { data, error } = await supClient.storage.from(bucket).upload(filename, uploadBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        console.log('[Supabase upload] error', error);
        return { success: false, error };
      }
      console.log('[Supabase upload] success', data);

      const urlResult: any = await supClient.storage.from(bucket).getPublicUrl(data.path);
      if (urlResult?.error) {
        console.warn('[Supabase getPublicUrl] error', urlResult.error);
        return { success: true, publicUrl: null, path: data.path };
      }

      const publicUrl = urlResult?.data?.publicUrl ?? null;
      console.log('[Supabase publicUrl]', publicUrl);

      return { success: true, publicUrl, path: data.path };
    } catch (err) {
      console.log('[uploadCompressedImageToSupabaseSafe] exception', err);
      return { success: false, error: err };
    }
  }







  const debugUploadRaw = async () => {
    if (!pickedFile) {
      setUploadError('No file selected');
      return;
    }
    try {
      console.log('debugUploadRaw: file', pickedFile.name, pickedFile.size);
      const fname = `ui-upload-${Date.now()}-${pickedFile.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage.from(BUCKETNAME).upload(fname, pickedFile, { upsert: false });
      console.log('debugUploadRaw result', { data, error });
      if (error) {
        setUploadError(error.message || JSON.stringify(error));
        return;
      }
      const url = await supabase.storage.from(BUCKETNAME).getPublicUrl(data.path);
      setUploadedImageUrl(url?.data?.publicUrl ?? null);
    } catch (err) {
      console.error('debugUploadRaw exception', err);
      setUploadError((err as any)?.message ?? 'Upload exception');
    }
  };







  const handleUpload = async () => {
    if (!pickedFile) return setUploadError('Select a file first');
    setUploading(true);
    setUploadError(null);
    try {
      const compressed = await compressImageFile(pickedFile, 0.35, 1200).catch(() => pickedFile as any);
      const res = await uploadCompressedImageToSupabaseSafe(supabase, BUCKETNAME, compressed, 'menu-item');
      if (!res.success) {
        console.error('[handleUpload] upload failed', res.error);
        setUploadError(res.error?.message ?? JSON.stringify(res.error) ?? 'Upload failed');
        return;
      }
      setUploadedImageUrl(res.publicUrl || null);
    } catch (err) {
      console.error('[handleUpload] exception', err);
      setUploadError((err as any)?.message ?? 'Upload exception');
    } finally {
      setUploading(false);
    }
  };








// 4) optional manual upload button handler (if you prefer manual upload)
const handleUploadClick = async () => {
  if (!pickedFile) {
    setUploadError('No file selected');
    return;
  }
  setUploading(true);
  setUploadError(null);
  try {
    const compressed = await compressImageFile(pickedFile, 0.45, 1400);
    const res = await uploadCompressedImageToSupabaseSafe(supabase, BUCKETNAME, compressed, 'menu-item');
    if (!res.success) {
      setUploadError(res.error?.message ?? 'Upload failed');
      return;
    }
    setUploadedImageUrl(res.publicUrl || null);
  } catch (err: any) {
    console.error('upload error', err);
    setUploadError(err?.message || 'Upload failed');
  } finally {
    setUploading(false);
  }
};




















useEffect(() => {
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const type = localStorage.getItem('userType') || 'user';

  setIsLoggedIn(loggedIn);
  setUserType(type);

  if (!(loggedIn && (type === 'admin' || type === 'superadmin'))) {
    return;
  }



const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  "on-the-way": "bg-purple-100 text-purple-800",
  completed: "bg-gray-200 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  default: "bg-white text-gray-700"
};








  
  // ensure audio context exists (kept for compatibility with other audio if needed)
  const ensureAudioContext = async () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Could not create AudioContext', e);
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  // show small top-right popup for new order
  const showNewOrderToast = (message = 'New order placed') => {
    const id = `new-order-toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = 'fixed top-4 right-4 bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3';
    toast.innerHTML = `
      <div class="w-3 h-3 bg-green-500 rounded-full"></div>
      <div class="text-sm text-gray-800">${message}</div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(8px)';
      setTimeout(() => {
        if (document.body.contains(toast)) document.body.removeChild(toast);
      }, 7000);
    }, 7000);
  };

  // ---- NEW: Play external MP3 for ~5s ----
  // Uses audioElRef so the <audio> element is reused between events.
  const NOTIF_AUDIO_SRC = "https://cdn.pixabay.com/audio/2023/10/27/audio_8ab11e07a4.mp3";

  const startNotificationAudioFor5s = async () => {
    await ensureAudioContext(); // just in case we need it for other audio APIs
    // If there's already an audio playing - restart timer and replay
    if (!audioElRef.current) {
      const audio = new Audio(NOTIF_AUDIO_SRC);
      audio.preload = 'auto';
      audioElRef.current = audio;
      // Some browsers require user gesture; log errors silently
    }

    const audioEl = audioElRef.current!;
    // Try to play - modern browsers might block autoplay if no user gesture, so catch errors
    audioEl.currentTime = 0;
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch((err) => {
        // Silently warning: autoplay might be blocked by browser; handle gracefully
        console.warn("Notification audio play blocked or failed:", err);
      });
    }

    // If already had a timeout, clear it and start new 5s window
    if (chirpTimeoutRef.current) {
      clearTimeout(chirpTimeoutRef.current);
    }
    // Ensure audio stops after ~5s
    chirpTimeoutRef.current = window.setTimeout(() => {
      try {
        audioEl.pause();
        audioEl.currentTime = 0;
      } catch (e) {}
      // cleanup timer
      if (chirpTimeoutRef.current) {
        clearTimeout(chirpTimeoutRef.current);
        chirpTimeoutRef.current = null;
      }
    }, 7000);
  };

  const stopNotificationAudio = () => {
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (chirpTimeoutRef.current) {
      clearTimeout(chirpTimeoutRef.current);
      chirpTimeoutRef.current = null;
    }
  };
  // ---- end NEW audio replacement ----

  // Upsert order in local state (update or insert)
  const upsertOrderInState = (order: any) => {
    setOrders(prev => {
      const exists = prev.some(o => o.id === order.id);
      if (exists) {
        return prev.map(o => (o.id === order.id ? order : o))
                   .sort((a, b) => new Date(b.created_at || b.orderDate || 0).getTime() - new Date(a.created_at || a.orderDate || 0).getTime());
      } else {
        return [order, ...prev].sort((a, b) => new Date(b.created_at || b.orderDate || 0).getTime() - new Date(a.created_at || a.orderDate || 0).getTime());
      }
    });
  };

// Replace your existing markOrderCancelledInState with this:
const markOrderCancelledInState = (order: any) => {
  // 1) update UI state immediately
  setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status: 'cancelled', ...order } : o)));

  // 2) update cached localStorage copies
  try {
    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    localStorage.setItem('allOrders', JSON.stringify((allOrders || []).map((o: any) => o.id === order.id ? { ...o, status: 'cancelled', ...order } : o)));
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    localStorage.setItem('userOrders', JSON.stringify((userOrders || []).map((o: any) => o.id === order.id ? { ...o, status: 'cancelled', ...order } : o)));
  } catch (e) {
    console.warn('Failed saving cancelled order to localStorage', e);
  }

  // 3) Play notification audio and show a "Order cancelled" toast
  try {
    startNotificationAudioFor5s();
  } catch (e) {
    console.warn('Failed to start notification audio', e);
  }

  try {
    showNewOrderToast('Order cancelled');
  } catch (e) {
    console.warn('Failed to show cancelled toast', e);
  }

  // 4) Refresh stats/orders (no full reload)
  try {
    loadOrders().catch((err: any) => console.warn('reload loadOrders err', err));
    loadStats().catch((err: any) => console.warn('reload loadStats err', err));
  } catch (e) {
    console.warn('Failed to refresh dashboard after cancellation', e);
  }
};


  // Remove order from state (delete)
  const removeOrderFromState = (orderId: any) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      localStorage.setItem('allOrders', JSON.stringify((allOrders || []).filter((o: any) => o.id !== orderId)));
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      localStorage.setItem('userOrders', JSON.stringify((userOrders || []).filter((o: any) => o.id !== orderId)));
    } catch (e) {}
  };

  // initial load
  loadDashboardData().catch(() => {});

  // Poll counts every 5s (if realtime not available, this still catches inserts)
  const checkOrders = async () => {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.warn('Poll: failed to fetch orders count', error);
        return;
      }

      if (typeof count === 'number') {
        if (lastOrderCountRef.current !== null && count > lastOrderCountRef.current) {
          // new order(s)
          startNotificationAudioFor5s();
          showNewOrderToast('New order placed');
          loadOrders().catch((e) => console.warn('poll loadOrders err', e));
          loadStats().catch((e) => console.warn('poll loadStats err', e));
        }
        lastOrderCountRef.current = count;
      }
    } catch (err) {
      console.warn('Poll: exception checking orders', err);
    }
  };

  // initial poll then every 5s
  checkOrders();
  const pollId = window.setInterval(checkOrders, 5000);
  pollIntervalRef.current = pollId;
const handleRealtimePayload = (payload: any) => {
  const event = (payload.event || payload.eventType || '').toString().toUpperCase();
  const newRow = payload.new ?? payload.record ?? null;
  const oldRow = payload.old ?? null;

  try {
    if (event === 'INSERT') {
      if (newRow) {
        upsertOrderInState(newRow);
        loadStats().catch(() => {});
        startNotificationAudioFor5s();
        showNewOrderToast('New order placed');
      }
      return;
    }

    if (event === 'UPDATE') {
      if (!newRow) return;

      if ((newRow.status || '').toString().toLowerCase() === 'cancelled') {
        markOrderCancelledInState(newRow);
        loadStats().catch(() => {});
        return;
      }

      upsertOrderInState(newRow);
      loadStats().catch(() => {});
      return;
    }

    if (event === 'DELETE') {
      const deletedId = oldRow?.id ?? payload?.record?.id ?? null;
      if (deletedId) {
        removeOrderFromState(deletedId);
        loadStats().catch(() => {});
      }
      return;
    }

    if (newRow) {
      if ((newRow.status || '').toString().toLowerCase() === 'cancelled') {
        markOrderCancelledInState(newRow);
        loadStats().catch(() => {});
      } else {
        upsertOrderInState(newRow);
        loadStats().catch(() => {});
      }
    }
  } catch (err) {
    console.warn('handleRealtimePayload error', err);
  }
};

  // Realtime subscription: supports both supabase-js v2 (channel) and v1 (.from().on())
  // Realtime subscription: supports both supabase-js v2 (channel) and v1 (.from().on())
let realtimeSub: any = null;
try {
  if ((supabase as any).channel) {
    // v2
    realtimeSub = (supabase as any)
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p: any) => handleRealtimePayload(p))
      .subscribe();
  } else {
    // try v1 style but check at runtime
    try {
      const builder: any = (supabase as any).from ? (supabase as any).from('orders') : null;
      if (builder && typeof builder.on === 'function') {
        realtimeSub = builder
          .on('*', (payload: any) => handleRealtimePayload(payload))
          .subscribe();
      } else {
        console.warn('.from().on not available on supabase client — skipping v1 realtime.');
      }
    } catch (innerErr) {
      console.warn('Error while attempting v1 realtime subscription', innerErr);
    }
  }
} catch (e) {
  console.warn('Failed to create realtime subscription', e);
}


  // cleanup
  return () => {
    try {
      if (pollIntervalRef.current !== null) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      } else {
        clearInterval(pollId);
      }
    } catch (e) {}

    // unsubscribe realtime
    try {
      if (realtimeSub) {
        if (typeof realtimeSub.unsubscribe === 'function') {
          realtimeSub.unsubscribe().catch(() => {});
        } else if (typeof realtimeSub.remove === 'function') {
          realtimeSub.remove();
        } else if (realtimeSub && realtimeSub.channel) {
          try { realtimeSub.channel.unsubscribe(); } catch(e) {}
        }
      }
    } catch (e) {
      console.warn('Error unsubscribing realtime', e);
    }

    // stop notification audio and timers
    stopNotificationAudio();

    // also cleanup audio element if you want to fully remove it
    if (audioElRef.current) {
      try {
        audioElRef.current.src = '';
        audioElRef.current = null;
      } catch (e) {}
    }
  };
}, [isLoggedIn, userType]);











  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // Load all data simultaneously
      await Promise.all([
        loadOrders(),
        loadMenuData(),
        loadReviews(),
        loadRestaurantInfo(),
        loadAdmins(),
        loadStats()   // <-- add this
        
      ]);
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    }
    setDataLoading(false);
  };

  const loadOrders = async () => {
    try {
      // If your RLS allows the currently signed-in admin to read orders,
      // the anon client (with session already present in the browser) should work.
      // We DO NOT call supabase.auth.setAuth or signOut here.
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); // adjust if needed

      if (ordersErr) {
        console.log('Supabase ordersErr:', ordersErr);
        // Fallback to localStorage copy if available
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        setOrders(allOrders);
        return;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.log('Error loading orders:', error);
      const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
      setOrders(allOrders);
    }
  };


  // helper to safely upsert into orders state (keeps order list sorted by created_at desc)
  const upsertOrderInState = (order: any) => {
    setOrders(prev => {
      const exists = prev.some(o => o.id === order.id);
      if (exists) {
        return prev.map(o => (o.id === order.id ? order : o)).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        return [order, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    });
  };


  const loadStats = async () => {
    try {
      // total orders excluding cancelled (count)
      const { count: totalCount, error: totalErr } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .not('status', 'eq', 'cancelled');

      if (totalErr) {
        console.warn('totalErr', totalErr);
      }

      // cancelled orders count
      const { count: cancelledCount, error: cancelledErr } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      if (cancelledErr) {
        console.warn('cancelledErr', cancelledErr);
      }

      // active orders — those NOT completed/cancelled
      const { count: activeCount, error: activeErr } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', '(completed,cancelled)');

      if (activeErr) {
        console.warn('activeErr', activeErr);
      }

      // revenue (sum of total for non-cancelled orders) - small table, do client-side
      const { data: totalsRows, error: totalsErr } = await supabase
        .from('orders')
        .select('total, status');

      if (totalsErr) {
        console.warn('totalsErr', totalsErr);
      }

      const totalRevenueNum = Array.isArray(totalsRows)
        ? totalsRows
            .filter((r: any) => (r.status || '') !== 'cancelled')
            .reduce((s: number, r: any) => s + (Number(r.total) || 0), 0)
        : 0;

      setTotalOrders(typeof totalCount === 'number' ? totalCount : 0);
      setCancelledOrders(typeof cancelledCount === 'number' ? cancelledCount : 0);
      setActiveOrders(typeof activeCount === 'number' ? activeCount : 0);
      setTotalRevenue(totalRevenueNum);
    } catch (err) {
      console.log('Error loading stats:', err);
    }
  };

  // replace the old filteredOrders block with this block
  const filteredOrders = orders.filter((order) => {
    // preserve your original search logic exactly
    const search = (searchTerm || '').toLowerCase();

    const idMatch = order.id?.toString().includes(search);

    const nameMatch = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`
      .toLowerCase()
      .includes(search);

    const emailMatch = (order.customer?.email || '')
      .toString()
      .toLowerCase()
      .includes(search);

    const phoneMatch = (order.customer?.phone || '')
      .toString()
      .toLowerCase()
      .includes(search);

    const addressMatch = (order.address || order.location || order.delivery_address || '')
      .toString()
      .toLowerCase()
      .includes(search);

    // if you haven't added statusFilter state, default to 'all'
    const activeStatusFilter = typeof statusFilter !== 'undefined' ? statusFilter : 'all';
    const statusMatches = activeStatusFilter === 'all' ? true : ((order.status || '').toLowerCase() === activeStatusFilter);

    return (idMatch || nameMatch || emailMatch || phoneMatch || addressMatch) && statusMatches;
  });

  // now apply sorting to produce the final list for rendering
  const filteredAndSortedOrders = [...filteredOrders].sort((a: any, b: any) => {
    const dir = (sortDir === 'asc') ? 1 : -1;

    if (sortBy === 'date') {
      const ta = new Date(a.created_at || a.createdAt || Date.now()).getTime();
      const tb = new Date(b.created_at || b.createdAt || Date.now()).getTime();
      return (tb - ta) * -dir; // if dir=1 (asc) invert
    }

    if (sortBy === 'total') {
      const ta = Number(a.total || 0);
      const tb = Number(b.total || 0);
      return (tb - ta) * -dir;
    }

    // default / status alphabetical
    const sa = (a.status || '').toString().toLowerCase();
    const sb = (b.status || '').toString().toLowerCase();
    if (sa < sb) return -1 * dir;
    if (sa > sb) return 1 * dir;
    return 0;
  });




  const loadMenuData = async () => {
    try {
      console.log('Loading menu data from database...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'getMenuData'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Menu data response:', data);
      
      if (data.success) {
        console.log('Categories loaded:', data.categories?.length || 0);
        console.log('Menu items loaded:', data.menuItems?.length || 0);
        
        setCategories(data.categories || []);
        setMenuItems(data.menuItems || []);
      } else {
        console.log('Failed to load menu data:', data.error);
        // Keep empty state on error
        setCategories([]);
        setMenuItems([]);
      }
    } catch (error) {
      console.log('Error loading menu data from database:', error);
      // Keep empty state on error
      setCategories([]);
      setMenuItems([]);
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
        body: JSON.stringify({
          action: 'getAllReviews'
        })
      });

      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.log('Error loading reviews:', error);
      setReviews([]);
    }
  };

const loadRestaurantInfo = async () => {
  try {
    setRestaurantLoading(true); // if you already have this state, otherwise ignore
    // fetch the single row (if you store only one row; if many rows adapt query)
    const { data, error } = await supabase
      .from('restaurant_info')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // "No rows found" style error in older clients — treat as empty
      setRestaurantInfo(null);
      return;
    }

    if (error) {
      console.error('Supabase error loading restaurant info:', error);
      // fallback to localStorage if you want:
      const saved = JSON.parse(localStorage.getItem('restaurantInfo') || 'null');
      if (saved) setRestaurantInfo(saved);
      return;
    }

    // store fetched record in state and in localStorage cache (optional)
    setRestaurantInfo(data ?? null);
    try {
      localStorage.setItem('restaurantInfo', JSON.stringify(data ?? null));
    } catch (e) {
      // ignore localStorage write errors
    }
  } catch (err) {
    console.error('Unexpected error in loadRestaurantInfo', err);
    const saved = JSON.parse(localStorage.getItem('restaurantInfo') || 'null');
    if (saved) setRestaurantInfo(saved);
  } finally {
    setRestaurantLoading(false);
  }
};

  const loadAdmins = () => {
    const savedAdmins = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    setAdmins(savedAdmins);
  };

  const showSuccessToast = (message: string) => {
    const successToast = document.createElement('div');
    successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    successToast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="ri-check-circle-line text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(successToast);
    
    setTimeout(() => {
      successToast.style.opacity = '0';
      successToast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 7000);
    }, 7000);
  };

  const showErrorToast = (message: string) => {
    const errorToast = document.createElement('div');
    errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorToast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="ri-error-warning-line text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast);
      }
    }, 7000);
  };

  const handleAddCategory = async (categoryData: any) => {
    setLoading(true);
    try {
      console.log('Adding category:', categoryData);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'addCategory',
          categoryData: {
            name: categoryData.name,
            description: categoryData.description,
            icon: categoryData.icon,
            displayOrder: categoryData.displayOrder || 99
          }
        })
      });

      const data = await response.json();
      console.log('Add category response:', data);
      
      if (data.success) {
        // Reload menu data to show the new category
        await loadMenuData();
        setShowAddCategoryModal(false);
        
        // Reset form fields
        const form = document.querySelector('#addCategoryForm') as HTMLFormElement;
        if (form) form.reset();
        
        showSuccessToast(`Category "${categoryData.name}" added successfully!`);
      } else {
        showErrorToast(`Error: ${data.error || 'Failed to add category'}`);
      }
    } catch (error) {
      console.log('Error adding category:', error);
      showErrorToast('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleEditCategory = async (categoryData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'updateCategory',
          categoryId: selectedCategory.id,
          categoryData
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        setShowEditCategoryModal(false);
        setSelectedCategory(null);
        showSuccessToast('Category updated successfully!');
      } else {
        showErrorToast('Error updating category: ' + data.error);
      }
    } catch (error) {
      console.log('Error updating category:', error);
      showErrorToast('Error updating category. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'deleteCategory',
          categoryId
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        showSuccessToast('Category deleted successfully!');
      } else {
        showErrorToast('Error deleting category: ' + data.error);
      }
    } catch (error) {
      console.log('Error deleting category:', error);
      showErrorToast('Error deleting category. Please try again.');
    }
    setLoading(false);
  };


  







  const handleAddMenuItem = async (itemData: any) => {
  setLoading(true);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'addMenuItem',
        itemData
      })
    });

    const data = await response.json();
    if (data.success) {
      await loadMenuData();
      setShowAddItemModal(false);
      showSuccessToast('Menu item added successfully!');
    } else {
      showErrorToast('Error adding menu item: ' + (data.error || 'Unknown'));
    }
  } catch (error) {
    console.log('Error adding menu item:', error);
    showErrorToast('Error adding menu item. Please try again.');
  } finally {
    setLoading(false);
  }
};






const handleEditMenuItem = async (itemData: any) => {
  setLoading(true);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'updateMenuItem',
        itemId: selectedItem?.id,
        itemData
      })
    });

    const data = await response.json();
    if (data.success) {
      await loadMenuData();
      setShowEditItemModal(false);
      setSelectedItem(null);
      showSuccessToast('Menu item updated successfully!');
    } else {
      showErrorToast('Error updating menu item: ' + (data.error || 'Unknown'));
    }
  } catch (error) {
    console.log('Error updating menu item:', error);
    showErrorToast('Error updating menu item. Please try again.');
  } finally {
    setLoading(false);
  }
};







  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-menu-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'deleteMenuItem',
          itemId
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMenuData();
        showSuccessToast('Menu item deleted successfully!');
      } else {
        showErrorToast('Error deleting menu item: ' + data.error);
      }
    } catch (error) {
      console.log('Error deleting menu item:', error);
      showErrorToast('Error deleting menu item. Please try again.');
    }
    setLoading(false);
  };

// Replace your existing updateRestaurantInfo with this robust implementation
const updateRestaurantInfo = async (info: any) => {
  // local saving state (avoid clobbering other global loading)
  try {
    // optional: if you maintain a saving state hook in file, use it instead
    if (typeof setSaving === 'function') setSaving(true);

    // normalize payload: remove undefined values
    const payload: Record<string, any> = {};
    Object.entries(info || {}).forEach(([k, v]) => {
      if (v !== undefined) payload[k] = v;
    });

    // If there is an id provided, try upsert (so we update existing row).
    // If id is undefined/null, insert a new row.
    let resultData = null;
    if (payload.id !== undefined && payload.id !== null && payload.id !== '') {
      // ensure id type matches your DB pk type (int or uuid)
      // If your id is serial/int but the incoming id is string, coerce:
      // payload.id = Number(payload.id) // uncomment if needed

      const { data, error } = await supabase
        .from('restaurant_info')
        .upsert(payload, { onConflict: 'id', returning: 'representation' });

      if (error) {
        console.error('Supabase upsert error (updateRestaurantInfo):', error);
        // Common error: "new row violates row-level security policy" => RLS problem
        // Show helpful message for debugging:
        alert(`Save failed: ${error.message || JSON.stringify(error)}`);
        return false;
      }

      resultData = Array.isArray(data) ? data[0] : data;
    } else {
      // Insert new row (no id provided)
      const { data, error } = await supabase
        .from('restaurant_info')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error (updateRestaurantInfo):', error);
        alert(`Insert failed: ${error.message || JSON.stringify(error)}`);
        return false;
      }

      resultData = data;
    }

    // Update React state (replace variable names below if you use different names)
    if (typeof setRestaurantInfo === 'function') {
      setRestaurantInfo(resultData);
      try {
  await loadRestaurantInfo();
} catch (e) {
  console.warn('loadRestaurantInfo after save failed', e);
}
    } else {
      console.warn('setRestaurantInfo not found; update aborted for UI state');
    }

    // optional cache to localStorage
    try {
      localStorage.setItem('restaurantInfo', JSON.stringify(resultData));
    } catch (e) { /* ignore */ }

    // success feedback (if you have UI to show)
    if (typeof showSuccessToast === 'function') showSuccessToast('Restaurant info saved');
    else console.info('Restaurant info saved', resultData);

    return true;
  } catch (err: any) {
    console.error('Unexpected error in updateRestaurantInfo:', err);
    alert('Unexpected error while saving. See console for details.');
    return false;
  } finally {
    if (typeof setSaving === 'function') setSaving(false);
  }
};







  const approveReview = async (reviewId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'approveReview',
          reviewId
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadReviews();
        showSuccessToast('Review approved successfully!');
      } else {
        showErrorToast('Error approving review: ' + data.error);
      }
    } catch (error) {
      console.log('Error approving review:', error);
      showErrorToast('Error approving review. Please try again.');
    }
  };





const deleteReview = async (reviewId: number) => {
  // if (!confirm('Are you sure you want to delete this review?')) return;

  // optimistic update
  const prev = reviews;
  setReviews(prevState => prevState.filter(r => Number(r.id) !== Number(reviewId)));

  try {
    const res = await fetch('/api/reviews/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: Number(reviewId) })
    });

    // read raw text so we can log or attempt JSON parse for both ok and non-ok
    const raw = await res.text().catch(() => '');
    let body: any = null;
    try { body = raw ? JSON.parse(raw) : null; } catch (e) { body = { raw }; }

    if (!res.ok) {
      console.error('[deleteReview] server returned non-OK', res.status, body);
      // show server-provided error if any, otherwise a generic message
      const serverMsg = body?.error || body?.message || (body?.raw && String(body.raw)) || 'Unknown server error';
      showErrorToast('Failed to delete review: ' + serverMsg);
      setReviews(prev); // revert optimistic update
      return;
    }

    // res.ok
    if (!body || body.success === false) {
      console.warn('[deleteReview] delete responded but reported failure:', body);
      const serverMsg = body?.error || 'Delete failed';
      showErrorToast('Failed to delete review: ' + serverMsg);
      setReviews(prev); // revert
      return;
    }

    console.log('[deleteReview] success:', body);
    showSuccessToast('Review deleted successfully!');
    // optional: refresh list from server
    await loadReviews();
  } catch (err) {
    // network-level or unexpected JS error
    console.error('[deleteReview] network / unexpected error:', err);
    showErrorToast('Failed to delete review (network). See console for details.');
    setReviews(prev); // revert optimistic update
  }
};








  const addAdmin = (adminData: any) => {
    const newAdmin = {
      id: Date.now(),
      ...adminData,
      role: 'admin',
      addedBy: userType,
      addedDate: new Date().toISOString()
    };
    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
  };

  const removeAdmin = (adminId: number) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      const updatedAdmins = admins.filter(admin => admin.id !== adminId);
      setAdmins(updatedAdmins);
      localStorage.setItem('adminUsers', JSON.stringify(updatedAdmins));
    }
  };

  const toggleFeaturedReview = async (reviewId: number, currentFeatured: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/review-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'toggleFeatured',
          reviewId,
          reviewData: {
            isFeatured: currentFeatured
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadReviews();
        showSuccessToast(`Review ${currentFeatured ? 'unfeatured' : 'featured'} successfully!`);
      } else {
        showErrorToast('Error updating review: ' + data.error);
      }
    } catch (error) {
      console.log('Error updating review:', error);
      showErrorToast('Error updating review. Please try again.');
    }
  };

  if (!isLoggedIn || (userType !== 'admin' && userType !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-lock-line text-4xl text-red-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need admin privileges to access this dashboard.</p>
          <Link href="/login" className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap">
            Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);

  const handleViewCategory = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // 1) Try updating directly in Supabase
      const { error: supaErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (!supaErr) {
        await loadOrders();
        showSuccessToast('Order status updated successfully.');
        return;
      }

      console.warn('Server update failed, falling back to edge function:', supaErr);

      // 2) Fallback: call edge function
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/order-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          orderId,
          status: newStatus
        })
      });

      // If fetch itself failed (network), response.ok might be false
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.warn('Edge function returned non-OK status:', response.status, text);
        showErrorToast('Failed to update order status (network).');
        return;
      }

      const data = await response.json().catch((err) => {
        console.warn('Failed to parse edge function JSON response:', err);
        return null;
      });

      if (data && data.success) {
        await loadOrders();
        showSuccessToast('Order status updated successfully (Edge Function).');
        return;
      }

      console.warn('Edge function update failed:', data?.error || 'unknown');

      // Both Supabase and edge function failed — do NOT touch localStorage (per request).
      showErrorToast('Unable to update order status. Please try again or contact support.');
    } catch (error) {
      console.log('Error updating order status:', error);
      showErrorToast('Error updating order status. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    // if (!confirm('Are you sure you want to cancel and remove this order? This cannot be undone.')) return;

    // prevent double clicks
    if (processingOrderId) {
      console.log('Already processing order:', processingOrderId);
      return;
    }
    setProcessingOrderId(orderId);

    try {
      console.log('Attempting to delete order', orderId);

      // 1) Try direct delete via Supabase client
      const { error: deleteErr } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (!deleteErr) {
        // remove from local UI state quickly
        setOrders(prev => prev.filter(o => o.id !== orderId));

        // remove from localStorage caches if present
        try {
          const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
          localStorage.setItem('allOrders', JSON.stringify((allOrders || []).filter((o: any) => o.id !== orderId)));

          const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
          localStorage.setItem('userOrders', JSON.stringify((userOrders || []).filter((o: any) => o.id !== orderId)));
        } catch (e) {
          console.warn('Failed to update localStorage caches', e);
        }

        await loadOrders(); // refresh from server to be safe
        showSuccessToast('Order removed successfully.');
        return;
      }

      console.warn('Direct delete failed:', deleteErr);

      // 2) Fallback: call edge function (server-side) to perform delete with elevated privileges
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/order-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'deleteOrder',
          orderId
        })
      });
      if (!deleteErr) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        // ... localStorage cleanup ...
        await loadOrders();
        await loadStats(); // <--- add this
        showSuccessToast('Order removed successfully.');
        return;
      }

      if (!response.ok) {
        const txt = await response.text().catch(() => '');
        console.warn('Edge function delete returned non-OK:', response.status, txt);
        showErrorToast('Failed to remove order (network).');
        return;
      }

      const data = await response.json().catch(() => null);
      if (data && data.success) {
        // update local UI & storage
        setOrders(prev => prev.filter(o => o.id !== orderId));
        try {
          const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
          localStorage.setItem('allOrders', JSON.stringify((allOrders || []).filter((o: any) => o.id !== orderId)));

          const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
          localStorage.setItem('userOrders', JSON.stringify((userOrders || []).filter((o: any) => o.id !== orderId)));
        } catch (e) {
          console.warn('Failed to update localStorage caches after edge function', e);
        }

        await loadOrders();
        await loadStats(); // <--- add this
        showSuccessToast('Order removed successfully (Edge Function).');
        showSuccessToast('Order removed successfully (Edge Function).');
        return;
      }

      console.warn('Edge function delete failed:', data?.error || data);
      showErrorToast('Unable to remove order. Please contact support.');
    } catch (error) {
      console.log('Error deleting order:', error);
      showErrorToast('Error removing order. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-blue-400 text-blue-1200';
      case 'preparing': return 'bg-yellow-400 text-yellow-1200';
      case 'ready': return 'bg-orange-400 text-orange-1200';
      case 'on-the-way': return 'bg-purple-400 text-purple-1200';
      case 'completed': return 'bg-green-400 text-green-1200';
      case 'cancelled': return 'bg-red-400 text-red-1200';



      case 'delivery': return 'bg-teal-400 text-teal-1200';
      case 'pickup': return 'bg-cyan-400 text-cyan-1200';



      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userType === 'superadmin' ? 'Owner' : 'Admin'}!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              {userType === 'superadmin' ? 'Owner' : 'Admin'} Panel
            </span>
            {userType === 'superadmin' && (
              <button
                onClick={() => setShowOwnerPanel(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="ri-settings-line mr-2"></i>
                Owner Settings
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 rounded-full p-1 mb-8 max-w-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'overview'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'orders'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu-items')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'menu-items'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${
              activeTab === 'categories'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Categories
          </button>





</div>


<button
    onClick={loadDashboardData}
  className="flex items-center gap-2 px-4 py-2 
  bg-white border border-gray-300 text-gray-700 
  rounded-lg shadow-sm hover:bg-gray-100 
  hover:border-gray-400 transition-colors 
  duration-200"

  >

    <i className="ri-refresh-line"></i>
    <span>Refresh</span>
  </button>


    

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-shopping-bag-line text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Orders</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {activeOrders}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="ri-time-line text-orange-600 text-xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-800">{cancelledOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="ri-close-circle-line text-red-600 text-xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₨{(totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Menu Items</p>
                    <p className="text-2xl font-bold text-gray-800">{menuItems.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="ri-restaurant-line text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'placed')}`}>
                            {(order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1)}
                          </span>

                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor((order?.order_type || 'pickup').toString().toLowerCase())} bg-gray-100`}>
                          {(order?.order_type || 'pickup').toString().replace(/^\w/, (c: string) => c.toUpperCase())}
                        </span>



                        </div>
                        <p className="text-sm text-gray-600">
                          {order.customer.firstName} {order.customer.lastName} - ₨{(order.total || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at || Date.now()).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

<div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">User Questions</h2>

  {loadingQuestions ? (
    <p>Loading…</p>
  ) : (
    <div className="space-y-4">
      {userQuestions.map((q) => (
        <div key={q.id} className="border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800">{q.question}</p>
          {q.is_answered ? (
            <p className="text-green-600 mt-2">{q.answer}</p>
          ) : (
            (userType === 'admin' || userType === 'superadmin') && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  replyToQuestion(q.id, formData.get('answer') as string);
                }}
                className="mt-2 space-y-2"
              >
                <textarea
                  name="answer"
                  className="w-full border p-2 rounded"
                  placeholder="Write reply…"
                  required
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-3 py-1 rounded"
                >
                  Reply
                </button>
              </form>
            )
          )}
        </div>
      ))}
    </div>
  )}
</div>






            {/* Reviews Management (Owner Only) */}
            {userType === 'superadmin' && (













              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{review.customer_name}</h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-yellow-400 text-sm`}
                                ></i>
                              ))}
                            </div>
                            {!review.is_approved && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                Pending
                              </span>
                            )}
                            {review.is_featured && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{review.review_text}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          {!review.is_approved && (
                            <button
                              onClick={() => approveReview(review.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-xs"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => deleteReview(review.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                          >
                            Delete Review
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

{/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">All Orders</h2>

            {/* Search + Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-1 md:col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />

              <div className="flex space-x-2 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="p-3 border border-gray-300 
                  rounded-lg focus:ring-2 focus:ring-orange-500
                  focus:border-orange-500"
                
                
                >
                  <option value="all">All statuses</option>
                  <option value="placed">Placed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="on-the-way">On-the-way</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

              </div>
            </div>

            {/* Filtered Orders */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No matching orders found</p>
                ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'placed')}`}>
                          {(order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1)}
                        </span>




{/* delivery */}




<span className={`text-xs px-2 py-1 rounded-full ${getStatusColor((order?.order_type || 'pickup').toString().toLowerCase())} bg-gray-100`}>
  {(order?.order_type || 'pickup').toString().replace(/^\w/, (c: string) => c.toUpperCase())}
</span>




                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Customer: {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Items: {Array.isArray(order.items) ? order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: ₨{(order.total || 0).toLocaleString()} - {new Date(order.created_at || Date.now()).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">







                    <button
                      onClick={() => handleViewOrder(order)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <i className="ri-eye-line"></i>
                    </button>

{/* 
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <i className="ri-close-circle-line mr-1"></i> Cancel
                      </button>
                    )} */}

                  </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {/* Menu Items Tab */}
        {activeTab === 'menu-items' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Menu Items</h2>
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="bg-orange-600 text-white px-1 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Menu Item
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {menuItems.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-restaurant-line text-2xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-500 mb-4">No menu items yet</p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                    >
                      Add First Item
                    </button>
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.image_url || 'https://readdy.ai/api/search-image?query=delicious%20nepali%20food%20dish%20traditional%20authentic%20restaurant%20quality%20presentation%20simple%22clean%20background&width=120&height=120&seq=menu-item&orientation=squarish'} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">{item.category?.name || 'No Category'}</p>
                            <p className="text-lg font-bold text-orange-600">₨{item.price}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{item.preparation_time || 15} min prep</span>
                        {item.is_vegetarian && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Vegetarian
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditItemModal(true);
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {/* Categories Tab */}
        
        
        
        
        
        
{activeTab === "categories" && (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Menu Categories</h2>
        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          Add Category
        </button>
      </div>

      {/* Category List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-3 text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-1">
              <i className="ri-folder-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 mb-4">No categories yet</p>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
            >
              Add First Category
            </button>
          </div>
        ) : (
          categories.map((category) => {
            // compute icon source (URL or Supabase publicUrl)
            let iconSrc: string | null = null;
            if (category.icon) {
              if (
                category.icon.startsWith("http://") ||
                category.icon.startsWith("https://") ||
                category.icon.startsWith("data:")
              ) {
                iconSrc = category.icon;
              } else {
                const { data } = supabase
                  .storage
                  .from("menu-images")
                  .getPublicUrl(category.icon);
                iconSrc = data?.publicUrl ?? null;
              }
            }

            return (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                      {iconSrc ? (
                        <img
                          src={iconSrc}
                          alt={category.name}
                          className="w-8 h-8 object-cover rounded-full"
                          onError={(e) =>
                            ((e.currentTarget as HTMLImageElement).style.display =
                              "none")
                          }
                        />
                      ) : (
                        <i className="ri-restaurant-line text-orange-600"></i>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">
                        {
                          menuItems.filter(
                            (item) => item.category_id === category.id
                          ).length
                        }{" "}
                        items
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewCategory(category)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEditCategoryModal(true);
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}

      </div>




    </div>








    
  </div>










)}


      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form 
              id="addCategoryForm"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleAddCategory({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  icon: formData.get('icon') as string || 'ri-restaurant-line',
                  displayOrder: parseInt(formData.get('displayOrder') as string) || 99
                });
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Appetizers"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
{/* Icon (upload) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Optional)</label>

  <div className="flex items-center space-x-3">
    {/* allow pasting a url directly (user may prefer url) */}
    <input
      type="text"
      name="iconUrl"
      defaultValue={selectedCategory?.icon ?? ''}
      placeholder="https://example.com/icon.png (or leave blank to upload)"
      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />

    {/* file picker label */}
    <label
      htmlFor="add-category-icon-file"
      className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
    >
      <i className="ri-upload-line mr-2"></i>
      <span className="text-sm">Choose file</span>
    </label>

    {/* hidden file input — unique id so it doesn't clash with other pickers */}
    <input
      id="add-category-icon-file"
      type="file"
      accept="image/*"
      onChange={(e) => handleFileSelectFromFile(e.target.files?.[0] ?? null)}
      className="hidden"
    />
  </div>

  {/* hidden input that the form will submit as `icon` — we set its value to the uploadedImageUrl (if any) */}
  <input type="hidden" name="icon" value={uploadedImageUrl ?? ''} />

  {/* Upload controls + preview (reuses your existing upload helpers/state) */}
  <div className="mt-4">
    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !pickedFile}
        className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
      >
        Upload
      </button>

      <button
        type="button"
        onClick={debugUploadRaw}
        className="px-3 py-2 bg-gray-100 rounded"
      >
        Debug Raw
      </button>

      {uploading && <span className="text-sm text-gray-500">Uploading image…</span>}
    </div>

    {/* picked-file preview */}
    {pickedFile && (
      <div className="mt-3 flex items-center space-x-4">
        {previewUrl && <img src={previewUrl} alt="preview" className="w-24 h-24 object-cover rounded" />}
        <div>
          <div className="font-medium">{pickedFile.name}</div>
          <div className="text-sm text-gray-500">{(pickedFile.size / 1024).toFixed(1)} KB</div>
        </div>
      </div>
    )}

    {/* uploaded image preview (final URL) */}
    {uploadedImageUrl && (
      <div className="mt-3">
        <img src={uploadedImageUrl} alt="Preview" className="w-32 h-24 object-cover rounded-md border" />
        <p className="text-xs text-gray-500 mt-1 break-all">{uploadedImageUrl}</p>
      </div>
    )}

    {uploadError && <div className="mt-2 text-sm text-red-600">Upload error: {uploadError}</div>}
  </div>
</div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of this category"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Category</h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleEditCategory({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                icon: formData.get('icon') as string,
                displayOrder: parseInt(formData.get('displayOrder') as string) || 99
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedCategory.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
                  
{/* Icon (upload) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Optional)</label>

  <div className="flex items-center space-x-3">
    {/* allow pasting a url directly (user may prefer url) */}
    <input
      type="text"
      name="iconUrl"
      defaultValue={selectedCategory?.icon ?? ''}
      placeholder="https://example.com/icon.png (or leave blank to upload)"
      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />

    {/* file picker label */}
    <label
      htmlFor="add-category-icon-file"
      className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
    >
      <i className="ri-upload-line mr-2"></i>
      <span className="text-sm">Choose file</span>
    </label>

    {/* hidden file input — unique id so it doesn't clash with other pickers */}
    <input
      id="add-category-icon-file"
      type="file"
      accept="image/*"
      onChange={(e) => handleFileSelectFromFile(e.target.files?.[0] ?? null)}
      className="hidden"
    />
  </div>

  {/* hidden input that the form will submit as `icon` — we set its value to the uploadedImageUrl (if any) */}
  <input type="hidden" name="icon" value={uploadedImageUrl ?? ''} />

  {/* Upload controls + preview (reuses your existing upload helpers/state) */}
  <div className="mt-4">
    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !pickedFile}
        className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
      >
        Upload
      </button>

      <button
        type="button"
        onClick={debugUploadRaw}
        className="px-3 py-2 bg-gray-100 rounded"
      >
        Debug Raw
      </button>

      {uploading && <span className="text-sm text-gray-500">Uploading image…</span>}
    </div>

    {/* picked-file preview */}
    {pickedFile && (
      <div className="mt-3 flex items-center space-x-4">
        {previewUrl && <img src={previewUrl} alt="preview" className="w-24 h-24 object-cover rounded" />}
        <div>
          <div className="font-medium">{pickedFile.name}</div>
          <div className="text-sm text-gray-500">{(pickedFile.size / 1024).toFixed(1)} KB</div>
        </div>
      </div>
    )}

    {/* uploaded image preview (final URL) */}
    {uploadedImageUrl && (
      <div className="mt-3">
        <img src={uploadedImageUrl} alt="Preview" className="w-32 h-24 object-cover rounded-md border" />
        <p className="text-xs text-gray-500 mt-1 break-all">{uploadedImageUrl}</p>
      </div>
    )}

    {uploadError && <div className="mt-2 text-sm text-red-600">Upload error: {uploadError}</div>}
  </div>
</div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={selectedCategory.description}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Menu Item</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddMenuItem({
                categoryId: formData.get('categoryId') as string,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                imageUrl: uploadedImageUrl || (formData.get('imageUrl') as string || ''),
                ingredients: formData.get('ingredients') as string,
                isVegetarian: formData.get('isVegetarian') === 'on',
                preparationTime: parseInt(formData.get('preparationTime') as string) || 15,
                isAvailable: formData.get('isAvailable') !== 'off'
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="categoryId"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Chicken Momo"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief description of the dish"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₨)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    placeholder="250"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (min)</label>
                  <input
                    type="number"
                    name="preparationTime"
                    min="1"
                    defaultValue="15"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>




<div className="mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Image (URL or upload)</label>

<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleFileInputChange} // <-- typed handler
  className="mb-2"
/>


  {previewUrl && (
    <img src={previewUrl} alt="preview" className="w-40 h-28 object-cover rounded mb-2" />
  )}

  <div className="flex items-center space-x-2">
    <button
      type="button"
      onClick={handleUpload}
      disabled={!pickedFile || uploading}
      className="px-4 py-2 bg-orange-600 text-white rounded"
    >
      {uploading ? 'Uploading…' : 'Upload & Compress'}
    </button>

    <button
      type="button"
      onClick={() => {
        setPickedFile(null); setPreviewUrl(null); setUploadedImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }}
      className="px-3 py-2 border rounded"
    >
      Clear
    </button>
  </div>

  {uploadedImageUrl && (
    <p className="text-sm text-green-600 mt-2">
      Uploaded: <a href={uploadedImageUrl} target="_blank" rel="noreferrer" className="underline">{uploadedImageUrl}</a>
    </p>
  )}
  {uploadError && <p className="text-sm text-red-600 mt-2">{uploadError}</p>}
</div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (Optional)</label>
                <input
                  type="text"
                  name="ingredients"
                  placeholder="Chicken, flour, onions, spices"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input type="checkbox" name="isVegetarian" className="mr-2 w-4 h-4 text-orange-600" />
                  <span className="text-sm">Vegetarian</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="isAvailable" defaultChecked className="mr-2 w-4 h-4 text-orange-600" />
                  <span className="text-sm">Available</span>
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
     







{showEditItemModal && selectedItem && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Edit Menu Item</h3>
        <button
          onClick={() => setShowEditItemModal(false)}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="Close edit modal"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleEditMenuItem({
            categoryId: formData.get('categoryId') as string,
            name: (formData.get('name') as string) || '',
            description: (formData.get('description') as string) || '',
            price: parseFloat(formData.get('price') as string),
            // prefer uploadedImageUrl if available, otherwise use the URL from input, otherwise empty string
            imageUrl: uploadedImageUrl || (formData.get('imageUrl') as string) || '',

            ingredients: (formData.get('ingredients') as string) || '',
            isVegetarian: formData.get('isVegetarian') === 'on',
            preparationTime: parseInt(formData.get('preparationTime') as string) || 15,
            isAvailable: formData.get('isAvailable') === 'on',
            // include id so handler knows which to update
            id: selectedItem.id
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            name="categoryId"
            defaultValue={selectedItem.category_id ?? ''}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
          <input
            type="text"
            name="name"
            defaultValue={selectedItem.name}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={selectedItem.description}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₨)</label>
            <input
              type="number"
              name="price"
              min="0"
              step="1"
              defaultValue={selectedItem.price}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (min)</label>
            <input
              type="number"
              name="preparationTime"
              min="1"
              defaultValue={selectedItem.preparation_time}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Image URL + file upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>

          <div className="flex items-center space-x-3">
            <input
              type="url"
              name="imageUrl"
              defaultValue={selectedItem.image_url ?? ''}
              placeholder="https://example.com/image.jpg"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />

            {/* file upload label (click opens file picker) */}
            <label
              htmlFor="edit-item-file"
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <i className="ri-upload-line mr-2"></i>
              <span className="text-sm">Choose file</span>
            </label>

            {/* actual hidden file input */}
            <input
              id="edit-item-file"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelectFromFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>

          {/* Upload controls & preview area */}
          <div className="mt-4">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !pickedFile}
                className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={debugUploadRaw}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                Debug Raw
              </button>

              {uploading && <span className="text-sm text-gray-500">Uploading image…</span>}
            </div>

            {/* picked-file preview */}
            {pickedFile && (
              <div className="mt-3 flex items-center space-x-4">
                {previewUrl && (
                  <img src={previewUrl} alt="preview" className="w-24 h-24 object-cover rounded" />
                )}
                <div>
                  <div className="font-medium">{pickedFile.name}</div>
                  <div className="text-sm text-gray-500">{(pickedFile.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            )}

            {/* uploaded image preview (final URL) */}
            {uploadedImageUrl && (
              <div className="mt-3">
                <img src={uploadedImageUrl} alt="Preview" className="w-32 h-24 object-cover rounded-md border" />
                <p className="text-xs text-gray-500 mt-1 break-all">{uploadedImageUrl}</p>
              </div>
            )}

            {/* upload error */}
            {uploadError && <div className="mt-2 text-sm text-red-600">Upload error: {uploadError}</div>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients (Optional)</label>
          <input
            type="text"
            name="ingredients"
            defaultValue={selectedItem.ingredients ?? ''}
            placeholder="Chicken, flour, onions, spices"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isVegetarian"
              defaultChecked={selectedItem.is_vegetarian}
              className="mr-2 w-4 h-4 text-orange-600"
            />
            <span className="text-sm">Vegetarian</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={selectedItem.is_available}
              className="mr-2 w-4 h-4 text-orange-600"
            />
            <span className="text-sm">Available</span>
          </label>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowEditItemModal(false)}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
          >
            Update Item
          </button>
        </div>
      </form>
    </div>
  </div>
)}











      {/* Owner Settings Modal */}
      {showOwnerPanel && userType === 'superadmin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Owner Settings</h2>
                <button
                  onClick={() => setShowOwnerPanel(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Restaurant Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Restaurant Information</h3>
                    <button
                      onClick={() => setShowRestaurantInfoModal(true)}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">

                    
                    <p><strong>Name:</strong> {restaurantInfo?.name ?? '-'}</p>
                    <p><strong>Phone:</strong> {restaurantInfo?.phone ?? '-'}</p>
                    <p><strong>Email:</strong> {restaurantInfo?.email ?? '-'}</p>
                    <p><strong>Address:</strong> {restaurantInfo?.address ?? '-'}</p>
                  
                  
                  
                  </div>
                </div>

                {/* Admin Management */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Admin Management</h3>
                    <button
                      onClick={() => setShowAdminModal(true)}
                      className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 cursor-pointer text-sm"
                    >
                      Add Admin
                    </button>
                  </div>
                  <div className="space-y-2">
                    {admins.length === 0 ? (
                      <p className="text-gray-500 text-sm">No admins added yet</p>
                    ) : (
                      admins.map((admin) => (
                        <div key={admin.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                          </div>
                          <button
                            onClick={() => removeAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Review Management Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Review Management</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.approved).length}</p>
                      <p className="text-gray-600">Approved</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">{reviews.filter(r => !r.approved).length}</p>
                      <p className="text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Info Modal */}
      {showRestaurantInfoModal && restaurantInfo ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Restaurant Info</h3>
              <button
                onClick={() => setShowRestaurantInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
// add id from restaurantInfo so function updates instead of inserting
updateRestaurantInfo({
  id: restaurantInfo?.id ?? null,
  name: String(formData.get('name') ?? ''),
  phone: String(formData.get('phone') ?? ''),
  email: String(formData.get('email') ?? ''),
  address: String(formData.get('address') ?? ''),
  coordinates: String(formData.get('coordinates') ?? '')
});


            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={restaurantInfo?.name ?? '-'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={restaurantInfo?.phone ?? '-'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={restaurantInfo?.email ?? '-'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={restaurantInfo?.address ?? '-'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates (lat, lng)</label>
                <input
                  type="text"
                  name="coordinates"
                  defaultValue={restaurantInfo?.coordinates ?? '-'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="28.22886241546525, 83.99098268394296"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRestaurantInfoModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      ): null}

      {/* Add Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Admin</h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              addAdmin({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string
              });
              setShowAdminModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
{showCategoryModal && selectedCategory && (() => {
  // compute selected category icon src (same logic)
  const selRaw = selectedCategory.icon ?? '';
  let selectedIconSrc: string | null = (typeof categoryIconMap !== 'undefined') ? categoryIconMap[selectedCategory.id] : null;

  if (!selectedIconSrc && selRaw) {
    if (typeof selRaw === 'string' && (selRaw.startsWith('http://') || selRaw.startsWith('https://') || selRaw.startsWith('data:'))) {
      selectedIconSrc = selRaw;
    } else {
      try {
        const { data } = supabase.storage.from('menu-images').getPublicUrl(String(selRaw));
        selectedIconSrc = data?.publicUrl ?? null;
      } catch (err) {
        console.warn('getPublicUrl error for selected category', selRaw, err);
        selectedIconSrc = null;
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Category Details</h2>
            <button
              onClick={() => setShowCategoryModal(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedIconSrc ? (
                    <img
                      src={selectedIconSrc}
                      alt={selectedCategory.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <i className={`${selectedCategory.icon || 'ri-restaurant-line'} text-3xl text-orange-600`}></i>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold">{selectedCategory.name}</h3>
                  <p className="text-gray-600">
                    {menuItems.filter(item => item.category_id === selectedCategory.id).length} items in this category
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{selectedCategory.description}</p>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">
                    {menuItems.filter(item => item.category_id === selectedCategory.id).length}
                  </p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">
                    {menuItems.filter(item => item.category_id === selectedCategory.id && item.is_available).length}
                  </p>
                  <p className="text-sm text-gray-600">Available Items</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Items in this Category</h4>
              <div className="space-y-3">
                {(() => {
                  const categoryItems = menuItems.filter(item => item.category_id === selectedCategory.id);

                  if (categoryItems.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-shopping-bag-line text-2xl text-gray-400"></i>
                        </div>
                        <p className="text-gray-500 mb-4">No items in this category yet</p>
                        <button
                          onClick={() => {
                            setShowCategoryModal(false);
                            setShowAddItemModal(true);
                          }}
                          className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                        >
                          Add First Item
                        </button>
                      </div>
                    );
                  }

                  return categoryItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image_url || 'https://via.placeholder.com/120x120?text=Dish'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <h5 className="font-semibold">{item.name}</h5>
                          <p className="text-sm text-gray-600">₨{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowCategoryModal(false);
                            setShowEditItemModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setShowAddItemModal(true);
                }}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 cursor-pointer whitespace-nowrap"
              >
                Add New Item
              </button>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setShowEditCategoryModal(true);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                Edit Category
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})()}


      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

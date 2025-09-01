'use client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;


import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);



export class SupabaseService {
  private static instance: SupabaseService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = SUPABASE_URL;
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}/functions/v1/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Authentication
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: any;
    userType?: string;
  }) {
    return this.makeRequest('auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        ...userData
      }),
    });
  }

  async login(email: string, password: string) {
    return this.makeRequest('auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        email,
        password
      }),
    });
  }

  // Menu
  async getMenu() {
    return this.makeRequest('menu?action=get_menu');
  }

  // Orders
  async createOrder(orderData: any) {
    return this.makeRequest('orders?action=create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(userId?: string, userEmail?: string) {
    const params = new URLSearchParams();
    params.append('action', 'get_user_orders');
    if (userId) params.append('userId', userId);
    if (userEmail) params.append('userEmail', userEmail);
    
    return this.makeRequest(`orders?${params.toString()}`);
  }

  async getAllOrders() {
    return this.makeRequest('orders?action=get_all_orders');
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`orders?action=get_order&orderId=${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.makeRequest('orders?action=update_status', {
      method: 'POST',
      body: JSON.stringify({ orderId, status }),
    });
  }

  // Reviews
  async createReview(reviewData: {
    name: string;
    email: string;
    rating: number;
    text: string;
    userId?: string;
  }) {
    return this.makeRequest('reviews?action=create', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getApprovedReviews() {
    return this.makeRequest('reviews?action=get_approved');
  }

  async getAllReviews() {
    return this.makeRequest('reviews?action=get_all');
  }

  async approveReview(reviewId: number) {
    return this.makeRequest('reviews?action=approve', {
      method: 'POST',
      body: JSON.stringify({ reviewId }),
    });
  }

  async deleteReview(reviewId: number) {
    return this.makeRequest(`reviews?reviewId=${reviewId}`, {
      method: 'DELETE',
    });
  }
}

export const supabaseService = SupabaseService.getInstance();
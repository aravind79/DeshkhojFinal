export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const API_BASE = API_URL.replace('/api', '');

type FetchOptions = RequestInit & { params?: Record<string, string | number | undefined> };

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  let url = `${API_URL}${path}`;
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') search.append(k, String(v));
    });
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

// ---------- Auth ----------
export const api = {
  auth: {
    login: (username: string, password: string) =>
      apiFetch<{ success: boolean; token: string; data: { id: number; username: string; name: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ username, password }) }
      ),
    register: (body: { username: string; password: string; name?: string; mobile: string; email?: string }) =>
      apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: (token: string) =>
      apiFetch('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  },

  // ---------- Locations ----------
  locations: {
    states: () => apiFetch<{ success: boolean; data: { id: number; state_name: string; slug: string }[] }>('/locations/states'),
    districts: (state_id?: number) =>
      apiFetch<{ success: boolean; data: { id: number; district_name: string; slug: string; state_id: number }[] }>(
        '/locations/districts',
        { params: { state_id } }
      ),
    blocks: (district_id?: number) =>
      apiFetch<{ success: boolean; data: { id: number; block_name: string; slug: string; district_id: number }[] }>(
        '/locations/blocks',
        { params: { district_id } }
      ),
    villages: (block_id?: number) =>
      apiFetch<{ success: boolean; data: { id: number; village_name: string; slug: string; block_id: number }[] }>(
        '/locations/villages',
        { params: { block_id } }
      ),
  },

  // ---------- Categories ----------
  categories: {
    list: () =>
      apiFetch<{ success: boolean; data: { id: number; cat_name: string; slug: string }[] }>('/categories'),
  },

  // ---------- Businesses ----------
  businesses: {
    search: (params: {
      q?: string;
      loc?: string;
      category?: string;
      state_id?: number;
      district_id?: number;
      block_id?: number;
      page?: number;
      limit?: number;
    }) =>
      apiFetch<{
        success: boolean;
        data: Business[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>('/businesses', { params: params as Record<string, string | number | undefined> }),
    getById: (id: number | string) =>
      apiFetch<{ success: boolean; data: BusinessDetail }>(`/businesses/${id}`),
    register: (body: Partial<Business>) =>
      apiFetch('/businesses', { method: 'POST', body: JSON.stringify(body) }),
    uploadImage: (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return fetch(`${API_URL}/businesses/upload`, {
        method: 'POST',
        body: formData,
      }).then((res) => res.json());
    },
    reviews: {
      get: (id: number | string) => apiFetch<{ success: boolean; data: Review[] }>(`/businesses/${id}/reviews`),
      add: (id: number | string, body: { user_name: string; rating: number; comment: string }) =>
        apiFetch(`/businesses/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
    },
    getStats: () => apiFetch<{ success: boolean; data: { totalBusinesses: number; activeBusinesses: number; users: number; pending: number; products: number; states: number; towns: number } }>('/businesses/stats')
  },

  // ---------- Products ----------
  products: {
    list: (params: { shop_id?: number; q?: string; page?: number; limit?: number }) =>
      apiFetch<{
        success: boolean;
        data: Product[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>('/products', { params: params as Record<string, string | number | undefined> }),
  },

  // ---------- Admin ----------
  admin: {
    stats: (token: string) =>
      apiFetch<{ success: boolean; data: { businesses: number; users: number; pendingRegistrations: number; products: number } }>(
        '/admin/stats',
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    businesses: (token: string, page = 1) =>
      apiFetch<{ success: boolean; data: Business[] }>('/admin/businesses', {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
      }),
    pendingRegistrations: (token: string) =>
      apiFetch<{ success: boolean; data: Business[] }>('/admin/pending-registrations', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    approve: (token: string, id: number, action: 'approve' | 'reject') =>
      apiFetch<{ success: boolean; message: string }>(`/admin/businesses/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
        headers: { Authorization: `Bearer ${token}` },
      }),
    updateBusiness: (token: string, id: number, body: Partial<Business>) =>
      apiFetch<{ success: boolean; message: string }>(`/admin/businesses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${token}` },
      }),
    deleteBusiness: (token: string, id: number) =>
      apiFetch<{ success: boolean; message: string }>(`/admin/businesses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // ---------- Inquiries ----------
  inquiries: {
    submit: (body: {
      shop_id: number;
      name: string;
      business_name?: string;
      phone_number: string;
      category?: string;
      interested_product?: string;
      description?: string;
    }) => apiFetch<{ success: boolean; message: string }>('/inquiries', { method: 'POST', body: JSON.stringify(body) }),
  },

  // ---------- Messages ----------
  messages: {
    send: (body: { name: string; email: string; message: string }) =>
      apiFetch<{ success: boolean; message: string }>('/messages', { method: 'POST', body: JSON.stringify(body) }),
  },
};

// ---------- Types ----------
export interface Business {
  id: number;
  dukaan_name: string;
  dukaan_addr: string;
  dukaandar_name: string;
  contact_no: string;
  dukaan_desc: string;
  email: string;
  shop_categories: string;
  paid: number;
  main_photo?: string;
  state_id?: number;
  district_id?: number;
  business_type?: string;
  gst_no?: string;
  payment_modes?: string;
  gallery?: string;
  whatsapp?: string;
  pincode?: string;
  block_id?: string | number;
  category_1?: string;
  category_2?: string;
  category_3?: string;
  years_established?: number;
  products?: any[];
  avg_rating?: number;
  review_count?: number;
}

export interface BusinessDetail extends Business {
  photos: { id: number; photo_name: string }[];
  products: Product[];
}

export interface Product {
  id: number;
  prod_name: string;
  prod_desc: string;
  prod_amt: string;
  quantity?: number;
  unit?: string;
  shop_id: number;
  shop_name?: string;
  shop_address?: string;
}

export interface Review {
  id: number;
  shop_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

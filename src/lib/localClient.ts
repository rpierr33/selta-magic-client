// Local database client to replace Supabase

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  original_price?: number;
  description?: string;
  image?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

class LocalDBClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Auth methods
  // Map snake_case user from API to camelCase for frontend
  private mapUser(user: any): User | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || user.first_name || '',
      lastName: user.lastName || user.last_name || '',
      role: user.role || 'user',
    };
  }

  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (data.token) {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
      }

      return { user: this.mapUser(data.user), token: data.token, error: data.error || null };
    } catch (error) {
      return { user: null, token: null, error: 'Network error' };
    }
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.token) {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
      }

      return { user: this.mapUser(data.user), token: data.token, error: data.error || null };
    } catch (error) {
      return { user: null, token: null, error: 'Network error' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        });
      }

      this.token = null;
      localStorage.removeItem('auth_token');
      return { error: null };
    } catch (error) {
      return { error: 'Signout failed' };
    }
  }

  async getSession(): Promise<{ user: User | null; error: string | null }> {
    if (!this.token) {
      return { user: null, error: null };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      return { user: this.mapUser(data.user), error: data.error || null };
    } catch (error) {
      return { user: null, error: 'Session check failed' };
    }
  }

  // Auth state change listener (simplified for local implementation)
  onAuthStateChange(callback: (event: string, session: { user: User | null } | null) => void) {
    // For simplicity, we'll just call the callback with current state
    this.getSession().then(({ user }) => {
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }

  // Database methods
  from(table: string) {
    return {
      select: (columns?: string) => {
        const selectQuery = {
          eq: (column: string, value: any) => ({
            single: async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/${table}?${column}=${value}&select=${columns || '*'}&single=true`, {
                  headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
                });
                const data = await response.json();
                return { data: data.data || null, error: data.error || null };
              } catch (error) {
                return { data: null, error: 'Database query failed' };
              }
            }
          })
        };

        const selectAll = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/${table}?select=${columns || '*'}`, {
              headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
            });
            const data = await response.json();
            return { data: data.data || [], error: data.error || null };
          } catch (error) {
            return { data: [], error: 'Database query failed' };
          }
        };

        return Object.assign(selectAll, selectQuery);
      },

      insert: async (data: any) => {
        try {
          const response = await fetch(`${API_BASE_URL}/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
            },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return { data: result.data || null, error: result.error || null };
        } catch (error) {
          return { data: null, error: 'Database insert failed' };
        }
      },

      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/${table}/${value}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
                },
                body: JSON.stringify(data),
              });
              const result = await response.json();
              return { data: result.data || null, error: result.error || null };
            } catch (error) {
              return { data: null, error: 'Database update failed' };
            }
          }
        })
      }),

      delete: () => ({
        eq: (column: string, value: any) => ({
          select: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/${table}/${value}`, {
                method: 'DELETE',
                headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
              });
              const result = await response.json();
              return { data: result.data || null, error: result.error || null };
            } catch (error) {
              return { data: null, error: 'Database delete failed' };
            }
          }
        })
      })
    };
  }
}

export const localClient = new LocalDBClient();

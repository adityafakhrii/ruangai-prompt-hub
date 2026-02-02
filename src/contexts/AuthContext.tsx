import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as jose from 'jose';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  loading: boolean;
  role: 'admin' | 'teman_rai' | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'teman_rai' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check for token in URL (prioritize heroic_token, then token, then session)
        const urlToken = searchParams.get('heroic_token') || searchParams.get('token') || searchParams.get('session');

        // 2. Check for token in localStorage
        const localToken = localStorage.getItem('heroic_token');

        const tokenToVerify = urlToken || localToken;
        // Debugging logs
        console.log("Token to verify:", tokenToVerify ? "Found" : "Missing");

        // Make sure secret is available. If env is missing, this will throw the empty key error.
        const jwtSecret = import.meta.env.VITE_JWT_SECRET;
        if (!jwtSecret) {
          console.error("VITE_JWT_SECRET is missing in .env!");
          setLoading(false);
          return;
        }

        if (tokenToVerify) {
          const secret = new TextEncoder().encode(jwtSecret);

          try {
            const { payload } = await jose.jwtVerify(tokenToVerify, secret);

            // Construct User object from specific claims
            const userId = (payload.user_id as string) || (payload.sub as string) || 'unknown';
            const mockUser: User = {
              id: userId,
              email: payload.email as string,
              app_metadata: {},
              user_metadata: {
                ...payload,
                whatsapp_number: payload.whatsapp_number,
                isValidEmail: payload.isValidEmail,
                full_name: (payload.user_metadata as { full_name?: string })?.full_name || payload.name || payload.email // Try to find a name for navbar
              },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              role: 'authenticated'
            } as User;

            const mockSession: Session = {
              access_token: tokenToVerify,
              token_type: 'bearer',
              user: mockUser,
              expires_in: (payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 3600),
              refresh_token: '',
              expires_at: payload.exp || Math.floor(Date.now() / 1000) + 3600,
            };

            setUser(mockUser);
            setSession(mockSession);

            // Persist valid token
            localStorage.setItem('heroic_token', tokenToVerify);

            // Set Supabase session
            supabase.auth.setSession({
              access_token: tokenToVerify,
              refresh_token: '',
            });

            // Fetch user role from profiles
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();

            if (profileData) {
              setRole(profileData.role as 'admin' | 'teman_rai');
            } else if (profileError) {
               console.warn("Could not fetch profile role:", profileError);
               // Default to teman_rai if profile not found/error, or handle creation?
               // For now, assume teman_rai
               setRole('teman_rai');
            }

            // Clean URL if token was there. IMPORTANT: Do this AFTER setting state
            if (urlToken) {
              // Use setSearchParams to clear params without page reload or losing state context
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('heroic_token');
              newParams.delete('token');
              newParams.delete('session');
              setSearchParams(newParams, { replace: true });
            }

          } catch (error) {
            console.error('Invalid token verification:', error);
            // Only clear if we were trying to use a stored token that is now invalid
            // If it was a bad URL token, we just don't log them in
            if (localToken && !urlToken) {
              localStorage.removeItem('heroic_token');
            }
            setUser(null);
            setSession(null);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [searchParams, setSearchParams]);

  const signOut = async () => {
    localStorage.removeItem('heroic_token');
    localStorage.removeItem('ruangai_session'); // Clean up old key if exists
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    window.location.href = 'https://ruangai.codepolitan.com/logout';
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut, loading, role, isAdmin: role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

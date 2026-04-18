import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  clienteId: number | null;
  nomClinica: string | null;
  plano: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  clienteId: null,
  nomClinica: null,
  plano: null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [nomClinica, setNomClinica] = useState<string | null>(null);
  const [plano, setPlano] = useState<string | null>(null);

  const fetchClienteData = async (email: string | undefined) => {
    if (!email) {
      setClienteId(null);
      setNomClinica(null);
      setPlano(null);
      return;
    }
    try {
      const { data } = await supabase
        .from("clientes")
        .select("cliente_id, plano, nome_clinica")
        .eq("email", email)
        .maybeSingle();
      if (data) {
        setClienteId(data.cliente_id);
        setNomClinica(data.nome_clinica);
        setPlano(data.plano);
      }
    } catch (e) {
      console.error("Erro ao buscar cliente:", e);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        // defer to avoid deadlock
        setTimeout(() => fetchClienteData(session.user.email), 0);
      } else {
        setClienteId(null);
        setNomClinica(null);
        setPlano(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        fetchClienteData(session.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setClienteId(null);
    setNomClinica(null);
    setPlano(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, clienteId, nomClinica, plano, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

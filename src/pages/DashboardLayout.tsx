import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import PlanIndicator from "@/components/dashboard/PlanIndicator";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";
import GlobalSearch from "@/components/dashboard/GlobalSearch";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Search, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const mockNotifications = [
  { emoji: "🚨", text: "Nova escalação — Maria Santos enviou mensagem" },
  { emoji: "📅", text: "Agendamento confirmado — João Ferreira, amanhã 14h" },
  { emoji: "💳", text: "Faturação em 3 dias — €129 em 28 Abr" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { signOut, clienteId } = useAuth();

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Load initial unread count + Realtime subscriptions
  useEffect(() => {
    if (!clienteId) return;

    (async () => {
      const { count } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("cliente_id", clienteId)
        .eq("lida", false);
      if (typeof count === "number") setNotifCount(count);
    })();

    const escChannel = supabase
      .channel(`escalacoes-${clienteId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "escalacoes",
        filter: `cliente_id=eq.${clienteId}`,
      }, () => {
        setNotifCount(prev => prev + 1);
      })
      .subscribe();

    const notifChannel = supabase
      .channel(`notificacoes-${clienteId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notificacoes",
        filter: `cliente_id=eq.${clienteId}`,
      }, () => {
        setNotifCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(escChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [clienteId]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full pt-16">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-4 border-b border-border px-4">
            <SidebarTrigger />
            <div className="flex-1">
              <PlanIndicator />
            </div>

            {/* Search */}
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </Button>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={18} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {notifCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {mockNotifications.map((n, i) => (
                  <DropdownMenuItem key={i} className="py-3">
                    <span className="mr-2">{n.emoji}</span>
                    <span className="text-sm">{n.text}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/notificacoes" className="text-sm text-primary justify-center">
                    Ver todas as notificações
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="active:scale-95 transition-transform duration-100">
              <LogOut size={16} /> Sair
            </Button>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <OnboardingWizard />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import {
  LayoutDashboard, Users, MessageSquare, Calendar,
  CheckSquare, BarChart2, Settings, Bell, LogOut,
  Menu, X, Sparkles, ChevronRight, Zap, Target
} from 'lucide-react';

const mentorNavItems = [
  { href: '/mentor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mentor/students', label: 'Students', icon: Users },
  { href: '/mentor/chat', label: 'Chat', icon: MessageSquare },
  { href: '/mentor/sessions', label: 'Sessions', icon: Calendar },
  { href: '/mentor/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/mentor/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function MentorLayout({ children, title = 'Mentor Dashboard' }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'mentor') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'M';

  if (!user || user.role !== 'mentor') return <div className="h-screen flex items-center justify-center">Redirecting...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-[#111827]/30 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full z-50 w-64 lg:w-72 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0 overflow-y-auto' : '-translate-x-full'} bg-[#FFFFFF] border-r border-[#E5E7EB]`}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-8">
          <Link href="/mentor" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" 
              style={{ background: 'linear-gradient(135deg, #0A66C2, #00C4B4)' }}>
              <Zap size={20} className="text-white fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#111827] text-lg leading-tight tracking-tight" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>Mentra AI</span>
              <span className="text-[#00C4B4] text-[10px] uppercase font-700 tracking-[0.2em] mt-0.5">Mentor Portal</span>
            </div>
          </Link>
          <button className="lg:hidden p-2 text-[#E5E7EB] hover:text-[#111827] transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto">
          {mentorNavItems.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-500 transition-all duration-200 group ${active ? 'bg-[#0A66C2]/5 text-[#0A66C2]' : 'text-slate-500 hover:text-[#111827] hover:bg-[#F9FAFB]'}`}
                style={{ fontWeight: active ? 600 : 500 }}
                onClick={() => setSidebarOpen(false)}>
                <Icon size={19} className={`${active ? 'text-[#0A66C2]' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
                <span className="flex-1">{label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-[#0A66C2] shadow-[0_0_8px_#0A66C2AA]" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card (Bottom Section) */}
        <div className="p-4 mx-4 mb-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] group transition-all hover:border-[#0A66C2]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#0A66C2] font-700 text-sm shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-600 text-[#111827] truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-500">Professional Mentor</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <button onClick={() => router.push('/mentor/settings')} className="text-slate-400 hover:text-[#0A66C2] transition-colors p-1" title="Settings">
              <Settings size={18} />
            </button>
            <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-[#111827] transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-700 text-[#111827]" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-500 tracking-wide uppercase">
                <Target size={12} className="text-[#00C4B4]" />
                <span>Productivity Track: Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Assistant Summary Tool */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#00C4B4]/5 border border-[#00C4B4]/10 text-[#00C4B4] text-xs font-600 transition-all cursor-default">
              <Sparkles size={14} className="animate-pulse" />
              <span>AI Insights Active</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-10 h-10 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-slate-500 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 transition-all">
                <Bell size={18} />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-900">2</div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto bg-[#FFFFFF] p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        
        .card-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px -10px rgba(10, 102, 194, 0.1);
          border-color: #0A66C222;
        }
      `}</style>
    </div>
  );
}

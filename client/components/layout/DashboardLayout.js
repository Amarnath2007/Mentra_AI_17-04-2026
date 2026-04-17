import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';
import {
  LayoutDashboard, MessageSquare, Bot, BookOpen, Brain,
  Trophy, Bell, LogOut, Menu, X, ChevronRight, Zap,
  Users, Settings, Sparkles, Compass
} from 'lucide-react';

const studentNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/mentor-chat', label: 'AI Mentor', icon: Bot },
  { href: '/dashboard/chat', label: 'Community Chat', icon: MessageSquare },
  { href: '/dashboard/facts', label: 'Daily Fun Facts', icon: Sparkles },
  { href: '/dashboard/mentors', label: 'Find Mentors', icon: Users },
  { href: '/dashboard/courses', label: 'Explore Courses', icon: Compass },
];

const mentorNavItems = [
  { href: '/mentor', label: 'Mentor Overview', icon: LayoutDashboard },
  { href: '/mentor/students', label: 'My Students', icon: Users },
  { href: '/dashboard/chat', label: 'Community Chat', icon: MessageSquare },
  { href: '/dashboard/courses', label: 'Browse Courses', icon: Compass },
];

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const getRoleColor = (role) => role === 'mentor' ? 'badge-mentor' : 'badge-brand';

export default function DashboardLayout({ children, title = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (user && !user.onboarding_completed) {
      router.push('/onboarding');
    }
  }, [user, router]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full z-30 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-slate-200`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(37,99,235,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-700 text-lg gradient-text" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Mentra AI</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-slate-800" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#fb923c)', fontWeight: 700, fontFamily: 'Sora,sans-serif' }}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-600 truncate" style={{ fontWeight: 600 }}>{user.name}</p>
              <span className={`badge text-xs ${getRoleColor(user.role)}`}>{user.role}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-600 uppercase tracking-widest text-slate-400">Navigation</p>
          {(user.role === 'mentor' ? mentorNavItems : studentNavItems).map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-all duration-200 group ${active ? 'nav-active' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                style={{ fontWeight: 500 }}
                onClick={() => setSidebarOpen(false)}>
                <Icon size={17} className={active ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-600'} style={active ? { color: '#3b82f6' } : {}} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#3b82f6' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 space-y-1" style={{ borderTop: '1px solid rgba(37,99,235,0.1)' }}>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
            <Settings size={16} />
            Settings
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="relative z-40 flex items-center justify-between px-6 py-4 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400 hover:text-slate-800" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-700" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{title}</h1>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white font-700"
                    style={{ background: '#2563eb', fontWeight: 700, fontSize: 10 }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-xl shadow-lg z-50 overflow-hidden bg-white border border-slate-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-600" style={{ fontWeight: 600 }}>Notifications</p>
                    <button onClick={markAllRead} className="text-xs" style={{ color: '#3b82f6' }}>Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-slate-50 flex gap-3 items-start cursor-pointer hover:bg-slate-50 transition-colors ${n.read ? 'opacity-50' : ''}`}
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? 'transparent' : '#2563eb' }} />
                        <p className="text-sm text-slate-700">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="relative">
              <button 
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 cursor-pointer transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#fb923c)', fontWeight: 700, color: 'white', border: 'none' }}>
                {getInitials(user.name)}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl shadow-lg z-50 overflow-hidden bg-white border border-slate-200 py-1">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-600 truncate" style={{ fontWeight: 600 }}>{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link href="/dashboard/settings" 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setProfileOpen(false)}>
                    <Settings size={15} /> Profile Settings
                  </Link>
                  <button onClick={logout} 
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

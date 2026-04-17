import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getMentors, getRecommendations } from '../../lib/api';
import {
  BookOpen, Brain, MessageSquare, Trophy, Zap, TrendingUp,
  ChevronRight, Star, Clock, Target, Flame, Bot, Users
} from 'lucide-react';

const skillData = [
  { name: 'JavaScript', progress: 72, color: '#f7df1e' },
  { name: 'React', progress: 58, color: '#61dafb' },
  { name: 'Node.js', progress: 45, color: '#68a063' },
  { name: 'CSS / Tailwind', progress: 80, color: '#38bdf8' },
  { name: 'Python', progress: 30, color: '#306998' },
];

const StatCard = ({ icon: Icon, label, value, sub, color, href }) => {
  const content = (
    <div className="glass rounded-2xl p-5 card-hover h-full cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={22} style={{ color }} />
        </div>
        <ChevronRight size={16} className="text-slate-400" />
      </div>
      <p className="text-2xl font-700 mb-0.5" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{value}</p>
      <p className="text-sm font-500" style={{ fontWeight: 500 }}>{label}</p>
      {sub && <p className="text-xs mt-1 text-slate-500">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const [mentorsRes, recRes] = await Promise.all([
        getMentors().catch(() => ({ data: [] })),
        getRecommendations({ interests: user?.interests || [] }).catch(() => ({ data: { recommendations: [] } })),
      ]);
      setMentors(mentorsRes.data.slice(0, 3));
      setRecommendations(recRes.data.recommendations?.slice(0, 3) || []);
    } finally {
      setLoadingMentors(false);
    }
  };

  if (loading || !user) return null;

  const completedCount = user?.progress?.completedTopics?.length || 0;
  const xp = user?.progress?.xpPoints || 0;
  const streak = user?.progress?.streak || 3;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* Greeting banner */}
        <div className="relative overflow-hidden rounded-2xl p-7" style={{ background: 'linear-gradient(135deg,rgba(61,69,229,0.3),rgba(37,99,235,0.15))', border: '1px solid rgba(37,99,235,0.2)' }}>
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-sm mb-1 text-slate-600">{greeting()},</p>
            <h2 className="text-3xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{user.name} 👋</h2>
            <p className="text-slate-600">
              {user.role === 'mentor' ? 'Your mentees are waiting for guidance. Ready to inspire?' : "You're on a roll! Keep up the momentum."}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/dashboard/learning-path" className="btn-primary py-2 px-5 text-sm">
                <BookOpen size={15} /> {completedCount > 0 ? 'Continue learning' : 'Generate learning path'}
              </Link>
              <Link href="/dashboard/ai-assistant" className="btn-secondary py-2 px-5 text-sm">
                <Bot size={15} /> Ask AI mentor
              </Link>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Trophy} label="Topics Completed" value={completedCount} sub="Keep going!" color="#f59e0b" href="/dashboard/learning-path" />
          <StatCard icon={Zap} label="XP Points" value={xp} sub="+50 per topic" color="#2563eb" />
          <StatCard icon={Flame} label="Day Streak" value={`${streak}🔥`} sub="Stay consistent!" color="#ef4444" />
          <StatCard icon={Brain} label="Quizzes Taken" value="4" sub="Avg score: 78%" color="#22c55e" href="/dashboard/quiz" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill progress */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: '#2563eb' }} />
                <h3 className="font-600 text-base" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>Skill Progress</h3>
              </div>
              <Link href="/dashboard/learning-path" className="text-xs" style={{ color: '#3b82f6' }}>View path →</Link>
            </div>
            <div className="space-y-4">
              {skillData.map(({ name, progress, color }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-slate-700">{name}</span>
                    <span style={{ color, fontWeight: 600 }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%`, background: `linear-gradient(90deg,${color}80,${color})` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-600 text-base mb-5 flex items-center gap-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
              <Target size={18} style={{ color: '#fb923c' }} />
              Quick Actions
            </h3>
            <div className="space-y-3">
              {[
                { href: '/dashboard/quiz', icon: Brain, label: 'Take a quiz', sub: 'Test your knowledge', color: '#22c55e' },
                { href: '/dashboard/chat', icon: MessageSquare, label: 'Join a room', sub: 'Chat with peers', color: '#2563eb' },
                { href: '/dashboard/mentors', icon: Users, label: 'Find mentor', sub: 'Get guidance', color: '#a78bfa' },
                { href: '/dashboard/learning-path', icon: BookOpen, label: 'Learning path', sub: 'Continue your journey', color: '#fb923c' },
              ].map(({ href, icon: Icon, label, sub, color }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-50 group border border-slate-100">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-500" style={{ fontWeight: 500 }}>{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#3b82f6' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations + Mentors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommended topics */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-600 text-base mb-5 flex items-center gap-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
              <Star size={18} style={{ color: '#f59e0b' }} />
              Recommended for You
            </h3>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm bg-brand-50 text-brand-500">📚</div>
                    <div>
                      <p className="text-sm font-500" style={{ fontWeight: 500 }}>{rec.title}</p>
                      <p className="text-xs text-slate-500">{rec.reason}</p>
                    </div>
                    <span className="badge badge-brand ml-auto text-xs">{rec.difficulty}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {['Next.js Advanced Patterns', 'System Design Fundamentals', 'TypeScript Deep Dive'].map((topic, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm bg-brand-50 text-brand-500">📚</div>
                    <div>
                      <p className="text-sm font-500" style={{ fontWeight: 500 }}>{topic}</p>
                      <p className="text-xs text-slate-500">Based on your progress</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mentors */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-600 text-base flex items-center gap-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
                <Users size={18} style={{ color: '#a78bfa' }} />
                Available Mentors
              </h3>
              <Link href="/dashboard/mentors" className="text-xs" style={{ color: '#3b82f6' }}>See all →</Link>
            </div>
            <div className="space-y-3">
              {loadingMentors ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-32 rounded" />
                      <div className="skeleton h-2 w-20 rounded" />
                    </div>
                  </div>
                ))
              ) : mentors.map((m, i) => (
                <div key={m.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-700 flex-shrink-0 text-white"
                    style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', fontWeight: 700 }}>
                    {m.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-500 truncate" style={{ fontWeight: 500 }}>{m.name}</p>
                    <p className="text-xs truncate text-slate-500">{m.skills?.slice(0, 2).join(' · ')}</p>
                  </div>
                  <div className="dot-online flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

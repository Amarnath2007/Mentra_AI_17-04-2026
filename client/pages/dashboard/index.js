import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAIProfile, getRecommendations, getNextAction, updateActionStatus } from '../../lib/api';
import {
  BookOpen, Brain, MessageSquare, Trophy, Zap, TrendingUp,
  ChevronRight, Star, Clock, Target, Flame, Bot, AlertTriangle,
  CheckCircle, Rocket, Map, Lightbulb, Compass, Sparkles, Send, HelpCircle, RotateCw, SkipForward
} from 'lucide-react';

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
  const [aiProfile, setAiProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [nextAction, setNextAction] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingAction, setUpdatingAction] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (user && user.role === 'mentor') { router.push('/mentor'); return; }
    if (user) fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    setLoadingProfile(true);
    try {
      const [profileRes, recRes, actionRes] = await Promise.all([
        getAIProfile().catch(() => ({ data: null })),
        getRecommendations({ interests: user?.interests || [] }).catch(() => ({ data: { recommendations: [] } })),
        getNextAction().catch(() => ({ data: null }))
      ]);
      setAiProfile(profileRes.data);
      setRecommendations(recRes.data.recommendations?.slice(0, 4) || []);
      setNextAction(actionRes.data);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleActionUpdate = async (status) => {
    if (!nextAction) return;
    setUpdatingAction(true);
    try {
      await updateActionStatus({ id: nextAction.id, status });
      await fetchData();
    } finally {
      setUpdatingAction(false);
    }
  };

  if (loading || !user) return null;

  const completedCount = user?.progress?.completedTopics?.length || 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const level = aiProfile?.level || user?.experience_level || 'beginner';
  const levelColor = level === 'advanced' ? '#ef4444' : level === 'intermediate' ? '#f59e0b' : '#22c55e';

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* Greeting banner */}
        <div className="relative overflow-hidden rounded-2xl p-7" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(37,99,235,0.04))', border: '1px solid rgba(37,99,235,0.15)' }}>
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-sm mb-1 text-slate-500">{greeting()},</p>
            <h2 className="text-3xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>{user.name} 👋</h2>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge" style={{ background: `${levelColor}15`, color: levelColor, border: `1px solid ${levelColor}30`, textTransform: 'capitalize' }}>
                {level} Level
              </span>
              {(user.interests || []).length > 0 && (
                <span className="text-sm text-slate-500">Focusing on: {user.interests.slice(0, 3).join(', ')}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/dashboard/mentor-chat" className="btn-primary py-2 px-5 text-sm">
                <Bot size={15} /> Talk to AI Mentor
              </Link>
              <Link href="/dashboard/facts" className="btn-secondary py-2 px-5 text-sm">
                <Sparkles size={15} /> Daily Fun Facts
              </Link>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard icon={Trophy} label="Tasks Completed" value={completedCount} sub="Your learning milestone" color="#f59e0b" />
          <StatCard icon={Brain} label="Current Skill Level" value={level.charAt(0).toUpperCase() + level.slice(1)} sub={`${(user.skills || []).length} skills identified`} color="#22c55e" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Focus (Next Action) */}
          <div className="lg:col-span-2 glass rounded-2xl p-8 relative overflow-hidden bg-white border border-blue-100 shadow-xl shadow-blue-500/5">
            <div className="absolute top-0 right-0 p-8 text-blue-100 opacity-20 pointer-events-none">
              <Rocket size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-700" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Today's Focus</h3>
                  <p className="text-xs text-slate-400 font-500">INDIVIDUAL ACTION ITEM</p>
                </div>
              </div>

              {loadingProfile ? (
                 <div className="space-y-4">
                    <div className="skeleton h-8 w-3/4 rounded-lg" />
                    <div className="skeleton h-20 w-full rounded-xl" />
                 </div>
              ) : nextAction ? (
                <div className="space-y-6 animate-slide-up">
                  <div>
                    <h4 className="text-2xl font-700 text-slate-800 mb-3 leading-tight" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>
                      {nextAction.action}
                    </h4>
                    <div className="flex items-center gap-4 text-xs font-600">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                        <Clock size={14} />
                        {nextAction.estimated_time || '30 mins'}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        <Sparkles size={14} />
                        AI Curated
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-slate-600 text-sm leading-relaxed italic italic">
                      " {nextAction.reason} "
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => handleActionUpdate('completed')}
                      disabled={updatingAction}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-600 text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 group"
                    >
                      <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                      Mark as Completed
                    </button>
                    <button 
                      onClick={() => handleActionUpdate('skipped')}
                      disabled={updatingAction}
                      className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-600 text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <SkipForward size={18} />
                      Skip for Now
                    </button>
                    <button 
                      onClick={fetchData} 
                      className="ml-auto p-3 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Regenerate"
                    >
                      <RotateCw size={18} className={loadingProfile ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4 text-sm font-500">No action pending. Ready for a new focus?</p>
                  <button onClick={fetchData} className="btn-primary mx-auto">
                    <Sparkles size={16} /> Generate Next Action
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Suggestions / Sidebar content */}
          <div className="space-y-6">
             <div className="glass rounded-2xl p-6 border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-blue-500" />
                  <h4 className="font-600 text-sm" style={{ fontWeight: 600 }}>Next Steps</h4>
                </div>
                <div className="space-y-3">
                  {recommendations.length > 0 ? recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 group hover:bg-orange-50 transition-colors cursor-pointer">
                      <p className="text-[10px] text-orange-600 font-700 uppercase tracking-widest mb-1">{rec.type || 'Suggestion'}</p>
                      <p className="text-sm font-600 text-slate-800" style={{ fontWeight: 600 }}>{rec.title}</p>
                    </div>
                  )) : (
                    <div className="skeleton h-20 w-full rounded-xl" />
                  )}
                </div>
             </div>
             
             <div className="glass rounded-2xl p-6 border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle size={16} className="text-indigo-500" />
                  <h4 className="font-600 text-sm" style={{ fontWeight: 600 }}>Need Help?</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Stuck on your focus task? Ask your mentor for guidance.</p>
                <Link href="/dashboard/mentor-direct" className="text-xs font-700 text-indigo-600 flex items-center gap-1 hover:underline">
                  Chat with human Mentor <ChevronRight size={14} />
                </Link>
             </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-100 bg-white">
          <h3 className="font-600 text-base mb-5 flex items-center gap-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
            <Target size={18} style={{ color: '#fb923c' }} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { href: '/dashboard/mentor-chat', icon: Bot, label: 'AI Mentor', sub: 'Get personalized guidance', color: '#2563eb' },
              { href: '/dashboard/courses', icon: Compass, label: 'Explore Courses', sub: 'Find your next skill', color: '#22c55e' },
              { href: '/dashboard/chat', icon: MessageSquare, label: 'Community', sub: 'Join the discussion', color: '#a78bfa' },
            ].map(({ href, icon: Icon, label, sub, color }) => (
              <Link key={href} href={href}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-slate-50 group border border-slate-100 bg-white shadow-sm hover:shadow-md">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-700 text-slate-800" style={{ fontWeight: 700 }}>{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}


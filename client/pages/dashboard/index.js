import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAIProfile, getRecommendations, getTodayTasks } from '../../lib/api';
import {
  BookOpen, Brain, MessageSquare, Trophy, Zap, TrendingUp,
  ChevronRight, Star, Clock, Target, Flame, Bot, AlertTriangle,
  CheckCircle, Rocket, Map, Lightbulb, Compass, Sparkles, Send, HelpCircle, RotateCw, SkipForward,
  Circle, ArrowRight
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
  const [todayData, setTodayData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    setLoadingProfile(true);
    try {
      const [profileRes, recRes, todayRes] = await Promise.all([
        getAIProfile().catch(() => ({ data: null })),
        getRecommendations({ interests: user?.interests || [] }).catch(() => ({ data: { recommendations: [] } })),
        getTodayTasks().catch(() => ({ data: null })),
      ]);
      setAiProfile(profileRes.data);
      setRecommendations(recRes.data.recommendations?.slice(0, 4) || []);
      setTodayData(todayRes.data);
    } finally {
      setLoadingProfile(false);
    }
  };

  if (loading || !user) return null;

  const completedJourneyDays = todayData?.completedDays || 0;
  const completedCount = (user?.progress?.completedTopics?.length || 0) + completedJourneyDays;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const level = aiProfile?.level || user?.experience_level || 'beginner';
  const levelColor = level === 'advanced' ? '#ef4444' : level === 'intermediate' ? '#f59e0b' : '#22c55e';

  // Journey data
  const hasJourney = todayData?.journey;
  const todayTasks = todayData?.tasks || [];
  const journeyProgress = todayData?.progress || 0;
  const currentDay = todayData?.currentDay || 1;

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
              <Link href="/dashboard/journey" className="btn-secondary py-2 px-5 text-sm">
                <Map size={15} /> My Journey
              </Link>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard icon={Trophy} label="Tasks Completed" value={completedCount} sub="Your learning milestone" color="#f59e0b" />
          <div className="glass rounded-2xl p-6 border border-slate-100 bg-white relative cursor-pointer hover:shadow-md transition-all group"
            onClick={() => setShowCourses(!showCourses)}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <ChevronRight size={16} className={`text-slate-300 group-hover:text-slate-600 transition-all ${showCourses ? 'rotate-90' : ''}`} />
            </div>
            <div>
              <h3 className="text-sm font-600 text-slate-500 uppercase tracking-wider">My Courses</h3>
              <p className="text-2xl font-700 text-slate-900 mt-1" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>
                {(user.enrolledCourses || []).length} Enrolled
              </p>
            </div>

            {/* Expanded course list */}
            {showCourses && (
              <div className="mt-4 pt-4 border-t border-slate-50 animate-slide-up">
                {(user.enrolledCourses || []).length === 0 ? (
                  <div className="py-2 text-center bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">No course enrolled</p>
                    <Link href="/dashboard/courses" className="text-[10px] text-blue-500 font-600 mt-1 block hover:underline">Explore Catalog</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.enrolledCourses.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Play size={10} className="text-blue-500" />
                        <span className="text-xs text-slate-700 font-500">{c.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute top-2 right-2 text-[10px] font-600 uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-50 text-green-600">
              {level} Level
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Tasks (from Journey) */}
          <div className="lg:col-span-2 glass rounded-2xl p-8 relative overflow-hidden bg-white border border-blue-100 shadow-xl shadow-blue-500/5">
            <div className="absolute top-0 right-0 p-8 text-blue-100 opacity-20 pointer-events-none">
              <Rocket size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-700" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Today's Tasks</h3>
                    <p className="text-xs text-slate-400 font-500">
                      {hasJourney ? `Day ${currentDay} · ${journeyProgress}% complete` : 'YOUR DAILY FOCUS'}
                    </p>
                  </div>
                </div>
                {hasJourney && (
                  <Link href="/dashboard/journey" className="text-xs font-600 text-blue-600 flex items-center gap-1 hover:underline">
                    Full Journey <ArrowRight size={12} />
                  </Link>
                )}
              </div>

              {loadingProfile ? (
                 <div className="space-y-4">
                    <div className="skeleton h-8 w-3/4 rounded-lg" />
                    <div className="skeleton h-20 w-full rounded-xl" />
                 </div>
              ) : hasJourney && todayTasks.length > 0 ? (
                <div className="space-y-3 animate-slide-up">
                  {/* Journey goal context */}
                  <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 mb-4 flex items-center gap-3">
                    <Map size={16} className="text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-600 font-500">
                      Journey: <span className="font-700" style={{ fontWeight: 700 }}>{todayData.journey.goal}</span>
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${journeyProgress}%`, background: journeyProgress === 100 ? '#22c55e' : 'linear-gradient(90deg,#1d4ed8,#3b82f6)' }} />
                    </div>
                  </div>

                  {/* Today's task cards */}
                  {todayTasks.map(task => (
                    <div key={task.id} className="rounded-xl border p-5 transition-all bg-white border-blue-200 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                          <Target size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-700 text-blue-500 uppercase tracking-widest mb-1" style={{ fontWeight: 700 }}>Day {task.day_number} · {task.topic || 'Today\'s Task'}</p>
                          <h4 className="text-sm font-600 text-slate-800 mb-1" style={{ fontWeight: 600 }}>{task.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-3">{task.description}</p>
                          <Link href="/dashboard/journey"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-600 text-white shadow-sm"
                            style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                            <Sparkles size={12} /> Start Learning & Quiz
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasJourney && todayTasks.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-sm font-600 text-slate-600 mb-1" style={{ fontWeight: 600 }}>No tasks for today</p>
                  <p className="text-xs text-slate-400 mb-4">Check your full journey for upcoming tasks.</p>
                  <Link href="/dashboard/journey" className="btn-primary text-sm mx-auto">
                    <Map size={14} /> View Journey
                  </Link>
                </div>
              ) : (
                /* No journey started */
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🚀</div>
                  <h4 className="text-lg font-700 text-slate-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Start Your Learning Journey</h4>
                  <p className="text-sm text-slate-500 mb-5">Set a goal and let AI create a personalized day-by-day path for you.</p>
                  <Link href="/dashboard/journey"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-600 text-white shadow-lg shadow-blue-200"
                    style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                    <Sparkles size={16} /> Create My Journey
                  </Link>
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
                <Link href="/dashboard/mentor-chat" className="text-xs font-700 text-indigo-600 flex items-center gap-1 hover:underline">
                  Chat with Mentor <ChevronRight size={14} />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: '/dashboard/mentor-chat', icon: Bot, label: 'AI Mentor', sub: 'Get personalized guidance', color: '#2563eb' },
              { href: '/dashboard/journey', icon: Map, label: 'My Journey', sub: 'Your learning path', color: '#8b5cf6' },
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

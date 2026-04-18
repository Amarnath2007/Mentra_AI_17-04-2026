import { useState, useEffect } from 'react';
import MentorLayout from '../../components/mentor/MentorLayout';
import { getMentorStats, getMentorSessions } from '../../lib/api';
import { Users, Activity, MessageCircle, Calendar, Sparkles, ChevronRight, ArrowUpRight, Clock, Target } from 'lucide-react';
import Link from 'next/link';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-[#F9FAFB] dark:bg-slate-800/60 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 card-hover">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
        <Icon size={20} style={{ color }} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-700">
          <ArrowUpRight size={10} />
          {trend}
        </div>
      )}
    </div>
    <p className="text-3xl font-700 text-[#111827] dark:text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
    <p className="text-sm font-500 text-slate-500 dark:text-slate-400 mt-1">{label}</p>
  </div>
);

export default function MentorDashboard() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        getMentorStats(),
        getMentorSessions()
      ]);
      setStats(statsRes.data);
      setSessions(sessionsRes.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MentorLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#0A66C2]/20 border-t-[#0A66C2] rounded-full animate-spin" />
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout title="Dashboard Overview">
      <div className="space-y-8 animate-fade-in">
        
        {/* Welcome Banner */}
        <div className="bg-[#0A66C2] rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
          <div className="relative z-10">
            <h2 className="text-2xl font-700 text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>High productivity day ahead.</h2>
            <p className="text-white/70 text-sm max-w-md">You have {stats?.sessionsToday || 0} sessions scheduled and 5 students needing feedback. Our AI suggests focusing on the "React Design Patterns" topic today.</p>
            <div className="mt-6 flex items-center gap-4">
              <Link href="/mentor/sessions" className="px-6 py-2.5 bg-white text-[#0A66C2] rounded-xl text-sm font-700 shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform">
                View Schedule
              </Link>
              <button className="flex items-center gap-2 text-white/80 text-sm font-600 hover:text-white transition-colors">
                <Sparkles size={16} />
                Generate Daily Summary
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Total Students" value={stats?.totalStudents || 0} trend="+12%" color="#0A66C2" />
          <StatCard icon={Activity} label="Active Learners" value={stats?.activeStudents || 0} trend="+5%" color="#00C4B4" />
          <StatCard icon={MessageCircle} label="Pending Doubts" value={stats?.pendingDoubts || 0} color="#F59E0B" />
          <StatCard icon={Calendar} label="Sessions Today" value={stats?.sessionsToday || 0} color="#0A66C2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area: Recent Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-700 text-[#111827] dark:text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Upcoming Sessions</h3>
              <Link href="/mentor/sessions" className="text-sm font-600 text-[#0A66C2] hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-[#F9FAFB] dark:bg-slate-800/60 p-5 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-between group hover:border-[#0A66C2]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-[#0A66C2] font-700 shadow-sm">
                      {session.studentName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-600 text-[#111827] dark:text-white">{session.studentName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-500">{session.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-sm font-700 text-[#111827] dark:text-white">
                        {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-600 uppercase tracking-wider">Duration: {session.duration}</p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-xs font-700 shadow-sm hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all">
                      Join Call
                    </button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="py-12 text-center bg-[#F9FAFB] dark:bg-slate-800/40 rounded-2xl border border-dashed border-[#E5E7EB] dark:border-slate-700">
                  <p className="text-slate-400 text-sm">No sessions scheduled for today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area: AI Suggestions & Notifications */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-700 text-[#111827] dark:text-white" style={{ fontFamily: 'Sora, sans-serif' }}>AI Assistant</h3>
                <Sparkles size={16} className="text-[#00C4B4]" />
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0A66C2]/5 dark:bg-[#0A66C2]/10 border border-[#0A66C2]/10 dark:border-[#0A66C2]/20">
                  <p className="text-xs font-700 text-[#0A66C2] uppercase tracking-wider mb-2">Performance Alert</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-500">Alex's completion rate dropped by 15% this week. Suggest a mentorship check-in?</p>
                  <button className="mt-3 text-xs font-700 text-[#0A66C2] hover:underline">Draft Message →</button>
                </div>
                
                <div className="p-4 rounded-xl bg-[#00C4B4]/5 dark:bg-[#00C4B4]/10 border border-[#00C4B4]/10 dark:border-[#00C4B4]/20">
                  <p className="text-xs font-700 text-[#00C4B4] uppercase tracking-wider mb-2">Topic Suggester</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-500">Based on Sarah's progress, "Advance Hooks" is the logical next step. Generate task?</p>
                  <button className="mt-3 text-xs font-700 text-[#00C4B4] hover:underline">Create Task →</button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
              <h3 className="font-700 text-[#111827] dark:text-white mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>Notifications</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <Target size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-500"><span className="font-700 text-[#111827] dark:text-white">Task Submitted</span> by Emma Wilson</p>
                    <p className="text-[10px] text-slate-400 font-600 uppercase mt-1">12 mins ago</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#0A66C2] flex items-center justify-center shrink-0">
                    <MessageCircle size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-500"><span className="font-700 text-[#111827] dark:text-white">New Message</span> from Sarah Miller</p>
                    <p className="text-[10px] text-slate-400 font-600 uppercase mt-1">45 mins ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </MentorLayout>
  );
}

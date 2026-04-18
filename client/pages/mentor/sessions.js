import { useState, useEffect } from 'react';
import MentorLayout from '../../components/mentor/MentorLayout';
import { getMentorSessions } from '../../lib/api';
import { Calendar as CalendarIcon, Clock, Video, Plus, Check, X, ChevronLeft, ChevronRight, MoreVertical, Bell } from 'lucide-react';

export default function MentorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMentorSessions();
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const upcoming = sessions.filter(s => s.status === 'upcoming');
  const pending = sessions.filter(s => s.status === 'pending');

  return (
    <MentorLayout title="Mentorship Sessions">
      <div className="space-y-8 animate-fade-in">
        
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-[#F3F4F6] dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-1.5 text-xs font-700 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-[#0A66C2] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              List View
            </button>
            <button 
               onClick={() => setView('calendar')}
               className={`px-4 py-1.5 text-xs font-700 rounded-lg transition-all ${view === 'calendar' ? 'bg-white dark:bg-slate-700 text-[#0A66C2] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Calendar
            </button>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0A66C2] text-white rounded-xl text-sm font-700 shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform">
            <Plus size={18} /> Schedule New Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Schedule */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pending Requests */}
            {pending.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-[#111827] dark:text-white font-700" style={{ fontFamily: 'Sora, sans-serif' }}>Needs Action</h3>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-800 uppercase tracking-widest">{pending.length} New Requests</span>
                </div>
                {pending.map(s => (
                  <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-between group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-[#0A66C2] font-700 shadow-sm transition-transform group-hover:scale-105">
                        {s.studentName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-700 text-[#111827] dark:text-white">{s.studentName}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-500 mt-1">
                          <span className="flex items-center gap-1"><CalendarIcon size={12} /> {new Date(s.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Accept"><Check size={20} /></button>
                       <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Decline"><X size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Schedule */}
            <div className="space-y-4">
              <h3 className="text-[#111827] dark:text-white font-700" style={{ fontFamily: 'Sora, sans-serif' }}>Upcoming Sessions</h3>
              <div className="space-y-4">
                {upcoming.map(s => (
                  <div key={s.id} className="bg-[#F9FAFB] dark:bg-slate-800/60 p-6 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-between group hover:border-[#0A66C2]/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="text-center w-12 flex flex-col items-center">
                         <span className="text-[10px] font-800 uppercase text-slate-400 tracking-widest">{new Date(s.date).toLocaleString('default', { month: 'short' })}</span>
                         <span className="text-xl font-800 text-[#111827] dark:text-white leading-none mb-1">{new Date(s.date).getDate()}</span>
                         <div className="w-4 h-0.5 bg-[#00C4B4] rounded-full" />
                      </div>
                      <div className="w-px h-10 bg-[#E5E7EB] dark:bg-slate-700" />
                      <div>
                        <p className="text-sm font-700 text-[#111827] dark:text-white">{s.studentName}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-500 mt-1">
                          <span className="flex items-center gap-1 text-[#0A66C2]"><Clock size={12} /> {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1"><Video size={12} /> Video Session • {s.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-[11px] font-700 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors">
                        <Bell size={12} /> Remind Student
                      </button>
                      <button className="px-5 py-2 bg-[#0A66C2] text-white rounded-xl text-[11px] font-700 shadow-md shadow-blue-200 dark:shadow-blue-900/30 hover:scale-105 transition-transform">
                        Join Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area: Mini Calendar */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm font-inter">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-800 text-[#111827] dark:text-white uppercase tracking-widest">April 2026</h4>
                <div className="flex gap-2">
                   <button className="p-1.5 text-slate-400 hover:text-[#111827] dark:hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                   <button className="p-1.5 text-slate-400 hover:text-[#111827] dark:hover:text-white transition-colors"><ChevronRight size={16} /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-y-4 text-center">
                {['S','M','T','W','T','F','S'].map(d => (
                  <span key={d} className="text-[10px] font-800 text-slate-300 dark:text-slate-500 uppercase">{d}</span>
                ))}
                {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate();
                  const hasSession = [18, 19, 22].includes(day);
                  return (
                    <button key={i} className={`relative flex items-center justify-center w-8 h-8 mx-auto text-xs font-700 rounded-lg transition-all ${
                      isToday ? 'bg-[#0A66C2] text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : 
                      hasSession ? 'text-[#111827] dark:text-white bg-[#F9FAFB] dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 hover:border-[#0A66C2]' : 
                      'text-slate-500 dark:text-slate-400 hover:bg-[#F9FAFB] dark:hover:bg-slate-800'
                    }`}>
                      {day}
                      {hasSession && !isToday && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#00C4B4] rounded-full" />}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-8 border-t border-[#E5E7EB] dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#0A66C2]" />
                   <p className="text-[11px] font-600 text-slate-500 dark:text-slate-400 uppercase tracking-widest">Today&apos;s Focus</p>
                </div>
                <div className="p-5 bg-[#F9FAFB] dark:bg-slate-800/60 rounded-2xl border border-[#E5E7EB] dark:border-slate-700">
                   <p className="text-xs font-700 text-[#111827] dark:text-white leading-relaxed">Technical Review for Alex Johnson regarding API Architecture.</p>
                   <p className="text-[10px] text-slate-400 font-500 mt-2">Duration: 45 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}

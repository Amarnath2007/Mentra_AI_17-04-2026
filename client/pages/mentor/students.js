import { useState, useEffect } from 'react';
import MentorLayout from '../../components/mentor/MentorLayout';
import { getMentorStudents } from '../../lib/api';
import { Search, Filter, MoreVertical, MessageCircle, Mail, Map, BookOpen, AlertCircle, ChevronRight, User, Target, Activity } from 'lucide-react';

export default function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMentorStudents();
      setStudents(res.data);
      if (res.data.length > 0) setSelectedStudent(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MentorLayout title="Student Management">
      <div className="flex h-full gap-8 animate-fade-in">
        
        {/* Left Side: Student List */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0A66C2] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-500 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/10 focus:border-[#0A66C2] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)
            ) : filteredStudents.map((s) => (
              <button 
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedStudent?.id === s.id ? 'bg-[#0A66C2] border-[#0A66C2] shadow-lg shadow-blue-900/10' : 'bg-[#F9FAFB] dark:bg-slate-800/60 border-[#E5E7EB] dark:border-slate-700 hover:border-[#0A66C2]/30'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-700 text-sm ${selectedStudent?.id === s.id ? 'bg-white/20 text-white' : 'bg-white border border-[#E5E7EB] text-[#0A66C2]'}`}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-700 truncate ${selectedStudent?.id === s.id ? 'text-white' : 'text-[#111827] dark:text-white'}`}>{s.name}</p>
                    <p className={`text-[11px] truncate ${selectedStudent?.id === s.id ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{s.experience_level || 'Beginner'} • 4 tasks active</p>
                  </div>
                  {selectedStudent?.id === s.id && <ChevronRight size={16} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Student Profile */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          {selectedStudent ? (
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
              {/* Profile Header */}
              <div className="bg-[#F9FAFB] dark:bg-slate-800/60 p-8 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 shadow-sm flex items-center justify-center text-3xl font-700 text-[#0A66C2]">
                  {selectedStudent.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-700 text-[#111827] dark:text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{selectedStudent.name}</h2>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-lg text-[10px] font-700 uppercase tracking-widest leading-none flex items-center">Active</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-500 mb-6 flex items-center gap-4">
                    <span>{selectedStudent.email}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>Member since April 2026</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-2 bg-[#0A66C2] text-white rounded-xl text-xs font-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:scale-105 transition-transform flex items-center gap-2">
                       <MessageCircle size={14} /> Send Message
                    </button>
                    <button className="px-6 py-2 bg-white dark:bg-slate-800 text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-xs font-700 hover:bg-[#F9FAFB] dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                       <Mail size={14} /> Email
                    </button>
                    <button className="p-2 text-slate-400 hover:text-[#111827] dark:hover:text-white transition-colors"><MoreVertical size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Progress & Weak Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-700 text-[#111827] dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                    <BookOpen size={16} className="text-[#0A66C2]" />
                    Learning Progress
                  </h3>
                  <div className="space-y-6">
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00C4B4] rounded-full shadow-[0_0_12px_#00C4B444]" style={{ width: '65%' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-800/60 border border-[#E5E7EB] dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 font-700 uppercase tracking-widest mb-1">XP Earned</p>
                        <p className="text-lg font-700 text-[#111827] dark:text-white">1,240</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-800/60 border border-[#E5E7EB] dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 font-700 uppercase tracking-widest mb-1">XP Points</p>
                        <p className="text-lg font-700 text-[#111827] dark:text-white">{selectedStudent.progress?.xpPoints || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-700 text-[#111827] dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                    <AlertCircle size={16} className="text-[#F59E0B]" />
                    Weak Areas (AI Identified)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.weaknesses?.split(',').map((w, i) => (
                      <span key={i} className="px-4 py-2 bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-600">
                        {w.trim()}
                      </span>
                    )) || (
                      ['Async Loops', 'State Persistence', 'Prop Drilling'].map((w, i) => (
                        <span key={i} className="px-4 py-2 bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-600">
                          {w}
                        </span>
                      ))
                    )}
                  </div>
                  <button className="mt-8 w-full py-3 bg-[#F9FAFB] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-2xl text-xs font-700 text-[#111827] dark:text-white hover:border-[#0A66C2] transition-colors flex items-center justify-center gap-2">
                     <Target size={14} className="text-[#0A66C2]" /> Generate Recovery Path
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-700 text-[#111827] dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                  <Map size={16} className="text-[#0A66C2]" />
                  Recent Learning Activity
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Completed Quiz: Advance Hooks', time: '2 hours ago', icon: Target, color: '#00C4B4' },
                    { label: 'Submitted Project: E-commerce UI', time: 'Yesterday', icon: BookOpen, color: '#0A66C2' },
                    { label: 'Started Topic: Redux Middleware', time: '2 days ago', icon: Activity, color: '#F59E0B' },
                  ].map((act, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < 2 && <div className="absolute left-[15px] top-8 w-px h-8 bg-[#E5E7EB] dark:bg-slate-700" />}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 z-10">
                        <act.icon size={14} style={{ color: act.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-600 text-[#111827] dark:text-white">{act.label}</p>
                        <p className="text-[10px] text-slate-400 font-600 uppercase mt-1">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-[#F9FAFB] dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-[#E5E7EB] dark:border-slate-700">
              <User size={48} className="opacity-20" />
              <p className="text-sm font-500">Select a student from the list to view their full profile.</p>
            </div>
          )}
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

import { useState, useEffect } from 'react';
import MentorLayout from '../../components/mentor/MentorLayout';
import { getMentorTasks } from '../../lib/api';
import { CheckSquare, Clock, Users, ArrowRight, MessageCircle, MoreVertical, Plus, Filter, Search, Sparkles, AlertCircle, FileText } from 'lucide-react';

export default function MentorTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMentorTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'all' || t.status === statusFilter);

  return (
    <MentorLayout title="Tasks & Assignments">
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-[#F3F4F6] dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
            {['all', 'submitted', 'in-progress', 'reviewed'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 text-xs font-700 rounded-lg transition-all capitalize ${statusFilter === s ? 'bg-white dark:bg-slate-900 text-[#0A66C2] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0A66C2] text-white rounded-xl text-sm font-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:scale-[1.02] transition-transform">
            <Plus size={18} /> Create New Task
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content: Tasks List */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse" />)
            ) : filteredTasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 hover:border-[#0A66C2]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group shadow-sm">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    task.status === 'submitted' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 text-amber-500' :
                    task.status === 'reviewed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-500' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-[#0A66C2]'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-700 text-[#111827] dark:text-white mb-1 group-hover:text-[#0A66C2] transition-colors">{task.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-600 text-slate-500 dark:text-slate-400 mt-2">
                       <span className="flex items-center gap-1.5 text-[#111827] dark:text-white"><Users size={14} className="text-slate-400" /> {task.student}</span>
                       <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> Deadline: {task.deadline}</span>
                       <span className={`px-2 py-0.5 rounded-lg text-[10px] font-800 uppercase tracking-widest ${
                         task.status === 'submitted' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' :
                         task.status === 'reviewed' ? 'bg-emerald-100 text-emerald-600' :
                         'bg-[#F3F4F6] dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                       }`}>{task.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {task.status === 'submitted' ? (
                    <button className="px-5 py-2.5 bg-[#00C4B4] text-white rounded-xl text-xs font-700 shadow-lg shadow-teal-200 hover:scale-105 transition-transform flex items-center gap-2">
                       Review Now <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-xs font-700 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-all">
                       View Details
                    </button>
                  )}
                  <button className="p-2 text-slate-300 hover:text-slate-600 dark:text-slate-300 transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>
            ))}
            
            {filteredTasks.length === 0 && (
              <div className="py-20 text-center bg-[#F9FAFB] dark:bg-slate-800/60 rounded-3xl border-2 border-dashed border-[#E5E7EB] dark:border-slate-700">
                <CheckSquare size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 text-sm font-500">No tasks found with this status.</p>
              </div>
            )}
          </div>

          {/* Sidebar Area: AI Review Tool */}
          <div className="space-y-8">
            <div className="bg-[#111827] p-8 rounded-3xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 text-white/5 pointer-events-none">
                  <Sparkles size={80} />
               </div>
               <h4 className="text-sm font-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Sparkles size={16} className="text-[#00C4B4]" />
                 AI Review Assistant
               </h4>
               <p className="text-sm text-white/70 leading-relaxed font-500 mb-8">
                 Select a student submission to generate automated feedback and improvement suggestions.
               </p>
               <div className="bg-white dark:bg-slate-900/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 italic">
                  <p className="text-xs text-white/50 mb-3 font-600">PREVIEW TIP:</p>
                  <p className="text-xs text-white/80 leading-relaxed">
                    "This codebase shows great modularity, but Sarah could optimize the re-rendering of the List component using React.memo."
                  </p>
               </div>
               <button className="mt-8 w-full py-3 bg-[#00C4B4] text-[#111827] dark:text-white rounded-2xl text-xs font-800 shadow-xl shadow-teal-900/40 hover:scale-[1.02] transition-transform">
                 Scan Active Submissions
               </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm">
               <h4 className="text-xs font-800 text-[#111827] dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                 <AlertCircle size={14} className="text-[#F59E0B]" />
                 Recent Submissions
               </h4>
               <div className="space-y-4">
                  {[
                    { name: 'Emma Wilson', task: 'Flexbox Design', time: '12m ago' },
                    { name: 'David Chen', task: 'JS Data Types', time: '1h ago' }
                  ].map((sub, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[#F9FAFB] dark:bg-slate-800/60 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#0A66C2]/30 transition-all cursor-pointer">
                       <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-[#0A66C2] font-800 text-[10px]">
                         {sub.name[0]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-700 text-[#111827] dark:text-white truncate">{sub.name}</p>
                          <p className="text-[10px] text-slate-400 font-500 truncate">{sub.task}</p>
                       </div>
                       <p className="text-[9px] font-700 text-slate-300 uppercase">{sub.time}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </MentorLayout>
  );
}

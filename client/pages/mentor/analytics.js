import { useState, useEffect } from 'react';
import MentorLayout from '../../components/mentor/MentorLayout';
import { getMentorAnalytics } from '../../lib/api';
import { BarChart2, TrendingUp, AlertTriangle, Lightbulb, Users, Clock, Target, ArrowRight, Zap, Sparkles } from 'lucide-react';

const TrendBar = ({ label, value, max, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-700 uppercase tracking-widest text-slate-500">
      <span>{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out" 
        style={{ width: `${(value/max)*100}%`, backgroundColor: color, boxShadow: `0 0 12px ${color}33` }} 
      />
    </div>
  </div>
);

export default function MentorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMentorAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <MentorLayout title="Performance Analytics">
        <div className="flex items-center justify-center h-64">
           <div className="w-8 h-8 border-4 border-[#0A66C2]/20 border-t-[#0A66C2] rounded-full animate-spin" />
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout title="Performance Analytics">
      <div className="space-y-10 animate-fade-in">
        
        {/* Top Growth Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-[#F9FAFB] p-10 rounded-[32px] border border-[#E5E7EB] relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              <div className="absolute top-0 right-0 p-10 text-[#0A66C2] opacity-5 pointer-events-none">
                 <TrendingUp size={240} />
              </div>
              <div>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-lg border border-[#E5E7EB] text-[#0A66C2] shadow-sm">
                       <TrendingUp size={18} />
                    </div>
                    <h3 className="text-sm font-800 uppercase tracking-[0.2em] text-[#0A66C2]">Growth Insights</h3>
                 </div>
                 <h2 className="text-3xl font-700 text-[#111827] max-w-md leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
                   Average student progress has increased by <span className="text-[#00C4B4]">24%</span> this month.
                 </h2>
              </div>
              <div className="flex flex-wrap gap-8 mt-10">
                 <div>
                    <p className="text-2xl font-700 text-[#111827]">86%</p>
                    <p className="text-[10px] font-700 text-slate-500 uppercase tracking-widest mt-1">Retention Rate</p>
                 </div>
                 <div className="w-px h-10 bg-[#E5E7EB]" />
                 <div>
                    <p className="text-2xl font-700 text-[#111827]">4.8/5</p>
                    <p className="text-[10px] font-700 text-slate-500 uppercase tracking-widest mt-1">Average Rating</p>
                 </div>
                 <div className="w-px h-10 bg-[#E5E7EB]" />
                 <div>
                    <p className="text-2xl font-700 text-[#111827]">92%</p>
                    <p className="text-[10px] font-700 text-slate-500 uppercase tracking-widest mt-1">Task Completion</p>
                 </div>
              </div>
           </div>

           <div className="bg-[#111827] p-10 rounded-[32px] border border-[#111827] flex flex-col justify-between text-white">
              <div>
                 <Sparkles size={32} className="text-[#00C4B4] mb-8" />
                 <h3 className="font-700 text-xl mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>AI Path Optimization</h3>
                 <p className="text-sm text-white/60 leading-relaxed font-500">
                   Our AI has analyzed the bottleneck in "Backend Logic". 5 students are currently stuck there.
                 </p>
              </div>
              <button className="w-full py-4 bg-[#0A66C2] text-white rounded-2xl text-xs font-800 shadow-xl shadow-blue-900/40 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                 Adjust Learning Path <ArrowRight size={14} />
              </button>
           </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           
           {/* Section: Weak Topics */}
           <div className="bg-white p-10 rounded-[32px] border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-sm font-800 text-[#111827] uppercase tracking-widest flex items-center gap-3">
                   <AlertTriangle size={18} className="text-[#F59E0B]" />
                   Students Struggling With
                 </h3>
                 <button className="text-xs font-700 text-[#0A66C2] hover:underline">View All</button>
              </div>
              <div className="space-y-8">
                 {data.weakTopics.map((topic, i) => (
                    <TrendBar 
                      key={i} 
                      label={topic.topic} 
                      value={topic.count * 10} 
                      max={100} 
                      color={i === 0 ? '#F59E0B' : '#0A66C2'} 
                    />
                 ))}
              </div>
              <div className="mt-12 p-6 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                    <Lightbulb size={20} className="text-[#F59E0B]" />
                 </div>
                 <p className="text-xs text-slate-600 leading-relaxed font-500 italic">
                   "Recommendation: Schedule a group session on **{data.weakTopics[0].topic}** this Wednesday to clear common misconceptions."
                 </p>
              </div>
           </div>

           {/* Section: Activity Insights */}
           <div className="bg-white p-10 rounded-[32px] border border-[#E5E7EB] shadow-sm">
              <h3 className="text-sm font-800 text-[#111827] uppercase tracking-widest flex items-center gap-3 mb-10">
                <BarChart2 size={18} className="text-[#00C4B4]" />
                Actionable Insights
              </h3>
              <div className="space-y-4">
                 {data.insights.map((insight, i) => (
                    <div key={i} className="flex gap-4 group p-1 transition-transform hover:translate-x-1">
                       <div className="w-10 h-10 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center shrink-0 group-hover:bg-[#0A66C2]/5 transition-colors">
                          <Zap size={16} className="text-[#00C4B4]" />
                       </div>
                       <div className="flex-1 py-1">
                          <p className="text-sm text-slate-700 font-500 leading-snug">{insight}</p>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-4">
                 <div className="p-6 rounded-3xl bg-[#0A66C2]/5 border border-[#0A66C2]/10">
                    <p className="text-2xl font-700 text-[#0A66C2]">42h</p>
                    <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest mt-1">Total Mentoring</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-[#00C4B4]/5 border border-[#00C4B4]/10">
                    <p className="text-2xl font-700 text-[#00C4B4]">15</p>
                    <p className="text-[10px] font-800 text-slate-400 uppercase tracking-widest mt-1">Sessions Held</p>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </MentorLayout>
  );
}

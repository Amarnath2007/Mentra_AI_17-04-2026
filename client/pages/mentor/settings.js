import { useState } from 'react';
import MentorLayout from '../../components/mentor/MentorLayout';
import { User, Bell, Shield, Globe, Mail, Save, UserCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export default function MentorSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <MentorLayout title="Settings">
      <div className="max-w-4xl space-y-8 animate-fade-in">
        
        {/* Profile Settings */}
        <div className="bg-white rounded-[32px] border border-[#E5E7EB] overflow-hidden shadow-sm">
           <div className="px-10 py-8 border-b border-[#E5E7EB] bg-[#F9FAFB]/50 flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-700 text-[#111827]" style={{ fontFamily: 'Sora, sans-serif' }}>Mentor Profile</h3>
                 <p className="text-xs text-slate-500 font-500 mt-1 uppercase tracking-widest">Public information and credentials</p>
              </div>
              <button className="px-6 py-2 bg-[#0A66C2] text-white rounded-xl text-sm font-700 shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform flex items-center gap-2">
                 <Save size={16} /> Save Changes
              </button>
           </div>
           
           <div className="p-10 space-y-8">
              <div className="flex items-center gap-8">
                 <div className="w-24 h-24 rounded-3xl bg-[#F9FAFB] border-2 border-dashed border-[#E5E7EB] flex flex-col items-center justify-center text-[#0A66C2] group cursor-pointer hover:border-[#0A66C2] transition-colors">
                    <User size={32} />
                    <span className="text-[10px] font-800 uppercase mt-2">Upload</span>
                 </div>
                 <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-800 text-slate-500 uppercase tracking-widest">Display Name</label>
                          <input type="text" className="w-full bg-[#F3F4F6] border-none rounded-xl py-3 px-4 text-sm font-600 focus:ring-2 focus:ring-[#0A66C2]/20" defaultValue={user?.name} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-800 text-slate-500 uppercase tracking-widest">Email Address</label>
                          <input type="email" className="w-full bg-[#F3F4F6] border-none rounded-xl py-3 px-4 text-sm font-600 focus:ring-2 focus:ring-[#0A66C2]/20" defaultValue={user?.email} />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-800 text-slate-500 uppercase tracking-widest">Bio / Expertise</label>
                       <textarea rows="3" className="w-full bg-[#F3F4F6] border-none rounded-xl py-3 px-4 text-sm font-600 focus:ring-2 focus:ring-[#0A66C2]/20" defaultValue="Senior Full-stack Engineer specializing in React and Node.js with 10+ years of experience." />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Global Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[32px] border border-[#E5E7EB] shadow-sm">
              <h3 className="text-sm font-800 text-[#111827] uppercase tracking-widest mb-8 flex items-center gap-3">
                 <Bell size={18} className="text-[#0A66C2]" />
                 Notifications
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Session Reminders', desc: 'Notify 15 mins before a session.', enabled: true },
                   { label: 'New Submissions', desc: 'Receive alert when a task is submitted.', enabled: true },
                   { label: 'Chat Messages', desc: 'Always notify for new messages.', enabled: false },
                 ].map((opt, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div>
                          <p className="text-sm font-700 text-[#111827]">{opt.label}</p>
                          <p className="text-[11px] text-slate-400 font-500">{opt.desc}</p>
                       </div>
                       <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${opt.enabled ? 'bg-[#00C4B4]' : 'bg-slate-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${opt.enabled ? 'left-6' : 'left-1'}`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-10 rounded-[32px] border border-[#E5E7EB] shadow-sm">
              <h3 className="text-sm font-800 text-[#111827] uppercase tracking-widest mb-8 flex items-center gap-3">
                 <Shield size={18} className="text-[#0A66C2]" />
                 Security
              </h3>
              <div className="space-y-6">
                 <button className="w-full py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-xs font-700 text-[#111827] hover:border-[#0A66C2] transition-colors flex items-center gap-3 px-4 text-left">
                    <UserCheck size={16} className="text-slate-400" /> Two-Factor Authentication
                 </button>
                 <button className="w-full py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-xs font-700 text-[#111827] hover:border-[#0A66C2] transition-colors flex items-center gap-3 px-4 text-left">
                    <Smartphone size={16} className="text-slate-400" /> Device Management
                 </button>
                 <button className="w-full py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-xs font-700 text-[#111827] hover:border-[#0A66C2] transition-colors flex items-center gap-3 px-4 text-left">
                    <Shield size={16} className="text-slate-400" /> Audit Log
                 </button>
              </div>
           </div>
        </div>

      </div>
    </MentorLayout>
  );
}

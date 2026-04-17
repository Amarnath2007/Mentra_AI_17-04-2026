import { Users, Search, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Mentors() {
  return (
    <DashboardLayout title="Find Mentors">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="glass rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-center justify-between border border-slate-100">
          <div>
            <h2 className="text-2xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Connect with Human Mentors</h2>
            <p className="text-slate-500 text-sm">
              Book 1-on-1 sessions with industry experts to review your projects, get career guidance, or do mock interviews.
            </p>
          </div>
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Users size={28} className="text-blue-600" />
          </div>
        </div>

        {/* Search and Filters placeholder */}
        <div className="flex gap-3">
          <div className="glass flex-1 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-100">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search mentors by name, role, or company..." 
              className="bg-transparent border-none outline-none flex-1 text-sm disabled:opacity-50"
              disabled
            />
          </div>
          <button className="glass rounded-xl px-4 py-3 flex items-center gap-2 border border-slate-100 text-slate-500 disabled:opacity-50" disabled>
            <Filter size={18} />
            <span className="text-sm font-500 pt-0.5">Filters</span>
          </button>
        </div>

        {/* Empty State / Coming Soon */}
        <div className="glass rounded-2xl p-16 text-center border border-slate-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
            <Users size={32} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>No Mentors Available Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            We are currently onboarding top-tier industry professionals. Check back soon to connect with expert mentors who can guide your career!
          </p>
          
          <div className="inline-flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Are you an expert?</p>
            <p className="text-sm font-500 text-blue-600 cursor-pointer hover:underline">Apply to become a mentor →</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

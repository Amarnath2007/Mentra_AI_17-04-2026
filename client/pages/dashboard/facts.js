import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getDailyInsights, refreshDailyInsights } from '../../lib/api';
import { Sparkles, Lightbulb, Clock, RotateCw } from 'lucide-react';

export default function DailyFacts() {
  const { user, loading } = useAuth();
  const [dailyInsight, setDailyInsight] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoadingProfile(true);
    try {
      const res = await getDailyInsights().catch(() => ({ data: { insight: null } }));
      setDailyInsight(res.data.insight);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDailyInsights();
      await fetchData();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !user) return null;

  const facts = dailyInsight?.facts || (dailyInsight?.fact ? dailyInsight.fact.split('\n') : []);

  return (
    <DashboardLayout title="Daily Fun Facts">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header Section */}
        <div className="glass rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-center justify-between border border-blue-100 bg-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
          <div>
            <h2 className="text-2xl font-700 mb-2" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700 }}>Knowledge Drops 💡</h2>
            <p className="text-slate-500 text-sm max-w-lg mb-4">
              Personalized facts for: <span className="text-blue-600 font-600">{(user.interests || []).join(', ') || 'Your General Interests'}</span>.
            </p>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-xs font-600 text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100"
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Regenerating...' : 'Not relevant? Refresh facts'}
            </button>
          </div>
          <div className="flex-shrink-0 bg-blue-50 p-4 rounded-2xl border border-blue-100">
             <div className="flex items-center gap-2 text-blue-600 font-600 text-sm">
                <Clock size={16} />
                <span>New facts every 24h</span>
             </div>
          </div>
        </div>

        {/* Fun Facts Grid */}
        <div className="p-2">
          {!dailyInsight && loadingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="skeleton h-48 w-full rounded-2xl" />)}
            </div>
          ) : facts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {facts.map((fact, i) => (
                <div key={i} className="relative group p-7 rounded-[2rem] border border-slate-100 transition-all hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 bg-white shadow-sm overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                      <Lightbulb size={24} />
                    </div>
                    <p className="text-lg text-slate-800 leading-relaxed font-600" style={{ fontFamily: 'Sora,sans-serif', fontWeight: 600 }}>
                      {fact}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-blue-500 font-700 text-xs uppercase tracking-widest">
                       <Sparkles size={12} />
                       Fact #{i+1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-16 text-center border border-slate-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-700 mb-2">Generating Today's Facts</h3>
              <p className="text-slate-500 text-sm">Our AI is curatoring something special for you based on your interests...</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

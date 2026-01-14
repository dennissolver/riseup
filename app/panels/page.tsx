// app/panels/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Plus, Users, BarChart3, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Panel { id: string; name: string; description: string; status: string; total_interviews: number; completed_interviews: number; slug: string; }

export default function PanelsPage() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('agents').select('*').order('created_at', { ascending: false }).then(({ data }) => { setPanels(data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-slate-400">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Interview Panels</h1>
          <a href="/create" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"><Plus className="w-5 h-5" /> Create Panel</a>
        </div>
        {panels.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No panels yet</h2>
            <p className="text-slate-400 mb-6">Create your first interview panel to get started.</p>
            <a href="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"><Plus className="w-5 h-5" /> Create Panel</a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {panels.map(panel => (
              <div key={panel.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">{panel.name}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{panel.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {panel.completed_interviews || 0} completed</span>
                </div>
                <a href={`/panel/${panel.slug}`} className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium">View Panel <ExternalLink className="w-4 h-4" /></a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
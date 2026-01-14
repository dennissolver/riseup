// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Mic, FileSpreadsheet, ChevronRight, Users, BarChart3, Clock } from 'lucide-react';
import { clientConfig } from '@/config/client';

export default function HomePage() {
  const [stats, setStats] = useState({ totalPanels: 0, totalInterviews: 0, avgDuration: 0 });

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{clientConfig.platform.name}</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">{clientConfig.platform.description}</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Users, label: 'Interview Panels', value: stats.totalPanels },
            { icon: BarChart3, label: 'Total Interviews', value: stats.totalInterviews },
            { icon: Clock, label: 'Avg Duration (min)', value: stats.avgDuration },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <stat.icon className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <a href="/create" className="group bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 hover:scale-[1.02] transition-transform">
            <Mic className="w-12 h-12 text-white mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Agent</h2>
            <p className="text-purple-200 mb-4">Talk to our AI setup assistant to create a custom interview panel in minutes.</p>
            <div className="flex items-center text-white font-medium">Start Now <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" /></div>
          </a>

          <a href="/panels" className="group bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors">
            <FileSpreadsheet className="w-12 h-12 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">View Panels</h2>
            <p className="text-slate-400 mb-4">Manage your interview panels, invite participants, and view responses.</p>
            <div className="flex items-center text-green-400 font-medium">View All <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" /></div>
          </a>
        </div>
      </div>
    </div>
  );
}
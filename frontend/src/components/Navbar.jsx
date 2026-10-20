import React from 'react';
import { Plane, ShieldAlert, Cpu, Calendar, Activity, Sliders, History, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, readinessPct, kpis }) {
  const tabs = [
    { id: 'command', label: 'Fleet Command', icon: Plane },
    { id: 'digital-twin', label: 'Digital Twin & Sensors', icon: Activity },
    { id: 'explainability', label: 'AI Explainability & SHAP', icon: Cpu },
    { id: 'optimizer', label: 'CP-SAT Schedule & Spares', icon: Calendar },
    { id: 'what-if', label: 'What-If Simulator', icon: Sliders },
    { id: 'audit', label: 'Tamper-Evident Audit', icon: History }
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0b1120]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & MoD / DSSC Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Plane className="w-6 h-6 rotate-45 transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-white">SKYREADY</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  SIH26249 • MoD / DSSC
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  Team ZEN
                </span>
              </div>
              <p className="text-xs text-slate-400">Predictive Maintenance & Fleet Availability Optimizer</p>
            </div>
          </div>

          {/* Squadron Readiness Badge */}
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Fleet Availability</div>
                <div className="text-sm font-bold text-emerald-400 font-mono flex items-center justify-end gap-1">
                  <span>{readinessPct || 86.8}%</span>
                  <span className="text-[10px] text-emerald-500 font-normal">(+15.4 pt gain)</span>
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <div className="text-xs font-mono text-slate-300">
                <span className="text-slate-400">CP-SAT:</span> OPTIMAL
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

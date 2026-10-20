import React, { useState } from 'react';
import { Shield, AlertTriangle, Clock, CheckCircle2, ChevronRight, Wrench, Sparkles, Filter } from 'lucide-react';

export default function FleetCommandView({ fleetData, onSelectAircraft, onNavigateTab }) {
  const [filter, setFilter] = useState('ALL');
  const fleet = fleetData?.aircraft || [];
  const kpis = fleetData?.kpis || {};

  const filteredFleet = fleet.filter(ac => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return ac.status === 'CRITICAL_RISK';
    if (filter === 'SCHEDULED') return ac.status === 'SCHEDULED_MAINTENANCE';
    if (filter === 'READY') return ac.status === 'MISSION_READY';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Notification / Squadron Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              No. 45 Flying Daggers • Fleet Command Center
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE COCKPIT TELEMETRY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronized 24 twin-engine multirole fighter airframes. Continuous C-MAPSS anomaly tracking & CP-SAT scheduling active.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('optimizer')}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 font-mono"
        >
          <Sparkles className="w-4 h-4" />
          View CP-SAT Master Plan
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Availability Rate */}
        <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Fleet Availability</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              +15.4 pt
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
            <span>{kpis.current_availability_pct || 86.8}%</span>
            <span className="text-xs text-slate-400 font-normal">vs 71.4% reactive</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${kpis.current_availability_pct || 86.8}%` }}
            ></div>
          </div>
        </div>

        {/* Ready Aircraft */}
        <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Mission Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
            <span>{kpis.mission_ready_count || 18}</span>
            <span className="text-xs text-slate-400 font-normal">/ {kpis.total_aircraft || 24} Airframes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Sortie ready with 100% weapons & avionics go-status
          </p>
        </div>

        {/* Scheduled Maintenance */}
        <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Scheduled Bay Slots</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono flex items-baseline gap-2">
            <span>{kpis.scheduled_maint_count || 3}</span>
            <span className="text-xs text-slate-400 font-normal">Airframes In Queue</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Optimized into bundled bay visits (no fragmented downtime)
          </p>
        </div>

        {/* Critical RUL Interventions */}
        <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Critical RUL Warning</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono flex items-baseline gap-2">
            <span>{kpis.critical_risk_count || 3}</span>
            <span className="text-xs text-slate-400 font-normal">Safe RUL &lt; 7 Days</span>
          </div>
          <p className="text-[11px] text-rose-400/80 mt-2 font-mono">
            Pessimistic bounds locked; spares pre-allocated
          </p>
        </div>
      </div>

      {/* Squadron Airframe Matrix Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Squadron Airframe Status Matrix (24 Airframes)</span>
            <span className="text-xs text-slate-400 font-normal">Click any jet to inspect Digital Twin</span>
          </h3>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {[
            { id: 'ALL', label: 'All (24)' },
            { id: 'READY', label: 'Ready' },
            { id: 'SCHEDULED', label: 'Scheduled' },
            { id: 'CRITICAL', label: 'Critical' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                filter === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 24-Aircraft Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredFleet.map(ac => {
          const isCritical = ac.status === 'CRITICAL_RISK';
          const isScheduled = ac.status === 'SCHEDULED_MAINTENANCE';
          const isReady = ac.status === 'MISSION_READY';

          const cardBorder = isCritical
            ? 'border-rose-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20'
            : isScheduled
            ? 'border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20'
            : 'border-slate-800 bg-[#0b1120] hover:border-cyan-500/40';

          const statusBadge = isCritical ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-semibold">
              CRITICAL RISK
            </span>
          ) : isScheduled ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              SCHEDULED
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              MISSION READY
            </span>
          );

          return (
            <div
              key={ac.tail_number}
              onClick={() => {
                onSelectAircraft(ac.tail_number);
                onNavigateTab('digital-twin');
              }}
              className={`border ${cardBorder} rounded-xl p-3.5 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg relative group`}
            >
              {/* Header: Tail & Status */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white font-mono group-hover:text-cyan-400 transition-colors">
                    {ac.tail_number}
                  </div>
                  <div className="text-[11px] text-slate-400">{ac.callsign}</div>
                </div>
                {statusBadge}
              </div>

              {/* Health Score & Subsystem Risk */}
              <div className="mt-2 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Health Index:</span>
                <span className={`font-bold ${
                  ac.health_score < 60 ? 'text-rose-400' : ac.health_score < 80 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {ac.health_score} / 100
                </span>
              </div>

              {/* RUL Quantiles Band (Slide 2 & 3: RUL ranges feed safety constraints) */}
              <div className="mt-1 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">RUL Quantile:</span>
                <span className="text-slate-200">{ac.rul.display_range}</span>
              </div>

              <div className="mt-1 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Safe Window:</span>
                <span className={`font-bold ${isCritical ? 'text-rose-400' : 'text-slate-300'}`}>
                  {ac.rul.safe_days_remaining} Days Remaining
                </span>
              </div>

              {/* Subsystem & Required Spares */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[140px] text-cyan-300/80 font-mono">
                  {ac.subsystem_at_risk}
                </span>
                <span className="flex items-center text-slate-400 group-hover:text-cyan-400 transition-colors text-[10px] font-mono">
                  Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

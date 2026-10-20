import React, { useState } from 'react';
import { Sliders, AlertOctagon, TrendingDown, ArrowRight, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

export default function WhatIfSimulatorView({ onRunSimulation, simulationResult, isSimulating }) {
  const [sparesDelay, setSparesDelay] = useState(5);
  const [demandSurge, setDemandSurge] = useState(1.3);
  const [closedBay, setClosedBay] = useState('Bay-2');
  const [techShortage, setTechShortage] = useState(25);

  const handleSimulate = () => {
    onRunSimulation({
      spares_delay_days: parseInt(sparesDelay),
      demand_surge_multiplier: parseFloat(demandSurge),
      closed_bay_id: closedBay,
      technician_shortage_pct: parseInt(techShortage)
    });
  };

  const sim = simulationResult || {};
  const baseline = sim.baseline || {};
  const scenario = sim.scenario || {};
  const impact = sim.impact || {};
  const timeline = sim.comparative_timeline || [];
  const mitigations = sim.contingency_mitigations || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono uppercase">
                Dynamic What-If Operational Readiness Sandbox
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                RE-PLANS IN &lt; 2 SECONDS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Stress-test the squadron against supply delays, high-tempo combat sorties, technician outages & bay closures
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-mono flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          {isSimulating ? 'Solving Scenario...' : 'Execute What-If Re-Plan'}
        </button>
      </div>

      {/* Scenario Control Panel (Sliders & Toggles) */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 mb-4">
          Scenario Parameter Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
          {/* Spares Delay */}
          <div className="space-y-2 bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Spares Supply Chain Delay:</span>
              <span className="text-amber-400 font-bold">+{sparesDelay} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={sparesDelay}
              onChange={(e) => setSparesDelay(e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Simulates logistics lag from ordnance depots
            </p>
          </div>

          {/* Sortie Demand Surge */}
          <div className="space-y-2 bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Operational Tempo Surge:</span>
              <span className="text-rose-400 font-bold">{demandSurge}x Sorties</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.8"
              step="0.1"
              value={demandSurge}
              onChange={(e) => setDemandSurge(e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Accelerates cycle wear & tightens safe RUL limits
            </p>
          </div>

          {/* Bay Outage */}
          <div className="space-y-2 bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Unscheduled Bay Closure:</span>
              <span className="text-purple-400 font-bold">{closedBay}</span>
            </div>
            <select
              value={closedBay}
              onChange={(e) => setClosedBay(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-cyan-300 rounded px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="None">None (All 3 Bays Operational)</option>
              <option value="Bay-1">Bay-1 (Heavy Overhaul Offline)</option>
              <option value="Bay-2">Bay-2 (Line Maint Offline)</option>
              <option value="Bay-3">Bay-3 (Avionics Bay Offline)</option>
            </select>
            <p className="text-[10px] text-slate-400">
              Forces solver to re-allocate with reduced capacity
            </p>
          </div>

          {/* Technician Shortage */}
          <div className="space-y-2 bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Technician Crew Shortage:</span>
              <span className="text-rose-400 font-bold">-{techShortage}% Roster</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={techShortage}
              onChange={(e) => setTechShortage(e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Simulates deployment or sick roster deficit
            </p>
          </div>
        </div>
      </div>

      {/* Comparative Results & Impact Summary */}
      {sim.parameters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Baseline Card */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 font-mono">
            <div className="text-[11px] text-slate-400 uppercase">Baseline Optimal Readiness</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {baseline.fleet_availability_pct}%
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {baseline.ready_aircraft_days} / 720 Ready Aircraft-Days
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Status: {baseline.status} (Solved in {baseline.solve_time_ms} ms)
            </div>
          </div>

          {/* Scenario Card */}
          <div className="bg-[#0b1120] border border-purple-500/40 rounded-xl p-4 font-mono">
            <div className="text-[11px] text-purple-300 uppercase">Stress Scenario Readiness</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {scenario.fleet_availability_pct}%
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {scenario.ready_aircraft_days} / 720 Ready Aircraft-Days
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Status: {scenario.status} (Re-solved in {scenario.solve_time_ms} ms)
            </div>
          </div>

          {/* Impact Delta */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 font-mono">
            <div className="text-[11px] text-slate-400 uppercase">Readiness Impact Delta</div>
            <div className={`text-2xl font-bold mt-1 ${impact.delta_availability_pct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {impact.delta_availability_pct}%
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {impact.delta_ready_aircraft_days} Ready Aircraft-Days Delta
            </div>
            <div className="text-[10px] mt-2">
              <span className={`px-2 py-0.5 rounded font-semibold ${
                impact.readiness_severity === 'SEVERE_DEGRADATION'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {impact.readiness_severity || 'STABLE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comparative Readiness Curve (30-day timeline) */}
      {timeline.length > 0 && (
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                Comparative 30-Day Fleet Availability Timeline
              </h3>
              <p className="text-xs text-slate-400">
                Emerald = Baseline Plan | Amber = Scenario Re-Plan
              </p>
            </div>
          </div>

          {/* Timeline visualization */}
          <div className="h-32 flex items-end gap-1 pt-4 border-b border-slate-800">
            {timeline.map((pt, idx) => {
              const baseHeight = (pt.baseline_ready / 24) * 100;
              const scenHeight = (pt.scenario_ready / 24) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full flex items-end gap-0.5 h-24">
                    <div
                      className="flex-1 bg-emerald-500/70 rounded-t"
                      style={{ height: `${baseHeight}%` }}
                      title={`Day ${pt.day} Baseline: ${pt.baseline_ready}/24`}
                    ></div>
                    <div
                      className="flex-1 bg-amber-500/80 rounded-t"
                      style={{ height: `${scenHeight}%` }}
                      title={`Day ${pt.day} Scenario: ${pt.scenario_ready}/24`}
                    ></div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-400">D{pt.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Day 1 (Immediate)</span>
            <span>Day 15 (Mid-Horizon)</span>
            <span>Day 30 (End-Horizon)</span>
          </div>
        </div>
      )}

      {/* Recommended Contingency Mitigations */}
      {mitigations.length > 0 && (
        <div className="bg-slate-900/60 border border-cyan-500/30 rounded-xl p-5 space-y-3 font-mono">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            AI-Synthesized Operational Contingency Protocol
          </h3>
          <ul className="space-y-2 text-xs text-slate-200">
            {mitigations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-cyan-400 font-bold">[{idx + 1}]</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Plane, AlertTriangle, ShieldCheck, Activity, Gauge, Flame, Wrench, ArrowRight, Zap, Info } from 'lucide-react';

export default function DigitalTwinView({
  fleet,
  selectedTail,
  onSelectTail,
  aircraftDetails,
  onNavigateTab
}) {
  const currentAircraft = aircraftDetails?.aircraft || fleet?.find(a => a.tail_number === selectedTail) || fleet?.[0];
  const telemetryHistory = aircraftDetails?.telemetry_history || currentAircraft?.recent_telemetry || [];
  const rul = currentAircraft?.rul || {};
  const maint = currentAircraft?.maintenance_spec || {};
  const anomaly = aircraftDetails?.anomaly_analysis || {};

  const isCritical = currentAircraft?.status === 'CRITICAL_RISK';
  const isScheduled = currentAircraft?.status === 'SCHEDULED_MAINTENANCE';

  // Extract latest sensor values
  const latest = telemetryHistory[telemetryHistory.length - 1] || {};

  return (
    <div className="space-y-6">
      {/* Aircraft Selector & Status Ribbon */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Plane className="w-5 h-5 rotate-45 transform" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label htmlFor="aircraft-select" className="text-xs font-mono text-slate-400 uppercase">
                Active Digital Twin:
              </label>
              <select
                id="aircraft-select"
                value={selectedTail}
                onChange={(e) => onSelectTail(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-sm rounded px-2.5 py-1 focus:outline-none focus:border-cyan-400"
              >
                {fleet?.map((a) => (
                  <option key={a.tail_number} value={a.tail_number}>
                    {a.tail_number} ({a.callsign}) - {a.status} [Health: {a.health_score}]
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Twin-Engine Fighter • Flight Hours: {currentAircraft?.flight_hours} hrs • Cycles Flown: {currentAircraft?.cycles_flown}
            </p>
          </div>
        </div>

        {/* Quick CTA to Explainability */}
        <button
          onClick={() => onNavigateTab('explainability')}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono transition-all"
        >
          <span>Inspect SHAP Attribution</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Digital Twin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Subsystem Schematics */}
        <div className="lg:col-span-1 bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Airframe Subsystem Health</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
              isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {currentAircraft?.status}
            </span>
          </h3>

          {/* Subsystems List */}
          <div className="space-y-3">
            {/* Propulsion Subsystem */}
            <div className={`p-3 rounded-lg border ${
              currentAircraft?.subsystem_at_risk === 'Propulsion' && isCritical
                ? 'border-rose-500/40 bg-rose-950/20'
                : 'border-slate-800 bg-slate-900/60'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-2 text-slate-200">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Turbofan Propulsion
                </span>
                <span className={currentAircraft?.subsystem_at_risk === 'Propulsion' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {currentAircraft?.subsystem_at_risk === 'Propulsion' ? 'VIBRATION / EGT ANOMALY' : 'NORMAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                LPT/HPC stage health, turbine blade coatings, bypass ratio & fuel flow
              </p>
            </div>

            {/* Hydraulics */}
            <div className={`p-3 rounded-lg border ${
              currentAircraft?.subsystem_at_risk === 'Hydraulics'
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-slate-800 bg-slate-900/60'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-2 text-slate-200">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Flight Controls & Hydraulics
                </span>
                <span className={currentAircraft?.subsystem_at_risk === 'Hydraulics' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {currentAircraft?.subsystem_at_risk === 'Hydraulics' ? 'PRESSURE DRIFT' : 'NOMINAL (3000 PSI)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Primary flight surface actuators, differential return filters
              </p>
            </div>

            {/* Avionics */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-2 text-slate-200">
                  <Zap className="w-4 h-4 text-purple-400" />
                  AESA Radar & Mission Avionics
                </span>
                <span className="text-emerald-400 font-bold">100% BIT PASS</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transceiver array junction temperatures within nominal &lt;65°C bounds
              </p>
            </div>

            {/* Landing Gear */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-2 text-slate-200">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  Landing Gear & Carbon Brakes
                </span>
                <span className="text-emerald-400 font-bold">NOMINAL</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Strut pressure 145 bar, carbon brake disc thickness within spec
              </p>
            </div>
          </div>

          {/* RUL Quantile Summary Card */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 space-y-2">
            <div className="text-xs uppercase font-mono text-cyan-400 font-bold flex items-center justify-between">
              <span>RUL Uncertainty Interval</span>
              <Info className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {rul.display_range || 'Calculating...'}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
              <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20">
                <div className="text-[10px] text-rose-300">P10 (Pessimistic)</div>
                <div className="text-xs font-bold text-rose-400">{rul.p10_pessimistic} cycles</div>
              </div>
              <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                <div className="text-[10px] text-cyan-300">P50 (Median)</div>
                <div className="text-xs font-bold text-cyan-400">{rul.median} cycles</div>
              </div>
              <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-300">P90 (Optimistic)</div>
                <div className="text-xs font-bold text-emerald-400">{rul.p90_optimistic} cycles</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              *Core CP-SAT rule: Pessimistic P10 ({rul.p10_pessimistic} cycles / {rul.safe_days_remaining} days) dictates the latest safe maintenance date.
            </p>
          </div>
        </div>

        {/* Right Column (2 cols): Live C-MAPSS Sensor Telemetry & Curves */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                  NASA C-MAPSS Turbofan Sensor Dynamics (Last 15 Sortie Cycles)
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous run-to-failure tracking across critical thermodynamic vectors
                </p>
              </div>
              <div className="text-right font-mono text-xs text-cyan-400">
                Latest Cycle: #{latest.cycle || currentAircraft?.cycles_flown}
              </div>
            </div>

            {/* 4 Telemetry Gauges / Live Value Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-[10px] uppercase font-mono text-slate-400">EGT / T50 (°R)</div>
                <div className="text-lg font-bold font-mono text-amber-400">{latest.T50_EGT || 1400}</div>
                <div className="text-[10px] text-slate-400 font-mono">Baseline: 1400.0 R</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-[10px] uppercase font-mono text-slate-400">HPC Static Press (psia)</div>
                <div className="text-lg font-bold font-mono text-cyan-400">{latest.P30_Press || 553}</div>
                <div className="text-[10px] text-slate-400 font-mono">Baseline: 553.5 psia</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-[10px] uppercase font-mono text-slate-400">HP Rotor Vibration (in/s)</div>
                <div className={`text-lg font-bold font-mono ${latest.vibration > 0.3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {latest.vibration || 0.12}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Limit: &lt; 0.35 in/s</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                <div className="text-[10px] uppercase font-mono text-slate-400">Core Shaft Speed Nc (rpm)</div>
                <div className="text-lg font-bold font-mono text-slate-200">{latest.Nc_Core || 9050}</div>
                <div className="text-[10px] text-slate-400 font-mono">Nominal: 9050 rpm</div>
              </div>
            </div>

            {/* Visual Telemetry Trend Representation */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
              <div className="text-xs font-mono text-slate-300 font-semibold mb-3 flex items-center justify-between">
                <span>EGT Degradation Trajectory & Thermal Wear Progression</span>
                <span className="text-[11px] text-amber-400 font-normal">Amber Line = EGT (°R)</span>
              </div>

              {/* Sparkline / Bar progression */}
              <div className="h-32 flex items-end gap-1.5 pt-4 px-2 border-b border-slate-800">
                {telemetryHistory.map((pt, idx) => {
                  // Normalize EGT (1390 - 1500 R) to height %
                  const egt = pt.T50_EGT || 1400;
                  const heightPct = Math.min(100, Math.max(15, ((egt - 1390) / 100) * 100));
                  const isHigh = egt > 1450;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isHigh ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-amber-400/80 group-hover:bg-amber-300'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      ></div>
                      <span className="text-[9px] font-mono text-slate-400 mt-1">#{pt.cycle}</span>

                      {/* Tooltip */}
                      <div className="absolute -top-10 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-20">
                        Cycle {pt.cycle}: {egt}°R | Vib: {pt.vibration} in/s
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                <span>Initial Cruise Baseline: ~1400 R</span>
                <span className="text-rose-400">Threshold Limit: 1470 R</span>
              </div>
            </div>
          </div>

          {/* Action Spec & Spares Requirement */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-slate-400">Pre-Configured Maintenance Action</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {maint.duration_days} Days in {maint.recommended_bay} • Requires {maint.technicians_needed} {maint.primary_specialty} Techs
              </div>
              <div className="text-xs text-cyan-400 font-mono mt-0.5">
                Spare Requisition: {maint.spare_name} (Lead Time: {maint.spare_lead_time} days)
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('optimizer')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-mono transition-all"
            >
              Verify in CP-SAT Gantt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

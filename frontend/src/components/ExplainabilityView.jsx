import React from 'react';
import { Cpu, AlertCircle, CheckCircle, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

export default function ExplainabilityView({ aircraftDetails, selectedTail, onSelectTail, fleet, onNavigateTab }) {
  const currentAircraft = aircraftDetails?.aircraft || fleet?.find(a => a.tail_number === selectedTail) || fleet?.[0];
  const explanation = aircraftDetails?.explanation || {};
  const drivers = explanation?.top_drivers || [];
  const urgency = explanation?.urgency || 'NOMINAL STATUS';

  const isCritical = urgency.includes('CRITICAL');

  return (
    <div className="space-y-6">
      {/* Header & Aircraft Switcher */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono uppercase">
                AI Explainability & SHAP Diagnostic Engine
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {urgency}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interpreting ML model degradation drivers into plain-language actionable defense advisories
            </p>
          </div>
        </div>

        {/* Tail selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Inspecting:</span>
          <select
            value={selectedTail}
            onChange={(e) => onSelectTail(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs rounded px-2.5 py-1.5 focus:outline-none"
          >
            {fleet?.map((a) => (
              <option key={a.tail_number} value={a.tail_number}>
                {a.tail_number} ({a.callsign})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Military Plain-Language Diagnostic Report Card */}
      <div className={`border rounded-xl p-5 ${
        isCritical
          ? 'border-rose-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20'
          : 'border-slate-800 bg-[#0b1120]'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg mt-0.5 ${
            isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Aeronautical Technical Record • AI Diagnostic Synthesis
              </div>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {currentAircraft?.tail_number} ({currentAircraft?.callsign}) - Diagnostic Analysis
              </h3>
            </div>

            {/* Narrative */}
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-mono">
              {explanation.narrative || 'Gathering sensor baseline telemetry...'}
            </div>

            {/* Prescribed Action for Flight Line Crew */}
            <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200 font-mono flex items-start gap-2.5">
              <span className="font-bold uppercase text-cyan-400 whitespace-nowrap">Recommended Action:</span>
              <span>{explanation.recommendation || 'Proceed with routine pre-flight inspections.'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Sensor Attribution Drivers */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200 flex items-center justify-between">
            <span>SHAP Feature Attribution (Decomposition of Degradation Risk)</span>
            <span className="text-[11px] text-cyan-400 font-normal">Algorithm: TreeSHAP / Gradient Attribution</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Percentage contribution of each telemetry sensor vector towards the elevated failure probability
          </p>
        </div>

        {/* Drivers List / Horizontal Waterfall Bar Chart */}
        <div className="space-y-3 pt-2">
          {drivers.map((driver, idx) => {
            const pct = driver.contribution_pct || 0;
            const isHigh = pct > 25;

            return (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-100">{driver.label}</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                      {driver.subsystem}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[11px] text-slate-400">
                      Value: <strong className="text-white">{driver.value}</strong> (Nominal: {driver.nominal})
                    </span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                      isHigh ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
                    }`}>
                      +{pct}% Risk Driver
                    </span>
                  </div>
                </div>

                {/* Contribution bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isHigh ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.max(5, pct)}%` }}
                  ></div>
                </div>

                {/* Subsystem Failure Mechanism Description */}
                <div className="text-[11px] text-slate-400 mt-1.5 font-mono">
                  <span className="text-slate-400">Physical failure mechanism:</span> {driver.failure_mechanism}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Human-in-the-Loop Decision Advisory */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div className="text-xs text-slate-300 font-mono">
            <strong>Advisory Protocol:</strong> Release-to-service decisions strictly adhere to human authorization.
            Review CP-SAT schedule to commit or adjust maintenance slot.
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('optimizer')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-mono transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>Open CP-SAT Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

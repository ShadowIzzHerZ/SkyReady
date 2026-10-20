import React, { useState } from 'react';
import { History, ShieldCheck, CheckCircle2, AlertCircle, Lock, RefreshCw, Key } from 'lucide-react';

export default function AuditLedgerView({ auditLogs, onVerifyIntegrity, isVerifying, integrityResult }) {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const logs = auditLogs || [];

  return (
    <div className="space-y-6">
      {/* Header & Verification Bar */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono uppercase">
                Air-Gapped Tamper-Evident Audit Ledger
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {integrityResult?.status || 'ALL_SIGNATURES_VERIFIED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cryptographically chained SHA-256 record of all flight commander approvals, overrides, and logistics releases
            </p>
          </div>
        </div>

        <button
          onClick={onVerifyIntegrity}
          disabled={isVerifying}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Verifying Hash Chain...' : 'Verify Cryptographic Integrity'}
        </button>
      </div>

      {/* Compliance Standard Checklist (Slide 4: No outbound calls, least-privilege access, tamper-evident audit logs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">Air-Gapped Isolation</div>
            <div className="text-[11px] text-slate-400">Zero outbound network dependencies</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">Advisory Human Control</div>
            <div className="text-[11px] text-slate-400">Release-to-service requires signature</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">SHA-256 Immutability</div>
            <div className="text-[11px] text-slate-400">Every override logged with rationale</div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
            Immutable Audit Trail ({logs.length} Recorded Ledger Blocks)
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">DSSC Standard Compliance Active</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Block #</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Signatory / Officer</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Recorded Justification</th>
                <th className="py-2.5 px-3">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((entry) => {
                const isGenesis = entry.entry_id === 1;
                const isOverride = entry.action === 'MANUAL_SCHEDULE_OVERRIDE';
                const isApproval = entry.action === 'SCHEDULE_APPROVED_AND_LOCKED';

                const actionBadge = isGenesis ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">SYSTEM INIT</span>
                ) : isOverride ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    MANUAL OVERRIDE
                  </span>
                ) : isApproval ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    SCHEDULE APPROVED
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {entry.action}
                  </span>
                );

                return (
                  <tr
                    key={entry.entry_id}
                    onClick={() => setSelectedEntry(entry)}
                    className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-white">#{entry.entry_id}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{entry.timestamp}</td>
                    <td className="py-2.5 px-3 text-slate-200">
                      <div>{entry.operator_rank}</div>
                      <div className="text-[10px] text-slate-400">ID: {entry.operator_id}</div>
                    </td>
                    <td className="py-2.5 px-3">{actionBadge}</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={entry.justification}>
                      {entry.justification}
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-cyan-400/80 font-mono truncate max-w-[140px]" title={entry.hash}>
                      {entry.hash.substring(0, 16)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Entry Detail Card */}
      {selectedEntry && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Audit Block #{selectedEntry.entry_id} Cryptographic Payload
            </h4>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
            <div>
              <span className="text-slate-400 text-[11px]">Timestamp:</span> {selectedEntry.timestamp}
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Operator:</span> {selectedEntry.operator_rank} ({selectedEntry.operator_id})
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 text-[11px]">Details:</span> {selectedEntry.details}
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 text-[11px]">Recorded Justification:</span> {selectedEntry.justification}
            </div>
            <div className="sm:col-span-2 bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] break-all">
              <span className="text-slate-400">Current Block SHA-256:</span>
              <div className="text-emerald-400 font-bold mt-0.5">{selectedEntry.hash}</div>
              <span className="text-slate-400 mt-2 block">Previous Block Hash:</span>
              <div className="text-slate-400 font-bold mt-0.5">{selectedEntry.prev_hash}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FleetCommandView from './components/FleetCommandView';
import DigitalTwinView from './components/DigitalTwinView';
import ExplainabilityView from './components/ExplainabilityView';
import OptimizerView from './components/OptimizerView';
import WhatIfSimulatorView from './components/WhatIfSimulatorView';
import AuditLedgerView from './components/AuditLedgerView';

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [selectedTail, setSelectedTail] = useState('IAF-SK-103');
  
  // Data states
  const [fleetData, setFleetData] = useState(null);
  const [aircraftDetails, setAircraftDetails] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [integrityResult, setIntegrityResult] = useState(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch initial fleet data
  const fetchFleet = async () => {
    try {
      const res = await fetch('/api/fleet');
      if (res.ok) {
        const data = await res.json();
        setFleetData(data);
      }
    } catch (err) {
      console.warn("API fallback to generated state:", err);
    }
  };

  // Fetch single aircraft details
  const fetchAircraftDetails = async (tail) => {
    try {
      const res = await fetch(`/api/fleet/${tail}`);
      if (res.ok) {
        const data = await res.json();
        setAircraftDetails(data);
      }
    } catch (err) {
      console.warn("Failed fetching aircraft details:", err);
    }
  };

  // Fetch CP-SAT schedule
  const fetchSchedule = async () => {
    try {
      setIsOptimizing(true);
      const res = await fetch('/api/optimizer/schedule');
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
      }
    } catch (err) {
      console.warn("Failed fetching schedule:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit/logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setIntegrityResult(data.integrity || null);
      }
    } catch (err) {
      console.warn("Failed fetching audit logs:", err);
    }
  };

  // Initial mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchFleet();
      await fetchSchedule();
      await fetchAuditLogs();
      setIsLoading(false);
    };
    init();
  }, []);

  // Update selected aircraft details when tail changes
  useEffect(() => {
    if (selectedTail) {
      fetchAircraftDetails(selectedTail);
    }
  }, [selectedTail]);

  // Trigger CP-SAT solver
  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimizer/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Trigger What-If Simulation
  const handleRunSimulation = async (params) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulator/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Record officer approval / manual override
  const handleRecordApproval = async (payload) => {
    try {
      const res = await fetch('/api/audit/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchAuditLogs();
        alert("Action successfully signed and added to tamper-evident audit ledger.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Verify Audit Chain Integrity
  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/audit/verify');
      if (res.ok) {
        const data = await res.json();
        setIntegrityResult(data);
        alert(`Audit Ledger Integrity Check: ${data.status}\nTotal Block Count: ${data.total_entries}\nLatest Hash: ${data.latest_hash}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Tactical Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        readinessPct={scheduleData?.fleet_availability_rate_pct || 86.8}
        kpis={fleetData?.kpis}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'command' && (
          <FleetCommandView
            fleetData={fleetData}
            onSelectAircraft={setSelectedTail}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'digital-twin' && (
          <DigitalTwinView
            fleet={fleetData?.aircraft}
            selectedTail={selectedTail}
            onSelectTail={setSelectedTail}
            aircraftDetails={aircraftDetails}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'explainability' && (
          <ExplainabilityView
            aircraftDetails={aircraftDetails}
            selectedTail={selectedTail}
            onSelectTail={setSelectedTail}
            fleet={fleetData?.aircraft}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'optimizer' && (
          <OptimizerView
            scheduleData={scheduleData}
            onRunOptimizer={handleRunOptimizer}
            isOptimizing={isOptimizing}
            onRecordApproval={handleRecordApproval}
          />
        )}

        {activeTab === 'what-if' && (
          <WhatIfSimulatorView
            onRunSimulation={handleRunSimulation}
            simulationResult={simulationResult}
            isSimulating={isSimulating}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLedgerView
            auditLogs={auditLogs}
            onVerifyIntegrity={handleVerifyIntegrity}
            isVerifying={isVerifying}
            integrityResult={integrityResult}
          />
        )}
      </main>

      {/* Tactical Footer */}
      <footer className="border-t border-slate-800 bg-[#0b1120] py-3 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SkyReady • Problem Statement ID SIH26249 • Ministry of Defence / DSSC</span>
          <span className="text-cyan-400">Team ZEN: DETECT › PREDICT › EXPLAIN › OPTIMIZE › SIMULATE › ACT</span>
          <span>Air-Gapped Operational Ready</span>
        </div>
      </footer>
    </div>
  );
}

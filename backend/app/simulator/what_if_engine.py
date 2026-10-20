from typing import Dict, Any
from app.optimizer.fleet_optimizer import fleet_optimizer
from app.data.fleet_generator import get_fleet_state

class WhatIfSimulationEngine:
    """
    Evaluates dynamic stress scenarios in real-time (<2 seconds)
    Contrasting baseline optimized schedule against severe operational deviations.
    """
    def run_simulation(
        self,
        spares_delay_days: int = 0,
        demand_surge_multiplier: float = 1.0,
        closed_bay_id: str = None,
        technician_shortage_pct: int = 0
    ) -> Dict[str, Any]:
        # 1. Baseline optimization (normal conditions)
        baseline_result = fleet_optimizer.optimize_schedule(
            spares_delay_days=0,
            technician_penalty_pct=0,
            closed_bay_id=None,
            operational_surge_multiplier=1.0
        )

        # 2. Scenario optimization under active stress
        scenario_result = fleet_optimizer.optimize_schedule(
            spares_delay_days=spares_delay_days,
            technician_penalty_pct=technician_shortage_pct,
            closed_bay_id=closed_bay_id if closed_bay_id and closed_bay_id != "None" else None,
            operational_surge_multiplier=demand_surge_multiplier
        )

        # 3. Comparative delta analytics
        baseline_avail = baseline_result["fleet_availability_rate_pct"]
        scenario_avail = scenario_result["fleet_availability_rate_pct"]
        delta_pct = round(scenario_avail - baseline_avail, 1)

        baseline_ready_days = baseline_result["ready_aircraft_days"]
        scenario_ready_days = scenario_result["ready_aircraft_days"]
        delta_ready_days = scenario_ready_days - baseline_ready_days

        # Synthesis of mitigation strategy
        mitigations = []
        if spares_delay_days > 0:
            mitigations.append(f"Trigger priority emergency airlift for critical spares (+{spares_delay_days}d supplier lag). Requisition from Base Depot Hashimara.")
        if closed_bay_id and closed_bay_id != "None":
            mitigations.append(f"Bay outage at {closed_bay_id}: Reschedule inspections into 2-shift extended cycles on surviving bays.")
        if technician_shortage_pct > 0:
            mitigations.append(f"Technician capacity restricted by {technician_shortage_pct}%: Re-assign Master Sergeants to critical engine swaps; defer non-essential brake disc inspections.")
        if demand_surge_multiplier > 1.1:
            mitigations.append(f"High-tempo combat sortie surge ({int(demand_surge_multiplier*100)}% tempo): Enforce strict 15-cycle borescope pacing to catch accelerated seal wear.")

        if not mitigations:
            mitigations.append("Nominal operational profile. Fleet availability remains optimized at peak readiness.")

        # Comparison timeline (ready aircraft per day)
        comparative_timeline = []
        for d in range(30):
            comparative_timeline.append({
                "day": d + 1,
                "baseline_ready": baseline_result["daily_availability_timeline"][d]["ready_aircraft"],
                "scenario_ready": scenario_result["daily_availability_timeline"][d]["ready_aircraft"],
                "baseline_readiness_pct": baseline_result["daily_availability_timeline"][d]["readiness_pct"],
                "scenario_readiness_pct": scenario_result["daily_availability_timeline"][d]["readiness_pct"]
            })

        return {
            "parameters": {
                "spares_delay_days": spares_delay_days,
                "demand_surge_multiplier": demand_surge_multiplier,
                "closed_bay_id": closed_bay_id or "None",
                "technician_shortage_pct": technician_shortage_pct
            },
            "baseline": {
                "fleet_availability_pct": baseline_avail,
                "ready_aircraft_days": baseline_ready_days,
                "status": baseline_result["solver_status"],
                "solve_time_ms": baseline_result["solve_time_ms"]
            },
            "scenario": {
                "fleet_availability_pct": scenario_avail,
                "ready_aircraft_days": scenario_ready_days,
                "status": scenario_result["solver_status"],
                "solve_time_ms": scenario_result["solve_time_ms"]
            },
            "impact": {
                "delta_availability_pct": delta_pct,
                "delta_ready_aircraft_days": delta_ready_days,
                "readiness_severity": "SEVERE_DEGRADATION" if delta_pct < -8 else ("MODERATE_IMPACT" if delta_pct < -3 else "MINIMAL_IMPACT")
            },
            "contingency_mitigations": mitigations,
            "comparative_timeline": comparative_timeline,
            "scenario_interventions": scenario_result["scheduled_interventions"]
        }

what_if_engine = WhatIfSimulationEngine()

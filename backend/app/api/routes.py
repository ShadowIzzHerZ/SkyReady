from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.data.fleet_generator import get_fleet_state, SPARE_CATALOG, HANGAR_BAYS, TECHNICIANS
from app.ml.anomaly_detector import anomaly_detector
from app.ml.rul_predictor import rul_predictor
from app.ml.explainer import explainer_service
from app.optimizer.fleet_optimizer import fleet_optimizer
from app.simulator.what_if_engine import what_if_engine
from app.services.audit_service import audit_service

router = APIRouter()

class WhatIfRequest(BaseModel):
    spares_delay_days: int = 0
    demand_surge_multiplier: float = 1.0
    closed_bay_id: Optional[str] = "None"
    technician_shortage_pct: int = 0

class ApprovalActionRequest(BaseModel):
    operator_id: str
    operator_rank: str
    action: str
    details: str
    justification: str

@router.get("/fleet")
def get_fleet_overview():
    fleet_data = get_fleet_state()
    fleet = fleet_data["fleet"]
    
    total = len(fleet)
    mission_ready = sum(1 for ac in fleet if ac["status"] == "MISSION_READY")
    scheduled_maint = sum(1 for ac in fleet if ac["status"] == "SCHEDULED_MAINTENANCE")
    critical_risk = sum(1 for ac in fleet if ac["status"] == "CRITICAL_RISK")
    
    avg_health = round(sum(ac["health_score"] for ac in fleet) / total, 1)
    current_availability_pct = round((mission_ready / total) * 100, 1)

    return {
        "squadron_info": fleet_data["squadron_info"],
        "kpis": {
            "total_aircraft": total,
            "mission_ready_count": mission_ready,
            "scheduled_maint_count": scheduled_maint,
            "critical_risk_count": critical_risk,
            "current_availability_pct": current_availability_pct,
            "average_fleet_health_score": avg_health,
            "target_availability_pct": 80.0,
            "availability_vs_reactive_gain": round(current_availability_pct - 71.4, 1)
        },
        "aircraft": fleet
    }

@router.get("/fleet/{tail_number}")
def get_aircraft_details(tail_number: str):
    fleet_data = get_fleet_state()
    ac = next((a for a in fleet_data["fleet"] if a["tail_number"] == tail_number), None)
    if not ac:
        raise HTTPException(status_code=404, detail=f"Aircraft {tail_number} not found.")

    explanation = explainer_service.explain_aircraft(ac)
    latest_telem = ac["recent_telemetry"][-1] if ac["recent_telemetry"] else {}
    anomaly_result = anomaly_detector.score_telemetry(latest_telem)

    return {
        "aircraft": ac,
        "explanation": explanation,
        "anomaly_analysis": anomaly_result,
        "telemetry_history": ac["recent_telemetry"]
    }

@router.get("/optimizer/schedule")
def get_optimized_schedule():
    # Runs CP-SAT fleet optimizer under nominal conditions
    result = fleet_optimizer.optimize_schedule()
    return result

@router.post("/optimizer/run")
def trigger_optimizer(
    spares_delay: int = Query(0, ge=0, le=20),
    tech_shortage: int = Query(0, ge=0, le=60),
    closed_bay: Optional[str] = Query(None)
):
    result = fleet_optimizer.optimize_schedule(
        spares_delay_days=spares_delay,
        technician_penalty_pct=tech_shortage,
        closed_bay_id=closed_bay if closed_bay and closed_bay != "None" else None
    )
    return result

@router.post("/simulator/what-if")
def run_what_if_simulation(req: WhatIfRequest):
    result = what_if_engine.run_simulation(
        spares_delay_days=req.spares_delay_days,
        demand_surge_multiplier=req.demand_surge_multiplier,
        closed_bay_id=req.closed_bay_id,
        technician_shortage_pct=req.technician_shortage_pct
    )
    return result

@router.get("/spares")
def get_spares_inventory():
    fleet_data = get_fleet_state()
    fleet = fleet_data["fleet"]
    
    # Calculate demand count per spare across fleet
    spare_demand = {}
    for ac in fleet:
        sp_id = ac["maintenance_spec"]["required_spare_id"]
        spare_demand[sp_id] = spare_demand.get(sp_id, 0) + 1

    spares_status = []
    for sp in SPARE_CATALOG:
        demanded = spare_demand.get(sp["id"], 0)
        stock = sp["current_stock"]
        shortage = max(0, demanded - stock)
        spares_status.append({
            **sp,
            "active_fleet_demand": demanded,
            "projected_shortage": shortage,
            "order_status": "CRITICAL_DEFICIT" if shortage > 0 else ("REORDER_SOON" if stock <= sp["safety_stock"] else "HEALTHY_STOCK")
        })

    return {
        "spares": spares_status,
        "bays": HANGAR_BAYS,
        "technicians": TECHNICIANS
    }

@router.get("/audit/logs")
def get_audit_logs():
    return {
        "logs": audit_service.get_logs(),
        "integrity": audit_service.verify_integrity()
    }

@router.post("/audit/action")
def log_audit_action(req: ApprovalActionRequest):
    entry = audit_service.record_entry(
        operator_id=req.operator_id,
        operator_rank=req.operator_rank,
        action=req.action,
        details=req.details,
        justification=req.justification
    )
    return {
        "message": "Action successfully verified and added to tamper-evident audit ledger.",
        "entry": entry
    }

@router.get("/audit/verify")
def verify_audit_ledger():
    return audit_service.verify_integrity()

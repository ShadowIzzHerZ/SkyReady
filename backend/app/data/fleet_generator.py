import numpy as np
import random
from typing import Dict, List, Any
from datetime import datetime, timedelta

# Seed for reproducibility
np.random.seed(42)
random.seed(42)

SPARE_CATALOG = [
    {
        "id": "SP-ENG-HPT-01",
        "name": "High-Pressure Turbine Rotor Blade Set",
        "subsystem": "Propulsion",
        "lead_time_days": 14,
        "current_stock": 3,
        "safety_stock": 2,
        "cost_inr": 2850000,
        "criticality": "HIGH"
    },
    {
        "id": "SP-ENG-FMU-02",
        "name": "Fuel Metering Unit (FMU)",
        "subsystem": "Propulsion",
        "lead_time_days": 10,
        "current_stock": 2,
        "safety_stock": 2,
        "cost_inr": 1200000,
        "criticality": "HIGH"
    },
    {
        "id": "SP-HYD-ACT-03",
        "name": "Hydraulic Flight Control Actuator",
        "subsystem": "Hydraulics",
        "lead_time_days": 7,
        "current_stock": 4,
        "safety_stock": 3,
        "cost_inr": 650000,
        "criticality": "MEDIUM"
    },
    {
        "id": "SP-AV-TRX-04",
        "name": "AESA Radar Transceiver Module",
        "subsystem": "Avionics",
        "lead_time_days": 21,
        "current_stock": 2,
        "safety_stock": 2,
        "cost_inr": 4200000,
        "criticality": "HIGH"
    },
    {
        "id": "SP-LG-BRK-05",
        "name": "Carbon Brake Disc Assembly",
        "subsystem": "Landing Gear",
        "lead_time_days": 5,
        "current_stock": 6,
        "safety_stock": 4,
        "cost_inr": 380000,
        "criticality": "LOW"
    },
    {
        "id": "SP-APU-STR-07",
        "name": "APU Starter Generator",
        "subsystem": "Electrical/APU",
        "lead_time_days": 12,
        "current_stock": 2,
        "safety_stock": 1,
        "cost_inr": 950000,
        "criticality": "MEDIUM"
    }
]

HANGAR_BAYS = [
    {"id": "Bay-1", "name": "Heavy Overhaul & Depot Bay", "capabilities": ["Propulsion", "Structural", "Heavy"]},
    {"id": "Bay-2", "name": "Intermediate Maintenance Bay", "capabilities": ["Hydraulics", "Landing Gear", "General"]},
    {"id": "Bay-3", "name": "Avionics & Fast Turnaround Bay", "capabilities": ["Avionics", "Radar", "Inspections"]}
]

TECHNICIANS = [
    {"id": "TECH-01", "name": "Sgt. R. Sharma", "specialty": "Propulsion", "skill_level": "Master"},
    {"id": "TECH-02", "name": "Cpl. V. Nair", "specialty": "Propulsion", "skill_level": "Senior"},
    {"id": "TECH-03", "name": "Cpl. A. Patil", "specialty": "Propulsion", "skill_level": "Junior"},
    {"id": "TECH-04", "name": "Sgt. K. Singh", "specialty": "Hydraulics", "skill_level": "Master"},
    {"id": "TECH-05", "name": "Cpl. M. Das", "specialty": "Hydraulics", "skill_level": "Senior"},
    {"id": "TECH-06", "name": "Cpl. J. Rawat", "specialty": "Hydraulics", "skill_level": "Junior"},
    {"id": "TECH-07", "name": "WO. P. Deshmukh", "specialty": "Avionics", "skill_level": "Master"},
    {"id": "TECH-08", "name": "Sgt. T. Reddy", "specialty": "Avionics", "skill_level": "Senior"},
    {"id": "TECH-09", "name": "Cpl. D. Kumar", "specialty": "Avionics", "skill_level": "Junior"},
    {"id": "TECH-10", "name": "Sgt. S. Sengupta", "specialty": "Airframe", "skill_level": "Senior"},
    {"id": "TECH-11", "name": "Cpl. G. Verma", "specialty": "Airframe", "skill_level": "Senior"},
    {"id": "TECH-12", "name": "Cpl. N. Joseph", "specialty": "Weapons", "skill_level": "Junior"}
]

def generate_telemetry_history(cycles_flown: int, true_rul: int, degraded_sensor: str = "T50"):
    """
    Generates realistic sensor history matching NASA C-MAPSS FD001 characteristics.
    Sensors:
      - T24: LPC outlet temp (~642 R base)
      - T30: HPC outlet temp (~1585 R base)
      - T50: LPT outlet temp / EGT (~1400 R base, climbs with degradation)
      - P30: HPC outlet pressure (~553 psia base, drops with degradation)
      - Nf: Fan speed (~2388 rpm)
      - Nc: Core speed (~9050 rpm, climbs to compensate efficiency loss)
      - Ps30: Static pressure (~47.4 psia base)
      - phi: Fuel flow ratio (~521 pps/psi)
      - BPR: Bypass ratio (~8.4 base)
      - vibration: (0.12 in/s base, climbs with wear)
    """
    history_len = min(60, cycles_flown)
    time_series = []
    
    total_life = cycles_flown + true_rul
    
    for i in range(history_len):
        cycle = cycles_flown - (history_len - 1 - i)
        progress = max(0.0, min(1.0, cycle / max(1.0, total_life)))
        # Exponential degradation onset after 50% life
        wear_factor = (progress ** 2.5) if progress > 0.4 else (progress * 0.2)
        
        noise = np.random.normal(0, 1.0)
        
        # Sensor values
        egt_t50 = 1400.0 + (wear_factor * 85.0) + (noise * 2.5)
        hpc_t30 = 1585.0 + (wear_factor * 35.0) + (noise * 1.8)
        p30 = 553.5 - (wear_factor * 18.0) + (noise * 0.8)
        nc_core = 9050.0 + (wear_factor * 140.0) + (noise * 3.0)
        vibration = 0.12 + (wear_factor * 0.45) + abs(noise * 0.02)
        bpr = 8.44 - (wear_factor * 0.22) + (noise * 0.01)
        fuel_flow_phi = 521.5 + (wear_factor * 16.0) + (noise * 1.2)
        
        # Inject acute anomaly if degraded_sensor matches
        if degraded_sensor == "T50" and progress > 0.75:
            egt_t50 += 15.0
        elif degraded_sensor == "vibration" and progress > 0.7:
            vibration += 0.18
        elif degraded_sensor == "P30" and progress > 0.8:
            p30 -= 12.0
            
        time_series.append({
            "cycle": cycle,
            "T50_EGT": round(float(egt_t50), 2),
            "T30_HPC": round(float(hpc_t30), 2),
            "P30_Press": round(float(p30), 2),
            "Nc_Core": round(float(nc_core), 2),
            "vibration": round(float(vibration), 3),
            "BPR": round(float(bpr), 3),
            "fuel_flow_phi": round(float(fuel_flow_phi), 2)
        })
        
    return time_series

def generate_squadron_data() -> Dict[str, Any]:
    """
    Generates full state for 24 aircraft squadron:
    - Mix of healthy, intermediate wear, and critical nearing maintenance limit.
    - Component state, RUL estimates (p10, p50, p90), anomaly flags, required spares.
    """
    fleet = []
    
    # Preset degradation profiles to ensure realistic demo scenarios:
    # Aircraft 103, 107, 114, 119 have critical impending maintenance
    profiles = [
        # (id_num, base_cycles, true_rul, primary_subsystem, degraded_sensor, spare_needed, duration_days)
        (101, 142, 65, "Propulsion", "T50", "SP-ENG-FMU-02", 2),
        (102, 110, 88, "Avionics", "None", "SP-AV-TRX-04", 1),
        (103, 215, 12, "Propulsion", "T50", "SP-ENG-HPT-01", 4), # Critical! RUL ~12 cycles
        (104, 95, 120, "Airframe", "None", "SP-LG-BRK-05", 1),
        (105, 180, 45, "Hydraulics", "None", "SP-HYD-ACT-03", 2),
        (106, 160, 52, "Propulsion", "P30", "SP-ENG-FMU-02", 2),
        (107, 230, 8, "Propulsion", "vibration", "SP-ENG-HPT-01", 5), # Imminent! RUL ~8 cycles
        (108, 125, 78, "Landing Gear", "None", "SP-LG-BRK-05", 1),
        (109, 85, 140, "Electrical/APU", "None", "SP-APU-STR-07", 2),
        (110, 195, 38, "Hydraulics", "None", "SP-HYD-ACT-03", 2),
        (111, 150, 60, "Propulsion", "None", "SP-ENG-FMU-02", 2),
        (112, 175, 48, "Avionics", "None", "SP-AV-TRX-04", 2),
        (113, 205, 22, "Propulsion", "T50", "SP-ENG-HPT-01", 3), # At Risk! RUL ~22 cycles
        (114, 240, 5, "Hydraulics", "vibration", "SP-HYD-ACT-03", 3), # Critical! RUL ~5 cycles
        (115, 100, 115, "Airframe", "None", "SP-LG-BRK-05", 1),
        (116, 130, 72, "Propulsion", "P30", "SP-ENG-FMU-02", 2),
        (117, 165, 50, "Electrical/APU", "None", "SP-APU-STR-07", 2),
        (118, 190, 32, "Avionics", "None", "SP-AV-TRX-04", 2),
        (119, 225, 9, "Propulsion", "T50", "SP-ENG-HPT-01", 4), # Critical! RUL ~9 cycles
        (120, 140, 68, "Hydraulics", "None", "SP-HYD-ACT-03", 2),
        (121, 115, 85, "Landing Gear", "None", "SP-LG-BRK-05", 1),
        (122, 170, 42, "Propulsion", "None", "SP-ENG-FMU-02", 2),
        (123, 155, 55, "Avionics", "None", "SP-AV-TRX-04", 2),
        (124, 70, 160, "Airframe", "None", "SP-LG-BRK-05", 1)
    ]
    
    for (id_num, cycles, true_rul, subsystem, deg_sensor, spare_id, maint_dur) in profiles:
        tail_id = f"IAF-SK-{id_num}"
        telemetry = generate_telemetry_history(cycles, true_rul, deg_sensor)
        
        # Quantile RUL estimation (Slide 3: "28-55 cycles, most likely 40")
        rul_median = true_rul
        rul_p10 = max(2, int(true_rul * 0.72))  # Pessimistic lower bound (used for safety limit)
        rul_p90 = int(true_rul * 1.35)          # Optimistic upper bound
        
        # Operational status calculation
        # Sortie rate is ~1.2 cycles per day
        safe_days_remaining = max(1, int(rul_p10 / 1.2))
        
        if safe_days_remaining <= 7:
            status = "CRITICAL_RISK"
            health_score = random.randint(35, 58)
            anomaly_detected = True
        elif safe_days_remaining <= 18:
            status = "SCHEDULED_MAINTENANCE"
            health_score = random.randint(60, 78)
            anomaly_detected = (deg_sensor != "None")
        else:
            status = "MISSION_READY"
            health_score = random.randint(82, 98)
            anomaly_detected = False
            
        spare_info = next((s for s in SPARE_CATALOG if s["id"] == spare_id), None)
        
        aircraft_record = {
            "tail_number": tail_id,
            "callsign": f"Viper-{id_num - 100}",
            "type": "Twin-Engine Multirole Fighter",
            "flight_hours": round(cycles * 1.85, 1),
            "cycles_flown": cycles,
            "status": status,
            "health_score": health_score,
            "anomaly_detected": anomaly_detected,
            "anomaly_sensor": deg_sensor if anomaly_detected else None,
            "subsystem_at_risk": subsystem,
            "rul": {
                "median": rul_median,
                "p10_pessimistic": rul_p10,
                "p90_optimistic": rul_p90,
                "safe_days_remaining": safe_days_remaining,
                "display_range": f"{rul_p10}–{rul_p90} cycles (median: {rul_median})"
            },
            "maintenance_spec": {
                "required_spare_id": spare_id,
                "spare_name": spare_info["name"] if spare_info else "General Seal Kit",
                "spare_lead_time": spare_info["lead_time_days"] if spare_info else 5,
                "spare_stock": spare_info["current_stock"] if spare_info else 1,
                "duration_days": maint_dur,
                "primary_specialty": "Propulsion" if subsystem == "Propulsion" else ("Hydraulics" if subsystem == "Hydraulics" else "Avionics"),
                "technicians_needed": 2 if maint_dur <= 2 else 3,
                "recommended_bay": "Bay-1" if subsystem == "Propulsion" or maint_dur >= 4 else ("Bay-2" if subsystem == "Hydraulics" else "Bay-3"),
                "latest_safe_order_day": max(1, safe_days_remaining - (spare_info["lead_time_days"] if spare_info else 5))
            },
            "recent_telemetry": telemetry[-15:] # last 15 cycles
        }
        fleet.append(aircraft_record)
        
    return {
        "fleet": fleet,
        "spares": SPARE_CATALOG,
        "bays": HANGAR_BAYS,
        "technicians": TECHNICIANS,
        "squadron_info": {
            "name": "No. 45 Flying Daggers",
            "station": "Air Force Station Sulur / Forward Operational Base",
            "total_aircraft": len(fleet),
            "target_availability": 80.0 # Target 80% readiness
        }
    }

# Instantiate singleton fleet instance in memory
FLEET_STATE = generate_squadron_data()

def get_fleet_state():
    return FLEET_STATE

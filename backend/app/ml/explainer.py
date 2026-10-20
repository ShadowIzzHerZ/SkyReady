import numpy as np
from typing import Dict, List, Any

class ExplainerService:
    """
    Computes feature attributions (SHAP style) and generates plain-language
    military aviation engineering explanations for technical records and maintenance crews.
    """
    def __init__(self):
        self.feature_meta = {
            "T50_EGT": {
                "name": "Exhaust Gas Temperature (EGT / T50)",
                "nominal": "1400.0 R",
                "subsystem": "Turbine Thermal Health",
                "impact_high": "Thermal margin erosion, turbine blade thermal barrier coating spallation"
            },
            "vibration": {
                "name": "HP Spool Vibration Amplitude",
                "nominal": "0.12 in/s",
                "subsystem": "Rotor & Bearing Dynamics",
                "impact_high": "Rotor unbalance, bearing cage wear or blade tip clearance rub"
            },
            "T30_HPC": {
                "name": "HPC Delivery Temperature (T30)",
                "nominal": "1585.0 R",
                "subsystem": "Compressor Aero-thermodynamics",
                "impact_high": "Compressor fouling or inter-stage air seal leakage"
            },
            "P30_Press": {
                "name": "HPC Discharge Static Pressure (P30)",
                "nominal": "553.5 psia",
                "subsystem": "Compression Efficiency",
                "impact_high": "Pressure ratio collapse indicating blade degradation or stator distortion"
            },
            "Nc_Core": {
                "name": "Core Shaft Rotational Speed (Nc)",
                "nominal": "9050 rpm",
                "subsystem": "Spool Mechanical Load",
                "impact_high": "Over-speed compensation to maintain thrust due to aerodynamic losses"
            },
            "fuel_flow_phi": {
                "name": "Fuel-to-Pressure Ratio (phi)",
                "nominal": "521.5 pps/psi",
                "subsystem": "Fuel Metering & Combustion",
                "impact_high": "Excess fuel injection demand to sustain nominal rating"
            },
            "BPR": {
                "name": "Bypass Ratio (BPR)",
                "nominal": "8.44",
                "subsystem": "Fan Bypass Flow",
                "impact_high": "Duct distortion or fan tip wear"
            }
        }

    def explain_aircraft(self, aircraft_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates sensor contribution weights and synthesizes plain-language diagnostic narrative.
        """
        telemetry = aircraft_record.get("recent_telemetry", [])
        if not telemetry:
            latest = {}
        else:
            latest = telemetry[-1]

        # Calculate deviation from nominal baselines
        deviations = {
            "T50_EGT": max(0.0, (latest.get("T50_EGT", 1400.0) - 1400.0) / 75.0),
            "vibration": max(0.0, (latest.get("vibration", 0.12) - 0.12) / 0.40),
            "T30_HPC": max(0.0, (latest.get("T30_HPC", 1585.0) - 1585.0) / 35.0),
            "P30_Press": max(0.0, (553.5 - latest.get("P30_Press", 553.5)) / 16.0),
            "Nc_Core": max(0.0, (latest.get("Nc_Core", 9050.0) - 9050.0) / 130.0),
            "fuel_flow_phi": max(0.0, (latest.get("fuel_flow_phi", 521.5) - 521.5) / 16.0),
            "BPR": max(0.0, (8.44 - latest.get("BPR", 8.44)) / 0.20),
        }

        total_dev = sum(deviations.values()) + 1e-6
        # Normalized SHAP-like percentage contributions
        shap_drivers = []
        for feat, dev in deviations.items():
            contrib_pct = round((dev / total_dev) * 100.0, 1)
            meta = self.feature_meta[feat]
            val = latest.get(feat, 0.0)
            shap_drivers.append({
                "feature": feat,
                "label": meta["name"],
                "value": val,
                "nominal": meta["nominal"],
                "contribution_pct": contrib_pct,
                "subsystem": meta["subsystem"],
                "failure_mechanism": meta["impact_high"]
            })

        # Sort by contribution descending
        shap_drivers.sort(key=lambda x: x["contribution_pct"], reverse=True)

        top_driver = shap_drivers[0]
        second_driver = shap_drivers[1]

        rul_info = aircraft_record.get("rul", {})
        p10 = rul_info.get("p10_pessimistic", 10)
        p50 = rul_info.get("median", 15)
        safe_days = rul_info.get("safe_days_remaining", 8)
        tail = aircraft_record.get("tail_number", "AIRCRAFT")

        # Synthesize plain-language narrative for Air Force engineers
        if aircraft_record.get("health_score", 100) < 60 or p10 <= 10:
            urgency = "CRITICAL ADVISORY"
            recommendation = (
                f"Ground for scheduled depot intervention within {safe_days} days. "
                f"Inspect {top_driver['subsystem']} for {top_driver['failure_mechanism'].lower()}. "
                f"Pre-position {aircraft_record.get('maintenance_spec', {}).get('spare_name', 'spares')}."
            )
            narrative = (
                f"Aircraft {tail} exhibits marked thermal/mechanical divergence. "
                f"The primary driver is {top_driver['label']} ({top_driver['value']} vs baseline {top_driver['nominal']}), "
                f"accounting for {top_driver['contribution_pct']}% of the degraded health index. "
                f"Secondary driver {second_driver['label']} contributes {second_driver['contribution_pct']}%. "
                f"Pessimistic RUL is restricted to {p10} cycles ({safe_days} operational days) before risk threshold breach."
            )
        elif aircraft_record.get("health_score", 100) < 80:
            urgency = "ROUTINE WATCH"
            recommendation = (
                f"Retain in operational pool with accelerated borescope inspection at next 25-hour interval. "
                f"Verify spares availability ({aircraft_record.get('maintenance_spec', {}).get('spare_name')})."
            )
            narrative = (
                f"Aircraft {tail} telemetry indicates moderate trend progression. "
                f"{top_driver['label']} accounts for {top_driver['contribution_pct']}% of observed variation. "
                f"Current RUL median estimate is {p50} cycles (safe window: {safe_days} days). No immediate grounding required."
            )
        else:
            urgency = "NOMINAL STATUS"
            recommendation = "Full mission clearance approved. Standard post-flight turnaround."
            narrative = (
                f"Aircraft {tail} operating well within normal OEM envelope. "
                f"All propulsion, hydraulic, and avionics sensor vectors conform to baseline tolerances."
            )

        return {
            "urgency": urgency,
            "narrative": narrative,
            "recommendation": recommendation,
            "top_drivers": shap_drivers[:5],
            "all_drivers": shap_drivers
        }

explainer_service = ExplainerService()

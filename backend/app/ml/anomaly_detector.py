import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, List, Any

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42
        )
        self.feature_names = ["T50_EGT", "T30_HPC", "P30_Press", "Nc_Core", "vibration", "BPR", "fuel_flow_phi"]
        self.is_fitted = False
        self._bootstrap_healthy_baseline()

    def _bootstrap_healthy_baseline(self):
        """
        Creates healthy baseline operational points mimicking C-MAPSS nominal cruise conditions.
        """
        n_samples = 300
        # Healthy nominal means and small standard deviations
        egt = np.random.normal(1402.0, 4.0, n_samples)
        hpc = np.random.normal(1586.0, 3.5, n_samples)
        p30 = np.random.normal(553.2, 1.2, n_samples)
        nc = np.random.normal(9052.0, 5.0, n_samples)
        vib = np.random.normal(0.125, 0.015, n_samples)
        bpr = np.random.normal(8.43, 0.02, n_samples)
        phi = np.random.normal(521.6, 2.0, n_samples)

        X_healthy = np.column_stack([egt, hpc, p30, nc, vib, bpr, phi])
        self.model.fit(X_healthy)
        self.is_fitted = True

    def score_telemetry(self, telemetry_point: Dict[str, float]) -> Dict[str, Any]:
        """
        Computes anomaly score:
        - raw score from Isolation Forest (negative is outlier)
        - normalized anomaly index 0-100 (higher means more anomalous)
        - specific outlier flags
        """
        features = np.array([[
            telemetry_point.get("T50_EGT", 1400.0),
            telemetry_point.get("T30_HPC", 1585.0),
            telemetry_point.get("P30_Press", 553.0),
            telemetry_point.get("Nc_Core", 9050.0),
            telemetry_point.get("vibration", 0.12),
            telemetry_point.get("BPR", 8.44),
            telemetry_point.get("fuel_flow_phi", 521.0)
        ]])

        decision_val = self.model.decision_function(features)[0]
        # In scikit-learn, negative decision_val means outlier.
        # Healthy nominal is ~ +0.12 to +0.20. Severe anomaly is < -0.15.
        normalized_score = max(0.0, min(100.0, (0.15 - decision_val) * 280.0))

        is_anomaly = bool(normalized_score >= 65.0)

        # Pinpoint top driving sensor deviation
        anomalies_detected = []
        if telemetry_point.get("T50_EGT", 0) > 1460.0:
            anomalies_detected.append("EGT Exhaust Gas Temp over-temperature threshold (>1460 R)")
        if telemetry_point.get("vibration", 0) > 0.35:
            anomalies_detected.append("High-pressure rotor vibration excursion (>0.35 in/s)")
        if telemetry_point.get("P30_Press", 553.0) < 540.0:
            anomalies_detected.append("HPC outlet pressure loss (>13 psia below baseline)")

        return {
            "anomaly_score": round(float(normalized_score), 1),
            "is_anomaly": is_anomaly,
            "decision_value": round(float(decision_val), 4),
            "flagged_symptoms": anomalies_detected,
            "severity": "CRITICAL" if normalized_score >= 80 else ("ELEVATED" if normalized_score >= 60 else "NOMINAL")
        }

anomaly_detector = AnomalyDetector()

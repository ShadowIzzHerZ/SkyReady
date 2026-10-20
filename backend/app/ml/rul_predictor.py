import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from typing import Dict, Any, Tuple

class RULPredictor:
    """
    RUL Quantile Estimator based on C-MAPSS degradation features:
    Predicts:
      - p10: Pessimistic bound (90% lower confidence, drives safety limits in CP-SAT)
      - p50: Median / Most likely RUL
      - p90: Optimistic bound
    """
    def __init__(self):
        # We initialize 3 quantile regression models
        self.model_p10 = GradientBoostingRegressor(loss="quantile", alpha=0.10, n_estimators=60, random_state=42)
        self.model_p50 = GradientBoostingRegressor(loss="quantile", alpha=0.50, n_estimators=60, random_state=42)
        self.model_p90 = GradientBoostingRegressor(loss="quantile", alpha=0.90, n_estimators=60, random_state=42)
        self._train_synthetic_cmapss_quantiles()

    def _train_synthetic_cmapss_quantiles(self):
        """
        Fits quantile models on representative turbofan run-to-failure curves.
        Features: [EGT_T50, HPC_T30, P30, Nc, vibration, BPR, phi]
        Target: RUL (remaining cycles)
        """
        N = 1000
        # Generate synthetic run-to-failure lifespans between 120 and 320 cycles
        ruls = np.random.uniform(5, 180, N)
        
        # Sensor degradation curves inversely proportional to remaining RUL
        wear = np.exp(-ruls / 50.0) # rises sharply as RUL approaches 0
        noise = np.random.normal(0, 1.0, N)
        
        egt = 1400.0 + (wear * 95.0) + (noise * 3.0)
        hpc = 1585.0 + (wear * 40.0) + (noise * 2.0)
        p30 = 553.5 - (wear * 22.0) + (noise * 1.0)
        nc = 9050.0 + (wear * 160.0) + (noise * 4.0)
        vib = 0.12 + (wear * 0.50) + abs(noise * 0.03)
        bpr = 8.44 - (wear * 0.25) + (noise * 0.02)
        phi = 521.5 + (wear * 18.0) + (noise * 1.5)

        X = np.column_stack([egt, hpc, p30, nc, vib, bpr, phi])
        y = ruls

        self.model_p10.fit(X, y)
        self.model_p50.fit(X, y)
        self.model_p90.fit(X, y)

    def predict_rul(self, latest_telemetry: Dict[str, float]) -> Dict[str, Any]:
        features = np.array([[
            latest_telemetry.get("T50_EGT", 1400.0),
            latest_telemetry.get("T30_HPC", 1585.0),
            latest_telemetry.get("P30_Press", 553.0),
            latest_telemetry.get("Nc_Core", 9050.0),
            latest_telemetry.get("vibration", 0.12),
            latest_telemetry.get("BPR", 8.44),
            latest_telemetry.get("fuel_flow_phi", 521.0)
        ]])

        p10 = max(2, int(self.model_p10.predict(features)[0]))
        p50 = max(p10 + 2, int(self.model_p50.predict(features)[0]))
        p90 = max(p50 + 4, int(self.model_p90.predict(features)[0]))

        # Daily operational sortie factor: 1.2 cycles/day
        safe_days = max(1, int(p10 / 1.2))

        return {
            "p10_pessimistic": p10,
            "p50_median": p50,
            "p90_optimistic": p90,
            "safe_days_remaining": safe_days,
            "display_str": f"{p10}–{p90} cycles (median: {p50})"
        }

rul_predictor = RULPredictor()

from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SkyReady - Fleet Availability & Predictive Maintenance Optimizer"
    VERSION: str = "1.0.0"
    PROBLEM_STATEMENT_ID: str = "SIH26249"
    ORGANIZATION: str = "Ministry of Defence (MoD) / Defence Services Staff College (DSSC)"
    TEAM_NAME: str = "ZEN"
    SQUADRON_NAME: str = "No. 45 Flying Daggers (24 Aircraft)"
    PLANNING_HORIZON_DAYS: int = 30
    NUM_AIRCRAFT: int = 24
    NUM_HANGAR_BAYS: int = 3
    NUM_TECHNICIANS: int = 12

settings = Settings()

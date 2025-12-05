from pydantic import BaseModel
from typing import Optional, List

class Weights(BaseModel):
    ta_pref: float
    prof_pref: float
    course_pref: float
    workload_balance: float

class LoginRequestModel(BaseModel):
    username: str
    password: str

class Course(BaseModel):
    course_id: int
    course_code: str
    ps_lab_sections: Optional[str] = None
    enrollment_capacity: Optional[int] = None
    actual_enrollment: Optional[int] = None
    num_tas_requested: Optional[int] = None
    assigned_tas_count: Optional[int] = None
    skills: List[str] = []
    assignedTAs: List[str] = []
from pydantic import BaseModel

class Weights(BaseModel):
    ta_pref: float
    prof_pref: float
    course_pref: float
    workload_balance: float

class LoginRequestModel(BaseModel):
    username: str
    password: str


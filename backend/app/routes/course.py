from fastapi import APIRouter, Query
from typing import List
from app.models import Course
from app.services.course_services import get_courses, get_courses_by_professor_username

router = APIRouter()

@router.get("/", response_model=list[Course])
def read_courses():
    return get_courses()


@router.get("/by-professor", response_model=List[Course])
def read_courses_by_professor(username: str = Query(..., description="Professor's username")):
    """
    Get all courses for a given professor by username.
    """
    return get_courses_by_professor_username(username)

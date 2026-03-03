# AUTO-GENERATED
from datetime import datetime, date
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.base import get_db
from db.models import Task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# Pydantic Schemas
class TaskCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    is_done: Optional[bool] = None

class TaskResponse(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    is_done: Optional[bool] = None
    class Config:
        from_attributes = True

# CRUD Endpoints
@router.get("/", response_model=List[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return tasks

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(item: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(**item.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{id}", response_model=TaskResponse)
def get_task(id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
# AUTO-GENERATED MODELS
from sqlalchemy import Column, Boolean, DateTime, Integer, String, Text
from datetime import datetime
from .base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(255), nullable=True)
    priority = Column(String(255), nullable=True)
    due_date = Column(DateTime, nullable=True)
    is_done = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


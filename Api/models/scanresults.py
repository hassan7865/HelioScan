from __future__ import annotations
from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, DateTime, func
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime
from models.Base import Base 


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String(500), nullable=True)
    image_data = Column(LargeBinary, nullable=False)
    prediction = Column(String(500), nullable=True)
    scan_status = Column(String(50), nullable=True)
    date_created = Column(DateTime, nullable=False, default=func.now())

    # Relationship to User
    user = relationship('User', back_populates='scan_results')
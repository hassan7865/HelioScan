from __future__ import annotations
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from models.Base import Base  # Assuming you are using Base as a declarative base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Foreign key to users table
    name = Column(String(255), nullable=False)  # Name of the user leaving feedback
    email = Column(String(255), nullable=False)  # Email of the user
    type = Column(String(50), nullable=False)  # Type of feedback (positive, negative, etc.)
    message = Column(Text, nullable=False)  # Feedback message (could be longer text)
    date_created = Column(DateTime, nullable=False, default=func.now())  # Timestamp of feedback creation

    # Relationship to User
    user = relationship('User', back_populates='feedback')  # Define the relationship to User (assuming 'User' model has feedbacks)


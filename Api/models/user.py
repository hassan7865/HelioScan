# models/user.py
from __future__ import annotations
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.Base import Base 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), nullable=False, unique=True)
    email = Column(String(150), nullable=False, unique=True)
    password = Column(String(150), nullable=False)
    otp_secret = Column(String(32))  # Field for OTP secret
    is_2fa_enabled = Column(Boolean, default=False)  # 2FA status
    date_created = Column(DateTime, nullable=False, default=func.now())
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    scan_results = relationship('ScanResult', back_populates='user')
    feedback = relationship("Feedback",back_populates='user')
    forgot_password = relationship("ForgotPassword",back_populates='user')



    def get_id(self):
        return str(self.id)
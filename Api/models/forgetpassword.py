from sqlalchemy import Column, Integer, String, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, DeclarativeBase
import uuid
from models.Base import Base

class ForgotPassword(Base):
    __tablename__ = "forgot_password"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(255), nullable=False)
    expiry = Column(TIMESTAMP, nullable=False)
    date_created = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    user = relationship('User', back_populates='forgot_password')

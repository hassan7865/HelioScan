# routes/auth.py
import base64
from io import BytesIO
import uuid
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.responses import JSONResponse
from models.user import User
from utils.database import get_db
from pydantic import BaseModel
from passlib.context import CryptContext
from models.forgetpassword import ForgotPassword
import pyotp
from typing import Optional 
from sqlalchemy.orm import Session # type: ignore
from utils.chromaDB import client
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt # type: ignore
from utils.email import send_email
from sqlalchemy.exc import NoResultFound

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 
from fastapi.security import OAuth2PasswordRequestForm

# Password hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Router
router = APIRouter()



# Signup route
# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define user creation model
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

@router.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    username = user.username.strip()
    email = user.email.strip()
    password = user.password

    # Check if username or email already exists
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already taken.")

    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    # Hash password
    hashed_password = pwd_context.hash(password)

    # Create new user
    new_user = User(username=username, email=email, password=hashed_password, is_admin=False)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"id": new_user.id, "username": new_user.username})

    return {
        "detail": "User created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": new_user.is_admin,
        "user_id":new_user.id,
        "is_2fa_enabled":new_user.is_2fa_enabled,
        "username":new_user.username
    }



@router.post("/login2faDisable")
async def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),  # Accepts form data (email, password)
    verification_code: str = Form(None)  # Optional for 2FA
):
    email = form_data.username  # `OAuth2PasswordRequestForm` uses `username` field for email
    password = form_data.password

    print(email,password)

    user = db.query(User).filter(User.email == email).first()

    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # If 2FA is enabled, verify the OTP
    if user.is_2fa_enabled:
       return {
           "detail":"2FA is enabled need verification code",
           "is_2fa_enabled":user.is_2fa_enabled
       }

    # Generate JWT token
    access_token = create_access_token(data={"id": user.id, "username": user.username})

    return {
        "detail": "Logged in successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": user.is_admin,
        "user_id":user.id,
        "is_2fa_enabled":user.is_2fa_enabled,
        "username":user.username
    }

@router.post("/login2faEnable")
async def login_2fa_enable(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),  # Accepts form data (email, password)
    verification_code: str = Form(None)  # Optional for 2FA
):
    email = form_data.username  # `OAuth2PasswordRequestForm` uses `username` field for email
    password = form_data.password

    # Query the user from the database
    user = db.query(User).filter(User.email == email).first()

    # If user doesn't exist or password is incorrect
    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check if 2FA is enabled
    if user.is_2fa_enabled:
        if not verification_code:
            raise HTTPException(status_code=400, detail="Verification code required for 2FA")

        # Verify the OTP
        totp = pyotp.TOTP(user.otp_secret)
        if not totp.verify(verification_code):
            raise HTTPException(status_code=401, detail="Invalid verification code")

    # If 2FA is successful or not enabled, create the access token
    access_token = create_access_token(data={"id": user.id, "username": user.username})

    return {
        "detail": "Logged in successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": user.is_admin,
        "user_id": user.id,
        "is_2fa_enabled": user.is_2fa_enabled,
        "username": user.username
    }

@router.post("/SendEmail")
async def checkForEmail(email:str,db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    random_code = pyotp.random_base32()[:6]
    expiry_time = datetime.utcnow() + timedelta(minutes=30)
    new_forgot_pass = ForgotPassword(user_id=user.id, code=random_code, expiry=expiry_time)
    db.add(new_forgot_pass)
    db.commit()
    db.refresh(new_forgot_pass)

    reset_link = f"http://localhost:5173/reset-password/{new_forgot_pass.id}"


    response = send_email(
        to_email=email,
        subject="Password Reset Request",
        body=f"Click the link to reset your password: {reset_link}\n\nThis link will expire in 30 minutes.",
        from_email="noreply@healioscan.com"
    )
    if  response.success:
         return {"detail": "Password reset link sent successfully", "success": True}
    raise HTTPException(status_code=500, detail="Failed to send email")

   


@router.get("/validate_reset_link/{guid}")
async def validate_reset_code(guid: uuid.UUID, db: Session = Depends(get_db)):
    # Query the database for the reset password record using the GUID
    try:
        reset_request = db.query(ForgotPassword).filter(ForgotPassword.id == guid).first()

        if not reset_request:
            raise HTTPException(status_code=404, detail="Invalid or expired reset link")

        # Check if the reset code has expired
        if reset_request.expiry < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Reset link has expired")

        return {"detail": "Reset code is valid","success":True}
    
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Invalid or expired reset link")
    
@router.post("/reset_password")
async def reset_password(guid: uuid.UUID = Form(...),new_password: str = Form(...), db: Session = Depends(get_db)):
    # Query the database for the reset password record using the GUID
    reset_request = db.query(ForgotPassword).filter(ForgotPassword.id == guid).first()

    if not reset_request:
        raise HTTPException(status_code=404, detail="Invalid or expired reset link")

    # Check if the reset code has expired
    if reset_request.expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset link has expired")

    # Get the user related to the GUID
    user = db.query(User).filter(User.id == reset_request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hash the new password
    hashed_password = pwd_context.hash(new_password)

    # Update the user's password
    user.password = hashed_password
    db.commit()

    return {"detail": "Password reset successfully","success":True}













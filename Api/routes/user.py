from fastapi import APIRouter, Depends, Form, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from utils.email import send_email
from models.contactus import ContactUs
from utils.GetCurrentUser import get_current_user, is_admin
from models.user import User
from utils.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import func
import pyotp
from datetime import datetime, timedelta, timezone
import base64
import matplotlib.pyplot as plt
from io import BytesIO
from models.scanresults import ScanResult
import qrcode
from models.feedback import Feedback

router = APIRouter()


@router.get("/dashboard", response_class=JSONResponse)
async def dashboard(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id

    # Query for total scans
    total_scans = db.query(ScanResult).filter_by(user_id=user_id).count()

    # Query for recent scans
    recent_scans = (
        db.query(ScanResult)
        .filter_by(user_id=user_id)
        .order_by(ScanResult.date_created.desc())
        .limit(5)
        .all()
    )

    recent_activity = []
    for scan in recent_scans:
        status = "Tumor detected" if scan.prediction == "Tumor" else "Normal scan"
        recent_activity.append(
            {"date": scan.date_created.strftime("%Y-%m-%d %H:%M"), "status": status}
        )

    # Query for scan history
    scan_history = (
        db.query(ScanResult)
        .filter_by(user_id=user_id)
        .order_by(ScanResult.date_created.desc())
        .limit(10)
        .all()
    )
    scan_history_data = []

    for scan in scan_history:

        scan_history_data.append(
            {
                "date": scan.date_created.strftime("%Y-%m-%d %H:%M"),
                "image_path": scan.image_path,
                "prediction": scan.prediction,
                "status": scan.scan_status,
            }
        )

    # Query scan data for chart (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    scan_data = (
        db.query(
            func.date(ScanResult.date_created).label(
                "date"
            ),  # Using func.date correctly after importing it
            func.count().label("count"),  # Using func.count() here
        )
        .filter(
            ScanResult.user_id == user_id, ScanResult.date_created >= thirty_days_ago
        )
        .group_by(func.date(ScanResult.date_created))
        .all()
    )

    chart_data = {
        "labels": [data.date.strftime("%Y-%m-%d") for data in scan_data],
        "values": [data.count for data in scan_data],
    }

    # Create the chart
    img = BytesIO()
    plt.figure(figsize=(10, 6))
    plt.plot(
        chart_data["labels"],
        chart_data["values"],
        marker="o",
        color="b",
        linestyle="-",
        linewidth=2,
        markersize=6,
    )
    plt.title("Scan Activity Over Time", fontsize=16)
    plt.xlabel("Date", fontsize=14)
    plt.ylabel("Number of Scans", fontsize=14)
    plt.xticks(rotation=45, ha="right")
    plt.grid(True, which="both", linestyle="--", linewidth=0.5)

    for i, value in enumerate(chart_data["values"]):
        plt.annotate(
            str(value),
            (chart_data["labels"][i], value),
            textcoords="offset points",
            xytext=(0, 5),
            ha="center",
            fontsize=10,
        )

    plt.tight_layout()
    plt.savefig(img, format="png")
    img.seek(0)
    chart_image = base64.b64encode(img.getvalue()).decode("utf-8")
    plt.close()

    # Return the data as JSON response
    return JSONResponse(
        content={
            "total_scans": total_scans,
            "recent_activity": recent_activity,
            "scan_history": scan_history_data,
            "chart_image": chart_image,
        }
    )


@router.get("/enable_2fa")
async def enable_2fa(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):

    if not current_user.otp_secret:
        current_user.otp_secret = pyotp.random_base32()
        db.commit()

    totp = pyotp.TOTP(current_user.otp_secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email, issuer_name="HealioScan"
    )

    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_code = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # Return the QR code in JSON format
    return JSONResponse(
        content={
            "qr_code": qr_code,
            "detail": "Genereated Successfully",
        }
    )


@router.post("/enable_2fa")
async def enable_2fa_post(
    verification_code: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    totp = pyotp.TOTP(current_user.otp_secret)

    if totp.verify(verification_code):
        current_user.is_2fa_enabled = True
        db.commit()
        db.close()
        return JSONResponse(
            content={
                "detail": "2FA has been successfully enabled!",
            }
        )

    # Handle invalid verification code
    raise HTTPException(
        status_code=400, detail="Invalid verification code. Please try again."
    )


ITEMS_PER_PAGE = 10


@router.get("/viewResults", response_class=JSONResponse)
def view_results(
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Filter results by logged-in user
    query = (
        db.query(ScanResult)
        .filter(ScanResult.user_id == current_user.id)
        .order_by(ScanResult.id.desc())
    )

    # Get total count
    total_items = query.count()

    # Pagination
    scan_results = query.offset((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).all()

    # Get latest scan for this user
    latest_scan = (
        db.query(ScanResult)
        .filter(ScanResult.user_id == current_user.id)
        .order_by(ScanResult.id.desc())
        .first()
    )
    latest_scan_date = (
        latest_scan.date_created.strftime("%Y-%m-%d %H:%M:%S") if latest_scan else "N/A"
    )

    # Get tumor rate for this user
    tumor_count = (
        db.query(ScanResult)
        .filter(ScanResult.user_id == current_user.id, ScanResult.prediction == "Tumor")
        .count()
    )
    tumor_rate = round((tumor_count / total_items * 100), 2) if total_items else 0

    # Convert results to JSON
    results_json = [
        {
            "id": result.id,
            "image_path": result.image_path,
            "date_created": result.date_created.strftime("%Y-%m-%d %H:%M:%S"),
            "prediction": result.prediction,
            "scan_status": result.scan_status,
        }
        for result in scan_results
    ]

    return JSONResponse(
        content={
            "scan_results": results_json,
            "page": page,
            "total_items": total_items,
            "total_pages": (total_items // ITEMS_PER_PAGE)
            + (1 if total_items % ITEMS_PER_PAGE else 0),
            "latest_scan_date": latest_scan_date,
            "tumor_rate": tumor_rate,
        }
    )


class FeedbackRequest(BaseModel):
    name: str
    email: str
    type: str
    message: str


@router.post("/feedback")
def submit_feedback(
    feedback_data: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure all fields are present (Pydantic handles this)

    new_feedback = Feedback(
        user_id=current_user.id,
        name=feedback_data.name,
        email=feedback_data.email,
        type=feedback_data.type,
        message=feedback_data.message,
    )

    db.add(new_feedback)
    db.commit()

    return {"detail": "Thank you for your feedback!"}


@router.post("/feedback")
def submit_feedback(
    feedback_data: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure all fields are present (Pydantic handles this)

    new_feedback = Feedback(
        user_id=current_user.id,
        name=feedback_data.name,
        email=feedback_data.email,
        type=feedback_data.type,
        message=feedback_data.message,
    )

    db.add(new_feedback)
    db.commit()

    return {"detail": "Thank you for your feedback!"}


class ContactUsCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str


@router.post("/contact_us")
async def create_contact_us(contact: ContactUsCreate, db: Session = Depends(get_db)):
    db_contact = ContactUs(
        name=contact.name,
        email=contact.email,
        subject=contact.subject,
        message=contact.message,
    )
    db.add(db_contact)
    db.commit()

    message = f"From: {contact.name} ({contact.email})\n\n{contact.message}"
    response = send_email(
        "service@healioscan.com",
        contact.subject,
        message,
        "noreply@healioscan.com"
    )
    if  response.success:
          return {"detail": "Thank you for your Contacting us!"}
    raise HTTPException(status_code=500, detail="Failed to send Response")

   


@router.get("/admin/dashboard", response_class=JSONResponse)
async def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure only admins can access
    if not current_user.is_admin:
        return JSONResponse(content={"error": "Unauthorized"}, status_code=403)

    # Total Users
    total_users = db.query(User).count()

    # Total Scans
    total_scans = db.query(ScanResult).count()

    # Total Feedbacks
    total_feedback = db.query(Feedback).count()

    # Feedback Breakdown
    feedback_counts = {
        "bug": db.query(Feedback).filter(Feedback.type == "bug").count(),
        "feature": db.query(Feedback).filter(Feedback.type == "feature").count(),
        "improvement": db.query(Feedback)
        .filter(Feedback.type == "improvement")
        .count(),
        "general": db.query(Feedback).filter(Feedback.type == "general").count(),
    }

    # Recent Scans (Last 5)
    recent_scans = (
        db.query(ScanResult).order_by(ScanResult.date_created.desc()).limit(5).all()
    )
    recent_scan_list = [
        {
            "id": scan.id,
            "user_id": scan.user_id,
            "prediction": scan.prediction,
            "date_created": scan.date_created.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for scan in recent_scans
    ]

    # Recent Feedback (Last 5)
    recent_feedback = (
        db.query(Feedback).order_by(Feedback.date_created.desc()).limit(5).all()
    )
    recent_feedback_list = [
        {
            "id": fb.id,
            "user_name": fb.name,
            "type": fb.type,
            "message": fb.message,
            "date_created": fb.date_created.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for fb in recent_feedback
    ]

    recent_users = db.query(User).order_by(User.date_created.desc()).limit(5).all()
    recent_users_list = [
        {
            "id": user.id,
            "name": user.username,
            "email": user.email,
            "date_created": user.date_created.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for user in recent_users
    ]

    return JSONResponse(
        content={
            "total_users": total_users,
            "total_scans": total_scans,
            "total_feedback": total_feedback,
            "feedback_counts": feedback_counts,
            "recent_scans": recent_scan_list,
            "recent_feedback": recent_feedback_list,
            "recent_users": recent_users_list,
        }
    )


from fastapi import Query

@router.get("/admin/feedback", response_class=JSONResponse)
async def get_all_feedback(
    search_term: str = Query(None, description="Search feedback by name, email, type, or message"),
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin),
):
  
    query = db.query(Feedback)

    if search_term:
        query = query.filter(
            (Feedback.name.ilike(f"%{search_term}%")) |
            (Feedback.email.ilike(f"%{search_term}%")) |
            (Feedback.type.ilike(f"%{search_term}%")) |
            (Feedback.message.ilike(f"%{search_term}%"))
        )

    feedbacks = query.order_by(Feedback.date_created.desc()).all()

    feedback_list = [
        {
            "id": fb.id,
            "name": fb.name,
            "email": fb.email,
            "type": fb.type,
            "message": fb.message,
            "date_created": fb.date_created.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for fb in feedbacks
    ]

    return JSONResponse(
        content={"feedbacks": feedback_list},
    )



@router.get("/admin/feedback/{feedback_id}", response_class=JSONResponse)
async def get_feedback_by_id(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin),
):
    """
    Get a specific feedback by its ID.
    Admins can fetch feedback by its unique ID.
    """
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    feedback_data = {
        "id": feedback.id,
        "name": feedback.name,
        "email": feedback.email,
        "type": feedback.type,
        "message": feedback.message,
        "date_created": feedback.date_created.strftime("%Y-%m-%d %H:%M:%S"),
    }

    return JSONResponse(
        content={"feedback": feedback_data},
    )


@router.delete("/admin/feedback/{feedback_id}", response_class=JSONResponse)
async def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin),
):
    """
    Delete a specific feedback by ID.
    Admins can delete feedback records.
    """
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    db.delete(feedback)
    db.commit()

    return JSONResponse(
        status_code=200,
        content={"detail": "Deleted Successfully"},
    )

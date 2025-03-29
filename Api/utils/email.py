import os
from dotenv import load_dotenv
from smtp2go.core import Smtp2goClient


# Load environment variables
load_dotenv()

# Get API key from .env
API_KEY = os.getenv("EMAILKEY")

# Initialize SMTP2Go client
client = Smtp2goClient(api_key=API_KEY)


def send_email(
    to_email: str, subject: str, body: str, from_email: str
):

    try:
        

        payload = {
            "sender": from_email,
            "recipients": [to_email],
            "subject": subject,
            "text": body,
        }

        response = client.send(**payload)
        return response

    except Exception as e:
        print(f"Error sending email: {e}")

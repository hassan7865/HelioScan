# HelioScan

Web application for pancreatic tumor detection from medical images. Users upload scans (including DICOM); a YOLO model (Ultralytics + PyTorch weights) runs inference on the FastAPI backend; results are stored in PostgreSQL and the React client shows dashboards, history, and admin feedback tools.

## Features

- **Scan upload & inference** — accept `.jpg`, `.jpeg`, `.png`, `.bmp`, `.dcm`; DICOM decoded via pydicom; YOLO prediction overlays/results returned to the client
- **Model loading** — YOLO weights loaded from ChromaDB (`best.pt` also present under `Api/`); collection init on API lifespan
- **Auth** — signup/login, JWT sessions, password reset email flow, optional TOTP 2FA (pyotp / QR)
- **User dashboard** — upload scan, view results, submit feedback
- **Admin** — admin dashboard and feedback moderation pages
- **Contact / landing** — public landing, contact form, and marketing pages in the Vite React app

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend (`ui/`) | React 19, Vite 6, React Router 7, Axios, React Hook Form, react-hot-toast |
| Backend (`Api/`) | FastAPI, Uvicorn, SQLAlchemy, PostgreSQL (`psycopg2`), JWT (`python-jose`), Passlib/bcrypt |
| ML | PyTorch, torchvision, Ultralytics YOLO, OpenCV, pydicom, Matplotlib |
| Vector / model store | ChromaDB |
| Email | smtp2go helper in `Api/utils/email.py` |

## Project structure

```
HelioScan/
├── ui/                         # React + Vite frontend (dev: Vite default, often :5173)
│   ├── src/
│   │   ├── Pages/              # Landing, Login, SignUp, Dashboard, UploadResult, ViewResults, Admin, …
│   │   ├── Components/         # Navbar, PrivateRoutes, FeedbackModal, LoadingVideo, …
│   │   └── App.jsx             # route table
│   └── package.json
└── Api/                        # FastAPI backend (port 8000)
    ├── main.py                 # app entry, CORS, routers
    ├── requirements.txt
    ├── best.pt                 # local YOLO weights file
    ├── routes/                 # auth, user, uploadresult
    ├── models/                 # User, ScanResult, Feedback, ContactUs, …
    ├── utils/                  # database, chromaDB, email, GetCurrentUser
    └── static/uploads/         # uploaded scan files
```

## Getting started

### Prerequisites

- Node.js 18+ for the UI
- Python 3.10+ (versions used with torch 2.6 / ultralytics 8.x)
- PostgreSQL
- ChromaDB reachable with the env vars your deployment expects

### Backend

```bash
cd Api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# create Api/.env (do not commit secrets), e.g.:
# DATABASE_URL=postgresql://user:pass@localhost:5432/helioscanner
# SECRET_KEY=...
# CHROMA_HOST=...
# CHROMA_TENANT=...
# CHROMA_DATABASE=...
# CHROMA_TOKEN=...

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# same command is documented in Api/start.txt
```

API prefixes:

- `/api/auth` — authentication
- `/api/user` — user profile routes
- `/api/result` — scan upload / results
- `/static` — static uploads

### Frontend

```bash
cd ui
npm install
npm run dev
```

CORS in `Api/main.py` allows local Vite origins (and is currently configured broadly for development). Point the UI request helpers (`ui/Utils/Request.js`) at `http://localhost:8000` as needed.

### Build UI for production

```bash
cd ui
npm run build
npm run preview
```

## Notes

- This is a clinical ML **prototype / research-style** app, not a certified medical device.
- Keep `Api/.env` and Chroma/DB credentials out of git and out of documentation.
- Large binary artifacts (`best.pt`, uploaded images) may need Git LFS or external storage depending on your hosting limits.

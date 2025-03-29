import base64
from datetime import time
from time import sleep
from fastapi import APIRouter, FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from utils.GetCurrentUser import get_current_user
from sqlalchemy.orm import Session
from utils.database import get_db
from models.scanresults import ScanResult
from models.user import User
import os
import tempfile
import shutil
import numpy as np
import cv2
import matplotlib.pyplot as plt
import pydicom
from ultralytics import YOLO  # Ensure you have ultralytics installed
from utils.chromaDB import client

router = APIRouter()

UPLOAD_DIR = "static/uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".dcm"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)




@router.post("/uploadScan")
async def upload_scan(
    scanImage: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Check file extension
        file_ext = os.path.splitext(scanImage.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an image file.",
            )

        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            temp_path = temp_file.name
            shutil.copyfileobj(scanImage.file, temp_file)

        try:
            # Load YOLO model
            model = load_yolo_from_chroma()
            if not model:
                raise HTTPException(
                    status_code=500, detail="YOLO model not found in ChromaDB"
                )

            # Load image
            def load_image(image_path):
                if image_path.lower().endswith(".dcm"):
                    dicom = pydicom.dcmread(image_path)
                    image = dicom.pixel_array.astype(float)
                    image = (
                        (image - image.min()) / (image.max() - image.min()) * 255
                    ).astype(np.uint8)
                    if len(image.shape) == 2:
                        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
                    return image
                else:
                    image = cv2.imread(image_path)
                    if image is not None:
                        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    return image

            image_rgb = load_image(temp_path)

            if image_rgb is None:
                raise HTTPException(status_code=400, detail="Error loading image.")

            # Perform YOLO detection
            results = model(image_rgb)

            max_confidence = 0
            best_box = None
            cancer_detected = False

            for result in results:
                boxes = result.boxes
                if len(boxes) > 0:
                    cancer_detected = True
                    for box in boxes:
                        confidence = box.conf[0]
                        if confidence > max_confidence:
                            max_confidence = confidence
                            best_box = box

            # Draw the best bounding box
            if best_box is not None:
                x1, y1, x2, y2 = best_box.xyxy[0]
                label = f"{best_box.cls[0]}: {max_confidence:.2f}"
                cv2.rectangle(
                    image_rgb, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2
                )
                cv2.putText(
                    image_rgb,
                    label,
                    (int(x1), int(y1) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 0, 0),
                    2,
                )

            # Save processed image
            output_image_path = os.path.join(
                UPLOAD_DIR, os.path.basename(temp_path).replace(file_ext, "_result.png")
            )
            plt.imshow(image_rgb)
            plt.axis("off")
            plt.savefig(output_image_path, bbox_inches="tight", pad_inches=0)
            plt.close()

            # Define scan status
            message = "Cancer detected" if cancer_detected else "No cancer"
            status = "warning" if cancer_detected else "success"

            # Save result in database
            new_scan = ScanResult(
                user_id=current_user.id,
                image_data=scanImage.file.read(),
                image_path=output_image_path,
                prediction=message,
                scan_status=status,
            )
            db.add(new_scan)
            db.commit()

            return JSONResponse(
                content={
                    "success": message,
                    "scanStatus": status,
                    "imagePath": output_image_path,
                }
            )

        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except HTTPException as e:
        raise e
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": "An error occurred while processing the scan.",
                "scanStatus": "error",
                "detail": str(e),
            },
        )


def load_yolo_from_chroma():
    print("Loading YOLO model from ChromaDB...")

    try:
        # Ensure `client` is defined and connected properly
        collection = client.get_collection(name="pancreatic_tumor_models")

        # Fetch records in smaller batches to avoid exceeding size limits
        batch_size = 100  # Adjust based on need
        all_items = {"metadatas": [], "documents": [], "ids": []}
        offset = 0

        while True:
            batch = collection.get(limit=batch_size, offset=offset)
            if not batch["ids"]:  # Stop when no more data
                break

            # Append to the master dictionary
            all_items["metadatas"].extend(batch["metadatas"])
            all_items["documents"].extend(batch["documents"])
            all_items["ids"].extend(batch["ids"])

            offset += batch_size
            print(
                f"Fetched {len(batch['ids'])} records (Total: {len(all_items['ids'])})"
            )

        if not all_items["ids"]:
            raise Exception("No data found in collection.")

        print(f"Total records fetched: {len(all_items['ids'])}")

        # Ensure 'metadatas' and 'documents' are properly retrieved and iterable
        if "metadatas" not in all_items or "documents" not in all_items:
            print("Error: 'metadatas' or 'documents' not found in ChromaDB items.")
            return None

        # Filter YOLO chunks based on 'model_type'
        yolo_chunks = [
            (meta, doc)
            for meta, doc in zip(all_items["metadatas"], all_items["documents"])
            if meta.get("model_type") == "yolo"
        ]

        if not yolo_chunks:
            print("No YOLO model found in ChromaDB.")
            return None

        # Ensure all chunks are retrieved
        total_chunks = yolo_chunks[0][0]["total_chunks"]
        if len(yolo_chunks) != total_chunks:
            raise Exception(
                f"Missing chunks: found {len(yolo_chunks)} out of {total_chunks}"
            )

        # Sort chunks by 'chunk_index' to reconstruct the model in the correct order
        sorted_chunks = sorted(yolo_chunks, key=lambda x: x[0]["chunk_index"])
        print(f"Retrieved {len(sorted_chunks)} chunks")

        # Concatenate chunks
        serialized_model = "".join(chunk[1] for chunk in sorted_chunks)
        print("Model data concatenated")

        # Decode base64
        try:
            model_data = base64.b64decode(serialized_model)
            print(f"Model data decoded successfully ({len(model_data)} bytes)")
        except Exception as e:
            print(f"Base64 decoding error: {str(e)}")
            raise

        # Save to temp file
        temp_path = "temp_yolo.pt"
        with open(temp_path, "wb") as f:
            f.write(model_data)
        print(f"Model saved to temporary file: {temp_path}")

        # Load YOLO model
        model = YOLO(temp_path)
        print("YOLO model loaded successfully")

        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print("Temporary file cleaned up")

        return model

    except Exception as e:
        print(f"Error in remote model loading: {str(e)}")
        if "temp_path" in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return None


def save_model_to_chroma_yolo(collection, model_path, chunk_size=4000):

    try:
        # Vérifier si le fichier existe
        if not os.path.exists(model_path):
            print(f"Model file not found at {model_path}")
            return False

        # Read the model file in binary mode
        with open(model_path, "rb") as f:
            model_data = f.read()

        # Encode to base64
        model_base64 = base64.b64encode(model_data).decode("utf-8")
        print("Model Data:", len(model_data))

        # Split into smaller chunks
        chunks = [
            model_base64[i : i + chunk_size]
            for i in range(0, len(model_base64), chunk_size)
        ]

        print(f"Number of chunks to save: {len(chunks)}")

        # Supprimer les anciens chunks s'ils existent
        try:
            existing_ids = [
                f"yolo_model_v1_chunk_{i}" for i in range(10000)
            ]  # Nombre arbitraire
            collection.delete(ids=existing_ids)
            print("Cleaned up old chunks")
        except:
            pass

        # Prepare data for ChromaDB
        BATCH_SIZE = 20
        total_batches = len(chunks) // BATCH_SIZE + (
            1 if len(chunks) % BATCH_SIZE else 0
        )

        for batch_num in range(total_batches):
            start_idx = batch_num * BATCH_SIZE
            end_idx = min((batch_num + 1) * BATCH_SIZE, len(chunks))

            batch_documents = chunks[start_idx:end_idx]
            batch_metadatas = [
                {"chunk_index": i, "total_chunks": len(chunks), "model_type": "yolo"}
                for i in range(start_idx, end_idx)
            ]
            batch_ids = [f"yolo_model_v1_chunk_{i}" for i in range(start_idx, end_idx)]

            collection.add(
                documents=batch_documents, metadatas=batch_metadatas, ids=batch_ids
            )

            print(
                f"Progress: {end_idx}/{len(chunks)} chunks saved ({(end_idx/len(chunks)*100):.1f}%)"
            )
            sleep(0.1)

        # Vérification finale
        verification = collection.get()
        if len(verification["ids"]) != len(chunks):
            print("Warning: Not all chunks were saved correctly")
            return False

        print("YOLO model saved successfully!")
        return True

    except Exception as e:
        print(f"Error while saving YOLO model: {e}")
        return False


def initialize_collections():
    try:
        model_collection = client.get_or_create_collection(
            name="pancreatic_tumor_models",
            metadata={"description": "Store ML model data"},
        )

        # Fetch only the first record
        all_items = model_collection.get(limit=1)

        if not all_items["ids"]:  # If no record exists
            print("No model found in ChromaDB, saving the best.pt model...")
            if save_model_to_chroma_yolo(model_collection, "best.pt"):
                print("YOLO model saved successfully!")
            else:
                print("Error while saving YOLO model.")
        else:
            print("The model already exists in ChromaDB, no action needed.")

        return model_collection
    except Exception as e:
        print(f"Error initializing collections: {e}")
        return None


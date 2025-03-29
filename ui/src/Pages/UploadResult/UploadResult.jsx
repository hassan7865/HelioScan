import React, { useState } from "react";
import "./UploadResult.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Request, { BaseURL } from "../../../Utils/Request";
import UserProfile from "../../../Utils/UserProfile";
const UploadScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    const formData = new FormData();
    const scanImage = e.target.elements.scanImage.files[0]; // Get the file input
    formData.append("scanImage", scanImage); // Append the file to FormData
    setIsLoading(true)
    setPopupVisible(true);
    try {
       const token = UserProfile.GetUserData().access_token

      const response = await Request.post("/result/uploadScan", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Specify content type as multipart/form-data
        },
      });
      console.log(response)
      if (response.data.scanStatus != "error") {
        setResult(response.data);
      
        setIsLoading(false);
      } else {
        setResult({
          success: "An error occurred while processing your scan.",
          scanStatus: "error",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setResult({
        success: "An error occurred while processing your scan.",
        scanStatus: "error",
      });
    }
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setResult(null);
  };

  return (
    <div className="page-container">
      <Navbar />

      <main>
        <section className="upload-scan">
          <h1 className="animate-text">Upload Your Scan</h1>
          <p className="animate-text">
            Upload your medical scan image to get AI-powered results.
          </p>
          <form
            id="uploadScanForm"
            onSubmit={handleSubmit}
            className="animate-fade-in"
          >
            <div className="form-group animate-slide-up">
              <label htmlFor="scanImage">Choose Scan Image:</label>
              <input
                type="file"
                id="scanImage"
                name="scanImage"
                accept="image/*"
                required
              />
            </div>
            <button type="submit" className="btn-primary animate-pulse">
            {isLoading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </section>
      </main>

      {popupVisible && (
        <div id="resultPopup" className={`popup ${popupVisible ? 'active' : ''}`}>
          <div className="popup-content">
            <div className="result-header">
              <h2>Scan Results</h2>
              <div className="pulse-ring"></div>
            </div>

            {isLoading ? (
              <div id="loader" className="loader"></div>
            ) : (
              <div className="result-container">
                <div className="result-icon">
                  <svg viewBox="0 0 24 24" className="warning-icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v7h-2zm0 8h2v2h-2z" />
                  </svg>
                </div>
                <p id="resultMessage" className="result-message">
                  {result?.success}
                </p>
                <p id="scanStatus" className="scan-status">
                  {result?.scanStatus}
                </p>

                {result?.imagePath && (
                  <img
                    src={BaseURL+"/"+result.imagePath}
                    alt="Scan Result"
                    style={{ width: "80%",height:"80%" }}
                  />
                )}

                <button
                  id="closePopup"
                  className="btn-secondary"
                  onClick={handleClosePopup}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UploadScan;

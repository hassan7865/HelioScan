import React, { useState, useEffect } from "react";
import './LoadingVideo.css'; // CSS for styling
import { useNavigate } from "react-router-dom";
import UserProfile from "../../../Utils/UserProfile";

const LoadingPage = () => {
  const [videoSource, setVideoSource] = useState(null);  // Initialize as null
  const navigate = useNavigate(); 

  // Function to set video source based on screen size
  const setVideoSourceHandler = () => {
    if (window.innerWidth <= 768) {
      setVideoSource("/mobile.webm"); // Mobile video
    } else {
      setVideoSource("/pc.webm"); // Desktop video
    }
  };

  useEffect(() => {
    // Set video source when the component mounts
    setVideoSourceHandler();

    // Update video source when the window is resized
    window.addEventListener("resize", setVideoSourceHandler);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", setVideoSourceHandler);
    };
  }, []);  // Empty dependency array ensures this runs only once on mount

  // Function to handle video end event
  const handleVideoEnd = () => {
    const currentUser = UserProfile.GetUserData()
    if (currentUser && currentUser.user_id) {
        if (currentUser.is_admin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
  };

  if (!videoSource) {
    // Do not render the video until the source is set
    return null;
  }

  return (
    <div className="loading-container">
      <video
        className="loading-video"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      >
        <source src={videoSource} type="video/webm" />
      </video>
    </div>
  );
};

export default LoadingPage;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Request from "../../../Utils/Request";
import "./ResetPassword.css";
import { FaSleigh } from "react-icons/fa";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { guid } = useParams(); // Get GUID from URL
  const navigate = useNavigate();
  const [validLink, setValidLink] = useState(false); // Whether the link is valid
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // To track password mismatch error
  const [FormLoading,setFormLoading] = useState(false)

  useEffect(() => {
    // Validate the reset link when component mounts
    const validateLink = async () => {
      setLoading(true);
      try {
        const response = await Request.get(`/auth/validate_reset_link/${guid}`);
        console.log(response);
        if (response.data.success === true) {
          setValidLink(true); // Set validLink to true if the link is valid
        }
      } catch (error) {
        setValidLink(false); // Set validLink to false if there's an error
      } finally {
        setLoading(false);
      }
    };

    validateLink();
  }, [guid]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for password mismatch
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match!"); // Set error if passwords don't match
      return;
    }

    setPasswordError(""); // Clear any existing errors if passwords match

    setFormLoading(true);
    try {
      const data = new FormData();
      data.append("guid", guid);
      data.append("new_password", password);

      // Submit the new password
      const response = await Request.post("/auth/reset_password", data);
      if (response.data.success) {
        toast.success("Password Reset Successfully")
        navigate("/login"); // Redirect to login if password reset is successful
      }
    } catch (error) {
        setPasswordError( error.response?.data?.detail || "Password Reset failed. Please try again.");
    } finally {
        setFormLoading(false);
    }
  };

  return (
    <>
      <div className="background-animation"></div>

      {/* Header */}
      <header className="site-header">
        <div className="header-content">
          <div className="logo-wrapper">
            <a href="/landing">
              <img
                src="/logo.png"
                alt="HealioScan Logo"
                className="site-logo"
              />
            </a>
          </div>
        </div>
      </header>

      <div className="auth-container">
        <div className="card">
          <div className="logo-container">
            <h1>Reset Password</h1>
          </div>

          {validLink && !loading ? (
            <div className="auth-box">
              <h2>Enter New Password</h2>
              <form onSubmit={handleSubmit} className="reset-password-form">
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {passwordError && (
                    <p className="error-message">{passwordError}</p> // Show the error message here
                  )}
                </div>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {FormLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          ) : (
            <div className="error-message">
              <p>
                The link is either expired or invalid. Please try requesting a
                new one.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer>
        <p>&copy; 2025 HealioScan. All rights reserved.</p>
      </footer>
    </>
  );
};

export default ResetPassword;

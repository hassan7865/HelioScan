import { useState } from "react";
import { useForm } from "react-hook-form";
import Request from "../../../Utils/Request";
import { useNavigate } from "react-router-dom";
import "./ForgetPassword.css";

const ForgotPassword = () => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);  // Loading state for form submission
  const [linkSent, setLinkSent] = useState(false); // Whether the reset link has been sent
  const [showError, setShowError] = useState(false); // Whether to show an error message
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
     
      // Step 1: Send the reset password link to the email
      const response = await Request.post(`/auth/SendEmail?email=${formData.email}`);
      if (response.data.success) {
        setLinkSent(true);  // Show success message after sending the link
      } else {
        setShowError(true);  // Show error if email doesn't exist
      }
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error.response?.data?.detail || "Request failed. Please try again.",
      });
    } finally {
      setLoading(false);
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
              <img src="/logo.png" alt="HealioScan Logo" className="site-logo" />
            </a>
          </div>
        </div>
      </header>

      <div className="auth-container">
        <div className="card">
          <div className="logo-container">
            <h1>Forgot Password</h1>
          </div>

          <div className="auth-box">
            <h2>Forgot Password</h2>
            <div className="flash-messages">
              {errors.root && (
                <div className="flash-message danger">
                  {errors.root.message}
                </div>
              )}
              {showError && (
                <div className="flash-message danger">
                  Email not found. Please try again.
                </div>
              )}
            </div>

            {!linkSent ? (
              <div className="form-container">
                <form onSubmit={handleSubmit(onSubmit)} className="forgot-password-form">
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      {...register("email", {
                        required: "Email is required",
                      })}
                    />
                    {errors.email && (
                      <p className="error-message">{errors.email.message}</p>
                    )}
                  </div>
                  <button type="submit" className="login-button" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="confirmation-message">
                <p>
                  A password reset link has been sent to email. Please check your inbox and follow the instructions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer>
        <p>&copy; 2025 HealioScan. All rights reserved.</p>
      </footer>
    </>
  );
};

export default ForgotPassword;

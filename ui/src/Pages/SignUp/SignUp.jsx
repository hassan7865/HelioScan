import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./SignUp.css";
import { FaUserAlt, FaEnvelope, FaLock } from "react-icons/fa";
import Request from "../../../Utils/Request";
import UserProfile from "../../../Utils/UserProfile";
import { useNavigate } from "react-router-dom";
const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const passwordInput = watch("password", "");
  const [passwordStrengthText, setPasswordStrengthText] = useState(""); // State to manage password strength text
  const [passwordStrength, setPasswordStrength] = useState(0); // State to manage password strength percentage

  useEffect(() => {
    if (passwordInput) {
      
      const strength = calculatePasswordStrength(passwordInput);
      setPasswordStrength(strength);
      updatePasswordStrengthUI(strength);
    } else {
      setPasswordStrength(0); // Reset if no password is entered
      setPasswordStrengthText("");
    }
  }, [passwordInput]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {

      const response = await Request.post("/auth/signup", formData);
      if (response.data.access_token) {
        UserProfile.SetUserData(response.data);
        navigate("/enable2fa")
      }
    } catch (error) {
       
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.detail || "Sign up failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z\d]/.test(password)) strength += 25;
    return strength;
  };

  const updatePasswordStrengthUI = (strength) => {
    let strengthText = "";
    if (strength <= 25) strengthText = "Weak";
    else if (strength <= 50) strengthText = "Fair";
    else if (strength <= 75) strengthText = "Good";
    else strengthText = "Strong";

    setPasswordStrengthText(strengthText);
  };
  const getStrengthColor = (strength) => {
    if (strength <= 25) return "#e74c3c"; // Red (Weak)
    if (strength <= 50) return "#f39c12"; // Orange (Fair)
    if (strength <= 75) return "#f1c40f"; // Yellow (Good)
    return "#2ecc71"; // Green (Strong)
  };
  return (
    <div>
      {/* Background animation */}
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

      {/* Main content */}
      <div className="auth-container">
        <div className="card">
          <div className="logo-container">
            <h1>Join HealioScan</h1>
          </div>

          {/* Flash Messages */}
          <div className="flash-messages">
            {errors.root && (
              <div className="flash-message danger">{errors.root.message}</div>
            )}
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="auth-form"
            id="signup-form"
          >
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                {...register("username", { required: "Username is required" })}
              />
              <span className="input-icon">
                <FaUserAlt></FaUserAlt>
              </span>
              {errors.username && (
                <p className="error-message">{errors.username.message}</p>
              )}
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                {...register("email", { required: "Email is required" })}
              />
              <span className="input-icon">
                <FaEnvelope></FaEnvelope>
              </span>
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <span className="input-icon">
                <FaLock></FaLock>
              </span>
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>
            {passwordStrength > 0 && (
              <>
                <div className="password-strength-text">
                  {passwordStrengthText}
                </div>
                <div className="password-strength-line">
                  <div
                    className="strength-bar"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getStrengthColor(passwordStrength),
                    }}
                  ></div>
                </div>
              </>
            )}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>

      <footer>
        <p>&copy; 2025 HealioScan. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Helper Functions

export default Signup;

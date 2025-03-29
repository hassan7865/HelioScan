import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./Login.css";
import Request from "../../../Utils/Request";
import UserProfile from "../../../Utils/UserProfile";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();
  const [show2FA, setShow2FA] = useState(false); // Whether to show the 2FA form or not
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(""); // Store the email for 2FA verification
  const passwordInput = watch("password", ""); // Watch the password for strength calculation
  const navigate = useNavigate();
  const currentUser = UserProfile.GetUserData(); // Get current user profile if logged in

  useEffect(() => {
    if (currentUser && currentUser.user_id) {
      if (currentUser.is_admin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, []);

  useEffect(() => {
    // Update Password Strength Indicator
    const strength = calculatePasswordStrength(passwordInput);
    updatePasswordStrengthUI(strength);
  }, [passwordInput]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      if (show2FA) {
        // Step 2: Submit the verification code if 2FA is enabled
        const data = new URLSearchParams();
        data.append("username", email);
        data.append("password", formData.password);
        data.append("verification_code", verificationCode);

        const response = await Request.post("/auth/login2faEnable", data);
        if (response.data.access_token) {
          UserProfile.SetUserData(response.data);
          navigate("/loading")
        }
      } else {
        // Step 1: Submit the email and password to check if 2FA is enabled
        const data = new URLSearchParams();
        data.append("username", formData.email);
        data.append("password", formData.password);

        const response = await Request.post("/auth/login2faDisable", data);
        if (response.data.is_2fa_enabled) {
          setEmail(formData.email); // Store email for OTP verification
          setShow2FA(true); // Show the 2FA input form
        } else {
          UserProfile.SetUserData(response.data);
          navigate("/loading")
        }
      }
    } catch (error) {
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.detail || "Login failed. Please try again.",
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
            <h1>Login to HealioScan</h1>
          </div>

          <div className="auth-box">
            <h2>Login</h2>
            <div className="flash-messages">
              {errors.root && (
                <div className="flash-message danger">
                  {errors.root.message}
                </div>
              )}
            </div>
            <div className="form-container">
              <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                {show2FA ? (
                  <>
                    <div className="form-group">
                      <input
                        className="otp"
                        type="text"
                        name="verification_code"
                        placeholder="000000"
                        pattern="[0-9]{6}"
                        maxLength="6"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="verify-button"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <input
                        type="email"
                        placeholder="Email"
                        {...register("email", {
                          required: "Email is required",
                        })}
                      />
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
                        })}
                      />
                      {errors.password && (
                        <p className="error-message">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="login-button"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Log in"}
                    </button>

                    <p className="auth-link">
           <a href="/account-validate"> Forget password? </a>
          </p>
                  </>
                )}
              </form>
            </div>
          </div>

          <p className="auth-link">
            Don't have an account? <a href="/signup">Sign up here</a>
          </p>
        </div>
      </div>
      <footer>
        <p>&copy; 2025 HealioScan. All rights reserved.</p>
      </footer>
    </>
  );
};

// Helper Functions
const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 25;
  if (/[^a-zA-Z\d]/.test(password)) strength += 25;
  return strength;
};

const updatePasswordStrengthUI = (strength) => {
  const passwordStrength = document.querySelector(".password-strength");
  if (passwordStrength) {
    const colors = {
      25: "#e74c3c",
      50: "#f39c12",
      75: "#f1c40f",
      100: "#2ecc71",
    };
    passwordStrength.style.width = `${strength}%`;
    passwordStrength.style.backgroundColor =
      colors[Math.ceil(strength / 25) * 25] || "#e74c3c";
  }
};

export default Login;

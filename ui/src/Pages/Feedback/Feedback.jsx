import { useForm } from "react-hook-form";
import { useState } from "react";
import "./Feedback.css";
import UserProfile from "../../../Utils/UserProfile";
import Request from "../../../Utils/Request";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import toast from "react-hot-toast";
const FeedbackForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [IsLoading,setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const token = UserProfile.GetUserData().access_token;
      const response = await Request.post("/user/feedback", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.detail);
      setMessage(response.data.detail);
      setSuccess(true);
      reset();
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Something went wrong. Try again."
      );
      setSuccess(false);
    }
    finally{
      setIsLoading(false)
    }
  };

  return (
    <>
      <Navbar></Navbar>
      <main>
        <section className="feedback-hero">
          <h1 className="animate-text">We Value Your Feedback</h1>
          <p className="animate-text">
            Help us improve HealioScan by sharing your thoughts and experiences.
          </p>
        </section>

        <section className="feedback-form animate-fade-in">
          <form id="feedbackForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group animate-slide-up">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="error-message">{errors.name.message}</p>
              )}
            </div>

            <div className="form-group animate-slide-up">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@]+@[^@]+\.[^@]+$/,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="form-group animate-slide-up">
              <label htmlFor="feedbackType">Feedback Type:</label>
              <select
                id="feedbackType"
                {...register("type", {
                  required: "Please select a feedback type",
                })}
              >
                <option value="">Select a feedback type</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="general">General Feedback</option>
              </select>
              {errors.feedbackType && (
                <p className="error-message">{errors.feedbackType.message}</p>
              )}
            </div>

            <div className="form-group animate-slide-up">
              <label htmlFor="message">Your Feedback:</label>
              <textarea
                id="message"
                {...register("message", {
                  required: "Message cannot be empty",
                })}
              ></textarea>
              {errors.message && (
                <p className="error-message">{errors.message.message}</p>
              )}
            </div>

            <button type="submit" className="btn-primary animate-pulse">
              {IsLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>

          {/* Success Message */}
          {message && (
            <div
              className={`feedback-message ${success ? "success" : "error"}`}
            >
              {message}
            </div>
          )}

          {/* Success Animation */}
          {success && (
            <div className="success-animation">
              <svg
                className="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <circle
                  className="checkmark__circle"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  className="checkmark__check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
          )}
        </section>
      </main>
      <Footer></Footer>
    </>
  );
};

export default FeedbackForm;

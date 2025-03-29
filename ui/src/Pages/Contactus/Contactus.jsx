import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "./Contactus.css";
import Request from "../../../Utils/Request";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import UserProfile from "../../../Utils/UserProfile";

const ContactUs = () => {
  const [IsLoading,setIsLoading] = useState(false)
  const user = UserProfile.GetUserData();
  const {
    register,
    setError,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true)
    await Request.post("/user/contact_us", data)
      .then((res) => {
        toast.success(res.data.detail);
        reset();
      })
      .catch((err) => {
        setError("root", {
          type: "manual",
          message:
            err.response?.data?.detail ||
            "Something gone wrong. Please try again.",
        });
      }).finally(()=>{
        setIsLoading(false)
      });
  };

  return (
    <div className="contact-us-page">
      <div className="background-animation"></div>
      <header className="site-header">
        <nav>
          <div className="logo-wrapper">
            <a href="/landing">
              <img src="./logo.png" alt="HealioScan Logo" className="logo" />
            </a>
          </div>
          <ul>
            <li>
              <NavLink
                to={user ? "/dashboard" : "/login"}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {user ? "Dashboard" : "Sign in"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contactus"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Contact Us
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main className="contact-us-container">
        <div className="contact-card">
          <h1 className="title">Contact Us</h1>
          <form
            id="contact-form"
            className="animated-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  {...register("name", { required: true })}
                  id="name"
                  className="form-input"
                />
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <div className="input-line"></div>
                {errors.name && (
                  <span className="error-message">Name is required</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  {...register("email", { required: true })}
                  id="email"
                  className="form-input"
                />
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-line"></div>
                {errors.email && (
                  <span className="error-message">Email is required</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  {...register("subject", { required: true })}
                  id="subject"
                  className="form-input"
                />
                <label htmlFor="subject" className="form-label">
                  Subject
                </label>
                <div className="input-line"></div>
                {errors.subject && (
                  <span className="error-message">Subject is required</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <textarea
                  {...register("message", { required: true })}
                  id="message"
                  className="form-input"
                ></textarea>
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <div className="input-line"></div>
                {errors.message && (
                  <span className="error-message">Message is required</span>
                )}
              </div>
            </div>

            <button type="submit" className="submit-btn">
              <span className="btn-text">{IsLoading ? "Sending..." : "Send Message"}</span>
              <div className="btn-loader"></div>
            </button>
          </form>
          {errors.root && (
            <p className="error-message">{errors.root.message}</p>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: info@healioscan.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="https://www.facebook.com/">Facebook</a>
              </li>
              <li>
                <a href="https://www.instagram.com/">Instagram</a>
              </li>
              <li>
                <a href="https://www.linkedin.com/">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="copyright">
          &copy; 2025 HealioScan. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default ContactUs;

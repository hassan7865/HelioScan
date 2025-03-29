import React from "react";
import "./Landing.css";
import { NavLink } from "react-router-dom";
import UserProfile from "../../../Utils/UserProfile";

const LandingPage = () => {
    const user = UserProfile.GetUserData()
  return (
    <div>
      <header>
        <nav>
          <a href="/home">
            <img src="/logo.png" alt="HealioScan Logo" className="logo" />
          </a>
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

      <main>
        <section className="hero">
          <h1 className="animate-text">Welcome to HealioScan</h1>
          <p className="animate-text">
            Advanced medical imaging analysis powered by cutting-edge AI
            technology.
          </p>
          <a href="/login" className="btn-primary animate-button">
            Get Started
          </a>
        </section>

        <section id="about" className="about">
          <h2 style={{ textAlign: "center" }}>About HealioScan</h2>
          <p>
            HealioScan is revolutionizing medical imaging analysis with
            state-of-the-art AI technology. Our platform provides fast,
            accurate, and reliable results for healthcare professionals
            worldwide.
          </p>
        </section>

        <section id="features" className="features">
          <h2>Key Features</h2>
          <div className="feature-grid">
            <div className="feature-item">
              <i className="icon-brain"></i>
              <h3>AI-Powered Analysis</h3>
              <p>Cutting-edge algorithms for precise diagnostics</p>
            </div>
            <div className="feature-item">
              <i className="icon-clock"></i>
              <h3>Rapid Results</h3>
              <p>Get analysis results in minutes, not hours</p>
            </div>
            <div className="feature-item">
              <i className="icon-shield"></i>
              <h3>Secure & Compliant</h3>
              <p>HIPAA-compliant data protection</p>
            </div>
            <div className="feature-item">
              <i className="icon-chart"></i>
              <h3>Comprehensive Reporting</h3>
              <p>Detailed insights and visualizations</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: service@healioscan.com</p>
            <p>Phone: +1 (615) 538-8277</p>
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
                <a href="https://www.linkedin.com/">Linkedin</a>
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

export default LandingPage;

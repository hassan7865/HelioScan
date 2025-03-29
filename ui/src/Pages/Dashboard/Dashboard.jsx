import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Request, { BaseURL } from "../../../Utils/Request";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import UserProfile from "../../../Utils/UserProfile";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const user = UserProfile.GetUserData();
  const [currentUser, setCurrentUser] = useState({
    username: user.username,
    is2FAEnabled: user.is_2fa_enabled,
  });
  const [totalScans, setTotalScans] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartImage, setChartImage] = useState("");
  const [scanHistory, setScanHistory] = useState([]);
  const [enable2FAUrl, setEnable2FAUrl] = useState("/enable-2fa");

  useEffect(() => {
    const fetchData = async () => {
      const token = UserProfile.GetUserData().access_token;
      await Request.get("/user/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          
          setTotalScans(res.data.total_scans);
          setRecentActivity(res.data.recent_activity);
          setChartImage(res.data.chart_image);
          setScanHistory(res.data.scan_history);
        })
        .catch((err) => {
          console.error("Error fetching dashboard data:", err);
        });
    };

    fetchData();
  }, []); // Empty dependency array to run only once on component mount

  return (
    <>
      <Navbar></Navbar>
      <main className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {currentUser.username}!</h1>
          <p>Here's an overview of your HealioScan activity.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card total-scans">
            <h2>Total Scans</h2>
            <p className="count">{totalScans || 0}</p>
          </div>

          <div className="dashboard-card recent-activity">
            <h2>Recent Activity</h2>
            <ul>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <li key={index}>
                    {activity.status} on {activity.date}
                  </li>
                ))
              ) : (
                <li>No recent activity</li>
              )}
            </ul>
          </div>

          <div className="dashboard-card security-settings">
            <div className="security-header">
              <h2>Security Settings</h2>
              <span className="security-icon">🔐</span>
            </div>

            <div className="security-status">
              {currentUser.is2FAEnabled ? (
                <div className="status-badge enabled">
                  <span className="status-icon">✓</span>
                  <span className="status-text">2FA Enabled</span>
                </div>
              ) : (
                <div className="status-badge disabled">
                  <span className="status-icon">!</span>
                  <span className="status-text">2FA Disabled</span>
                </div>
              )}
              <p className="security-description">
                {currentUser.is2FAEnabled
                  ? "Your account is protected with two-factor authentication."
                  : "Enhance your account security by enabling two-factor authentication."}
              </p>
              {!currentUser.is2FAEnabled && (
                <Link className="security-button" to="/enable2Fa">
                  Enable 2FA
                  <span className="button-icon">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h2>Scan Activity Over Time</h2>
          <img
            src={`data:image/png;base64,${chartImage}`}
            alt="Scan Activity Chart"
          />
        </div>

        <div className="scan-history">
          <h2>Scan History</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Image</th>
                <th>Prediction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scanHistory.length > 0 ? (
                scanHistory.map((scan, index) => (
                  <tr key={index}>
                    <td>{scan.date}</td>
                    <td>
                      <img
                        src={BaseURL + "/" + scan.image_path}
                        alt="Scan"
                        width="50"
                      />
                    </td>
                    <td>{scan.prediction}</td>
                    <td>{scan.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No scan history available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer></Footer>
    </>
  );
};

export default Dashboard;

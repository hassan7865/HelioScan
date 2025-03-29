import React, { useEffect, useState } from 'react';
import { FaUsers, FaFileMedicalAlt, FaStar, FaComments, FaChartBar, FaSignOutAlt, FaHome } from 'react-icons/fa'; // Importing React Icons
import './Dashboard.css';
import UserProfile from '../../../../Utils/UserProfile';
import Request from '../../../../Utils/Request';
import { NavLink, useNavigate } from 'react-router-dom';
import AdminFeedback from '../Feedback/Feedback';
import { AdminNavbar } from '../../../Components/AdminNavbar/AdminNavbar';

const AdminDashboard = () => {
    const navigate =useNavigate()
  const [dashboardData, setDashboardData] = useState({
    total_users: 0,
    total_scans: 0,
    total_feedback: 0,
    feedback_counts: {},
    recent_scans: [],
    recent_feedback: [],
    recent_users: [],
  });

  
  useEffect(() => {
    const token = UserProfile.GetUserData().access_token;
    Request.get("/user/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setDashboardData(res.data))
      .catch((err) => console.error("Error fetching dashboard data:", err));
  }, []);

  const { total_users, total_scans, total_feedback, feedback_counts, recent_scans, recent_feedback, recent_users } = dashboardData;

 

  return (
    <div>
     <AdminNavbar></AdminNavbar>

      <main>
        <section className="welcome-section">
          <h2 className="animate-text">Welcome to the Admin Dashboard</h2>
          <p className="animate-text">Manage your HealioScan platform efficiently and effectively.</p>
        </section>

        <section className="quick-stats">
          <div className="stat-card animate-card">
            <FaUsers />
            <h3>Total Users</h3>
            <p className="stat-number" data-target={total_users}>{total_users}</p>
          </div>
          <div className="stat-card animate-card">
            <FaFileMedicalAlt />
            <h3>Scans Analyzed</h3>
            <p className="stat-number" data-target={total_scans}>{total_scans}</p>
          </div>
          <div className="stat-card animate-card">
            <FaStar />
            <h3>Total Feedbacks</h3>
            <p className="stat-number" data-target={total_feedback}>{total_feedback}</p>
          </div>
        </section>

        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            <li className="animate-list-item">New user registration: {recent_users[0]?.name || 'N/A'}</li>
            <li className="animate-list-item">Feedback received from: {recent_feedback[0]?.user_name || 'N/A'}</li>
            <li className="animate-list-item">Scan analysis completed for: {recent_scans[0]?.user_id || 'N/A'}</li>
            <li className="animate-list-item">System update: Version 2.1.0 deployed</li>
          </ul>
        </section>

        <section className="recent-registrations">
          <h2>Recent User Registrations</h2>
          <ul className="activity-list">
            {recent_users.map((user) => (
              <li key={user.id} className="animate-list-item">
                {user.name} ({user.email}) - Registered on {user.date_created}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 HealioScan. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;

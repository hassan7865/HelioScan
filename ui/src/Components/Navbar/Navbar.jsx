import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import "./Navbar.css";
import UserProfile from '../../../Utils/UserProfile';

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = ()=>{
    UserProfile.DeleteUser()
    navigate("/landing")
  }
  return (
    <header>
      <nav>
        <div className="logo-container">
          <Link to="/landing">
            <img src="/logo.png" alt="HealioScan Logo" className="logo" />
          </Link>
        </div>
        <ul>
          <li><NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Dashboard</NavLink></li>
          <li><NavLink to="/uploadScan" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Upload Scans</NavLink></li>
          <li><NavLink to="/viewResults" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>View Results</NavLink></li>
          <li><NavLink to="/feedback" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>Feedback</NavLink></li>
          <li style={{cursor:"pointer"}} onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

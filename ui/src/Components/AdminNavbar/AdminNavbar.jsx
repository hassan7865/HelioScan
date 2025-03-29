import React from 'react'
import './AdminNavbar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import UserProfile from '../../../Utils/UserProfile'
export const AdminNavbar = () => {
    const navigate = useNavigate()
     const handleLogout = ()=>{
        UserProfile.DeleteUser()
        navigate("/landing")
      }
    
  return (
    <header>
    <nav>
      <div className="logo-container">
        <a href="/home">
          <img src="/logo.png" alt="HealioScan Logo" className="logo" />
        </a>
        <h1 className="project-name">Admin Dashboard</h1>
      </div>
      <ul>
        <li><NavLink to="/admin/dashboard" activeClassName="active">Home</NavLink></li>
        <li><NavLink to="/admin/feedback" activeClassName="active">Feedback</NavLink></li>
        <li style={{cursor:"pointer"}} onClick={handleLogout}>Logout</li>
      </ul>
    </nav>
    </header>
  )
}

import React from 'react';
import './Footer.css'

const Footer = () => {
  return (
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
            <li><a href="#UploadScans">Upload Scans</a></li>
            <li><a href="/viewResults">View Results</a></li>
            <li><a href="/feedback">Feedback</a></li>
          </ul>
        </div>
      </div>
      <p className="copyright">&copy; 2025 HealioScan. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

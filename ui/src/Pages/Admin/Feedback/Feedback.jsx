import React, { useEffect, useState } from 'react';
import { FaSearch, FaEye, FaTrashAlt } from 'react-icons/fa';
import './Feedback.css';
import FeedbackModal from '../../../Components/FeedbackModal/FeedbackModal';
import { NavLink, useNavigate } from 'react-router-dom';
import Request from '../../../../Utils/Request';
import toast from 'react-hot-toast';
import UserProfile from '../../../../Utils/UserProfile';
import { AdminNavbar } from '../../../Components/AdminNavbar/AdminNavbar';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // Fetch feedbacks from API
  const loadFeedbacks = async (search = '') => {
    try {
        const token = UserProfile.GetUserData().access_token;
      const response = await Request.get(`/user/admin/feedback?search_term=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbacks([...response.data.feedbacks]); 
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadFeedbacks(searchTerm);
  };

  // View feedback details
  const viewFeedbackDetails = (id) => {
    const token = UserProfile.GetUserData().access_token;
    Request.get(`/user/admin/feedback/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) =>{
        setCurrentFeedback(response.data.feedback);
        setIsModalOpen(true);
      }).catch((error) => console.error('Error fetching feedback details:', error));
  };

  // Delete feedback
  const deleteFeedback = (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
        const token = UserProfile.GetUserData().access_token;
      Request.delete(`/user/admin/feedback/${id}`
        , {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      )
        .then((response) => {
          if (response.status== 200) {
            toast.success("FeedBack Deleted Successfully")
            loadFeedbacks(); 
          } else {
            alert('Failed to delete feedback');
          }
        })
        .catch((error) => console.error('Error deleting feedback:', error));
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentFeedback(null);
  };

 
  return (
    <div>
        <AdminNavbar></AdminNavbar>
      <main>
        <section className="welcome-section">
          <h2>Feedback Management</h2>
          <p>Review and manage user feedback for HealioScan</p>
        </section>

        <section className="search-bar">
          <form onSubmit={handleSearch}>
            <div className="search-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search feedback..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </div>
          </form>
        </section>

        <section className="feedback-list">
          <h2>Feedbacks</h2>
          <div className="table-container">
            <table id="feedbackTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr><td colSpan="6">No feedbacks found.</td></tr>
                ) : (
                  feedbacks && feedbacks.length > 0 &&feedbacks.map((feedback) => (
                    <tr key={feedback.id}>
                      <td>{feedback.id}</td>
                      <td>{feedback.name}</td>
                      <td>{feedback.email}</td>
                      <td>
                        <span className={`badge badge-${feedback.type.toLowerCase()}`}>{feedback.type}</span>
                      </td>
                      <td>{feedback.message.substring(0, 50)}{feedback.message.length > 50 ? '...' : ''}</td>
                      <td style={{display:"flex",gap:"5px"}}>
                        <button onClick={() => viewFeedbackDetails(feedback.id)}><FaEye /></button>
                        <button onClick={() => deleteFeedback(feedback.id)}><FaTrashAlt /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 HealioScan. All rights reserved.</p>
      </footer>

      {/* Modal to show feedback details */}
      <FeedbackModal
        isOpen={isModalOpen}
        feedback={currentFeedback}
        onClose={closeModal}
      />
    </div>
  );
};

export default AdminFeedback;

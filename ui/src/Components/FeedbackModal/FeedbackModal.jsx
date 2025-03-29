import React from 'react';
import './FeedBackModal.css'; // Assuming you have some styles for the modal

const FeedbackModal = ({ isOpen, feedback, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Feedback Details</h2>
        <div>
          <p><strong>ID:</strong> {feedback.id}</p>
          <p><strong>Name:</strong> {feedback.name}</p>
          <p><strong>Email:</strong> {feedback.email}</p>
          <p><strong>Type:</strong> {feedback.type}</p>
          <p><strong>Message:</strong> {feedback.message}</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

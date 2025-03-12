import React from "react";
import { motion } from "framer-motion";
import "./AddSubjectModal.css";

const AddSubjectModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="add-subject-modal-overlay" onClick={onClose}>
      <motion.div
        className="add-subject-modal-content"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <h2>Add Subject</h2>
        <form>
          <label>Subject Name:</label>
          <input type="text" placeholder="Enter subject name" required />

          <label>Subject Details:</label>
          <input type="text" placeholder="Enter a related tags" required />


          <div className="add-subject-modal-buttons">
            <button type="submit" className="add-subject-save">Save</button>
            <button type="button" className="add-subject-cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddSubjectModal;

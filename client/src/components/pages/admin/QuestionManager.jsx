import React, { useState, useEffect } from "react";
import axiosInstance from "../../../services/axiosInstance";
import "./QuestionManager.css"

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
    text: "",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "",
    categoryName: "",
    scoring: {}, // Added scoring field
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [scoringKey, setScoringKey] = useState(""); // Temporary scoring key input
  const [scoringValue, setScoringValue] = useState(""); // Temporary scoring value input

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axiosInstance.get("/admin/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleScoringChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      scoring: { ...prev.scoring, [key]: parseInt(value, 10) },
    }));
  };

  const addScoringEntry = () => {
    if (scoringKey && scoringValue) {
      handleScoringChange(scoringKey, scoringValue);
      setScoringKey("");
      setScoringValue("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put(`/admin/questions/${selectedQuestionId}`, form);
      } else {
        await axiosInstance.post("/admin/questions", form);
      }
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleEdit = (question) => {
    setForm(question);
    setSelectedQuestionId(question._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const resetForm = () => {
    setForm({
      text: "",
      type: "rating",
      scale: { min: 1, max: 5, step: 1 },
      required: true,
      category: "",
      categoryName: "",
      scoring: {},
    });
    setScoringKey("");
    setScoringValue("");
    setIsEditing(false);
    setSelectedQuestionId(null);
  };

  return (
    <div className="admin-question-container">
      <header className="adminques-header">
              <h1>Question Manager</h1>
      </header>
    <div className="main">
    
          <div className="leftquestioncontainer">
          
                {/* Form */}
            <form onSubmit={handleSubmit}>
              
            <div className="topquestioncontainer">
            <label>Text:</label>
            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              rows="4" // Optional: Sets the height of the textarea
              required
              style={{
                resize: "vertical", // Allow resizing only vertically (optional)
                width: "100%", // Make it responsive
              }}
            />
            
            </div>

            <div className="bottomquestioncontainer">
            <div className="divtop">
            <label>Type:</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="rating">Rating</option>
              <option value="indicator">Indicator</option>
            </select>

            <label>Category:</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            />
            </div>

             
              <div className="div">
              <label>Category Name:</label>
              <input
                name="categoryName"
                value={form.categoryName}
                onChange={handleChange}
                required
              />
              <label>Scoring:</label>
              <input
                placeholder="Key (e.g., 1)"
                value={scoringKey}
                onChange={(e) => setScoringKey(e.target.value)}
              />
              <input
                placeholder="Value (e.g., 10)"
                value={scoringValue}
                onChange={(e) => setScoringValue(e.target.value)}
              />
              <button type="button" onClick={addScoringEntry}>
                Add
              </button>
              <button type="submit">{isEditing ? "Update" : "Create"} Question</button>
              {isEditing && <button onClick={resetForm}>Cancel</button>}
            

              <div className="resultscorediv">
              <ul>
              {Object.entries(form.scoring).map(([key, value]) => (
                <li key={key}>
                  {key} : {value}
                </li>
              ))}
            </ul>
              </div>
         
              </div>
             
            </div>
        </form>

          </div>
          <div className="rightquestioncontainer">
          {/* Question List */}
          <h6>Questions</h6>
          {questions.length === 0 ? (
            <p>No questions available.</p>
          ) : (
            <div className="question-list">
              {questions.map((question) => (
                <div className="question-item" key={question._id}>
                  <div className="question-text">
                    {question.text} - {question.type}
                  </div>
                  <div className="question-actions">
                    <button onClick={() => handleEdit(question)}>Edit</button>
                    <button onClick={() => handleDelete(question._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

    </div>
  );
};

export default QuestionManager;

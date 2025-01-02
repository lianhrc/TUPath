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
    <div>
      <h1>Manage Questions</h1>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Text:</label>
          <input
            name="text"
            value={form.text}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Type:</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="rating">Rating</option>
            <option value="indicator">Indicator</option>
          </select>
        </div>
        <div>
          <label>Category:</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Category Name:</label>
          <input
            name="categoryName"
            value={form.categoryName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Scoring:</label>
          <div>
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
          </div>
          <ul>
            {Object.entries(form.scoring).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
        <button type="submit">{isEditing ? "Update" : "Create"} Question</button>
        {isEditing && <button onClick={resetForm}>Cancel</button>}
      </form>

      {/* Question List */}
      <h2>Questions</h2>
      {questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        <ul>
          {questions.map((question) => (
            <li key={question._id}>
              {question.text} - {question.type}
              <button onClick={() => handleEdit(question)}>Edit</button>
              <button onClick={() => handleDelete(question._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionManager;

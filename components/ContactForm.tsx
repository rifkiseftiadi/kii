"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the import path as necessary

export const ContactForm = () => {
  const [isLightTheme, setIsLightTheme] = useState(true);

  // Sync theme with the global dark mode state
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsLightTheme(!isDarkMode);
  }, []);

  const [name, setName] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [comments, setComments] = useState<{ name: string; comment: string; rating: number }[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "comments"));
        const fetchedComments = querySnapshot.docs.map((doc) =>
          doc.data() as { name: string; comment: string; rating: number }
        );
        setComments(fetchedComments);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !comment.trim() || rating < 1 || rating > 5) {
      setError("Name, comment, and a valid rating (1–5) are required.");
      setSuccess("");
      return;
    }

    try {
      await addDoc(collection(db, "comments"), { name, comment, rating, timestamp: new Date() });
      setName("");
      setComment("");
      setRating(0);
      setError("");
      setSuccess("Your comment and rating have been submitted successfully!");

      setComments((prev) => [...prev, { name, comment, rating }]);
    } catch (err) {
      console.error("Error saving comment:", err);
      setError("Failed to submit your comment. Please try again.");
      setSuccess("");
    }
  };

  const calculateAverageRating = () => {
    if (comments.length === 0) return 0;
    const totalRating = comments.reduce((total, item) => total + item.rating, 0);
    return (totalRating / comments.length).toFixed(1); // Return average rating with 1 decimal
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "30px",
        borderRadius: "12px",
        backgroundColor: isLightTheme ? "#f9f9f9" : "#333",
        color: isLightTheme ? "#000" : "#fff",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "1.8rem", fontWeight: "bold" }}>
        Leave a Comment
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "15px",
          gridTemplateColumns: "1fr",
        }}
      >
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: isLightTheme ? "#fff" : "#444",
            color: isLightTheme ? "#000" : "#fff",
            fontSize: "1rem",
          }}
        />
        <textarea
          placeholder="Your Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: isLightTheme ? "#fff" : "#444",
            color: isLightTheme ? "#000" : "#fff",
            fontSize: "1rem",
          }}
        />
        <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                fontSize: "28px",
                cursor: "pointer",
                color: star <= rating ? "#FFD700" : "#ccc",
                transition: "color 0.3s",
              }}
            >
              ★
            </span>
          ))}
        </div>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
        <button
          type="submit"
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007BFF")}
        >
          Submit
        </button>
      </form>
      <div style={{ marginTop: "30px" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>Comments</h3>
        <p>Total Comments: {comments.length}</p>
        <p>Average Rating: {calculateAverageRating()} ★</p>
        {comments.length > 0 ? (
          <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
            {comments.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: isLightTheme ? "#fff" : "#444",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                }}
              >
                <strong style={{ fontSize: "1.1rem" }}>{item.name}</strong>
                <p style={{ margin: "5px 0", fontSize: "0.95rem" }}>{item.comment}</p>
                <div>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < item.rating ? "#FFD700" : "#ccc" }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: "10px", fontSize: "1rem" }}>No comments yet.</p>
        )}
      </div>
    </div>
  );
};
import React from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("Already logged in!");
      setTimeout(() => {
        navigate("/problems");
      }, 1000);
    } else {
      navigate("/login");
    }
  };

  const handleExploreProblems = () => {
    navigate("/problems");
  };

  return (
    <div className="landing-container">
      <Toaster />
      {/* Hero */}
      <div className="hero-section">
        <h1 className="hero-title">
          Unleash Your Coding Skills with <span>Coding Arena</span>
        </h1>
        <p className="hero-subtitle">
          Solve challenges, contribute problems, and climb the leaderboard in an interactive Online Judge platform.
        </p>
        <div className="hero-buttons">
          <button onClick={handleExploreProblems} className="custom-button">Explore Problems</button>
          <button onClick={handleGetStarted} className="custom-button secondary-btn">Get Started</button>
        </div>
      </div>
      {/* Contact Section */}
      <div className="contact-section">
        <h2>Connect with Me</h2>
        <div className="contact-links">
          <a href="https://www.instagram.com/sourav_sohil05/" className="contact-link" target="_blank" rel="noopener noreferrer">
            <span className="contact-icon">📷</span>
            <span className="contact-label">Instagram</span>
          </a>
          <a href="https://www.linkedin.com/in/kotha-venkata-sourav-sohil-50764b2b0" className="contact-link" target="_blank" rel="noopener noreferrer">
            <span className="contact-icon">💼</span>
            <span className="contact-label">LinkedIn</span>
          </a>
          <a href="https://github.com/Sohil1105" className="contact-link" target="_blank" rel="noopener noreferrer">
            <span className="contact-icon">🐙</span>
            <span className="contact-label">GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Landing;

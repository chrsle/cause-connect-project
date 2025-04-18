import React, { useState } from "react";
import "./styles/home.css";
import blueTransparent from "../blueTransparent.png";
import { loginRequest } from "../utils/user-utils";
import Registration from "../components/RegistrationForm";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest(username, password);
      if (response.success) {
        console.log("Login successful", response.data);
        // TODO: Redirect to dashboard


      } else {
        console.log("Login failed", response.error);
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="home__container">
        <img src={blueTransparent} alt="logo" className="home__logo" />
        <h2 className="home__subtitle">Welcome to</h2>
        <h1 className="home__title">Cause Connect</h1>
        <p className="home__description">Where service meets passion</p>
      </div>

      <div className="login-container">
        {!showRegistration ? (
          <div className="tab-container">
            <div className="signin-container">
              <h1 className="signin">Start Connecting!</h1>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input type="username" id="username" placeholder="Username" required />
              </div>
              <div className="form-group">
                <input type="password" id="password" placeholder="Password" required />
                <p className="forgot-password">Forgot Password?</p>
              </div>
              <button type="submit" className="login-btn">
                {loading ? "Logging in..." : "Login"}
              </button>
              {error && <p className="error-text">{error}</p>}
              <p className="register">
                Don't have an account?{" "}
                <span className="register-link" onClick={() => setShowRegistration(true)}>
                  Register here
                </span>
              </p>
            </form>
          </div>
        ) : (
          <Registration /> 
        )}
      </div>
    </div>
  );
};

export default Home;

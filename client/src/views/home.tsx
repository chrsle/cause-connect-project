import React, { useState } from "react";
import "./styles/home.css";
import blueTransparent from "../blueTransparent.png";
import Registration from "../components/RegistrationForm";
import { login, signup } from "../utils/user-utils";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState(""); // capture input values
  const [password, setPassword] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(username, password);

    if (res.success) {
      // You can redirect, fetch session info, or show a success message
      window.location.href = res.nextRoute || "/"; // example route
    } else {
      setError(res.message);
      console.error("Login error:", res.message);
    }

    setLoading(false);
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
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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

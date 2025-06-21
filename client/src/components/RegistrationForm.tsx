import React, { useState } from "react";
import "../views/styles/registration.css";
import { signup, login} from "../utils/user-utils";
import {saveUserProfile} from "../utils/profile-utils";

const Registration = () => {
  const [usertype, setUsertype] = useState<string | null>(null);
  const [slide, setSlide] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [fullname, setFullname] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [school, setSchool] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);

  const [nonprofitName, setNonprofitName] = useState<string | null>(null);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [mission, setMission] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState<string | null>(null);
  
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);

  const toggleCause = (cause: string) => {
    setSelectedCauses((prev) =>
      prev.includes(cause)
        ? prev.filter((c) => c !== cause)
        : [...prev, cause]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleUsertypeSelect = (type: string) => {
    setUsertype(type);
    setSlide(1);
  };

  const handleNextSlide = () => {
    setSlide((prev) => prev + 1);
  };

  const handlePreviousSlide = () => {
    setSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = async () => {
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    if (!username || !password || !confirmPassword || !usertype) {
      console.error("Missing required fields");
      return;
    }

    setPasswordsMatch(true);

    const registrationData = {
      usertype,
      fullname,
      age,
      school,
      bio,
      nonprofitName,
      selectedCauses,
      mission,
      location,
      selectedInterests,
      username,
      password,
    };

    console.log("Registration Data:", registrationData);

    try {
      const res = await signup(username, password, usertype);

      if (!res.success) {
        console.error("Registration failed:", res.message);
        alert("Registration failed: " + res.message);
        return;
      }

      const loginRes = await login(username, password);
      if (!loginRes.success) {
        alert("Signup succeeded, but login failed. Please log in manually.");
        return;
      }

      const profileData =
        usertype === "student"
          ? {
              full_name: fullname,
              age,
              school,
              bio,
              interests: selectedInterests.join(", "),
            }
          : {
              nonprofit_name: nonprofitName,
              location,
              category: selectedCauses.join(", "),
              statement: mission,
            };

      try {
        const profileRes = await saveUserProfile(profileData);
        console.log("Profile saved:", profileRes);
      } catch (err) {
        console.error("Profile saving failed:", err);
        alert("Account created, but saving your profile failed.");
      }

      setSlide(4);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="registration-flow-registration">
      {slide === 0 && (
        <div className="form-group-registration">
          <h2>Are you joining us as a...</h2>
          <div className="button-group-registration">
            <button onClick={() => handleUsertypeSelect("student")}>Student</button>
            <button onClick={() => handleUsertypeSelect("nonprofit")}>Nonprofit</button>
          </div>
        </div>
      )}

      {/* Student Slide 1: Personal Info */}
      {slide === 1 && usertype === "student" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
          <h2>Tell us about yourself..</h2>
          <input name="fullname" placeholder="Full Name" onBlur={(e) => setFullname(e.target.value)} required />
          <input name="age" type="number" placeholder="Age" onBlur={(e) => setAge(Number(e.target.value))} required />
          <input name="school" placeholder="Location" onBlur={(e) => setSchool(e.target.value)} required />
          <textarea name="bio" placeholder="Personal Bio" onBlur={(e) => setBio(e.target.value)} required />
          <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit">Next</button>
          </div>
        </form>
      )}

      {/* Nonprofit Slide 1: Basic Info (no causes) */}
      {slide === 1 && usertype === "nonprofit" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
          <h2>Nonprofit Info</h2>
          <input name="name" placeholder="Nonprofit Name" onBlur={(e) => setNonprofitName(e.target.value)} required />
          <input name="location" placeholder="Location" onBlur={(e) => setLocation(e.target.value)} required />
          <textarea name="mission" placeholder="Mission Statement" onBlur={(e) => setMission(e.target.value)} required />
          <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit">Next</button>
          </div>
        </form>
      )}

      {/* Student Slide 2: Interests */}
      {slide === 2 && usertype === "student" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
          <h2>What are your interests and passions?</h2>
          <div className="interests-grid">
            {[
              "Animals", "Children & Youth", "Cultural & Education", "Disabilities", "Disaster Relief", "Elderly",
              "Environment", "Global – Locale Based", "Health & Disease", "Homeless", "Hunger & Poverty",
              "International", "Military Charities", "Racial Equality", "Service & Benevolence Clubs", "Women's Issues", "Sports"
            ].map((interest) => (
              <button
                key={interest}
                type="button"
                className={`interest-btn ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                {selectedInterests.includes(interest) ? interest : `+ ${interest}`}
              </button>
            ))}
          </div>
          <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit">Next</button>
          </div>
        </form>
      )}

      {/* Nonprofit Slide 2: Causes Selection */}
      {slide === 2 && usertype === "nonprofit" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
          <h2>Select your cause(s)</h2>
          <p className="cause-prompt">What causes does your nonprofit focus on?</p>
          <div className="interests-grid">
            {[
              "Animals", "Children & Youth", "Cultural & Education", "Disabilities", "Disaster Relief", "Elderly",
              "Environment", "Global – Locale Based", "Health & Disease", "Homeless", "Hunger & Poverty",
              "International", "Military Charities", "Racial Equality", "Service & Benevolence Clubs", "Women's Issues", "Sports"
            ].map((cause) => (
              <button
                key={cause}
                type="button"
                className={`interest-btn ${selectedCauses.includes(cause) ? 'selected' : ''}`}
                onClick={() => toggleCause(cause)}
              >
                {selectedCauses.includes(cause) ? cause : `+ ${cause}`}
              </button>
            ))}
          </div>
          <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit">Next</button>
          </div>
        </form>
      )}

      {/* Slide 3: Account Creation (both user types) */}
      {slide === 3 && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
          <h2>Create your account!</h2>
          <input
            name="username"
            placeholder="Username"
            onBlur={(e) => setUsername(e.target.value)}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onBlur={(e) => setPassword(e.target.value)}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onBlur={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {!passwordsMatch && (
            <p style={{ color: 'red' }}>Passwords do not match. Please try again.</p>
          )}
          <div className="form-nav-buttons final-step-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit" className="complete-registration">Complete Registration</button>
          </div>
        </form>
      )}

      {slide === 4 && (
        <div className="redirect-message-registration">
          <p>Redirecting to your login...</p>
        </div>
      )}
    </div>
  );
};

export default Registration;
import React, { useState } from "react";
import "../views/styles/registration.css";
import { signup } from "../utils/user-utils";

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
    // Check if the usertype is selected
    if (usertype == "nonprofit" && slide == 1) {
        setSlide(2);
    }
    setSlide((prev) => prev + 1);
  };

  const handlePreviousSlide = () => {
    setSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = async () => {
    // Ensure the passwords match
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    if (!username || !password || !confirmPassword || !usertype) {
        console.error("Missing required fields");
        return;
      }
  
    setPasswordsMatch(true); // reset the error if previously set
  
    // Prepare the registration payload
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
      // Call signup utility function (assumes it returns a Promise)
      const res = await signup(username, password, usertype);
  
      if (res.success) {
        console.log("User registered successfully.");
        setSlide(4);
        // Optionally: redirect after delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        // Handle failure (e.g., username taken)
        console.error("Registration failed:", res.message);
        alert("Registration failed: " + res.message);
      }
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

      {slide === 1 && usertype === "student" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
          <h2>Tell us about yourself..</h2>
          <input name="fullname" placeholder="Full Name" onBlur={(e) => setFullname(e.target.value)} required />
          <input name="age" type="number" placeholder="Age" onBlur={(e) => setAge(Number(e.target.value))} required />
          <input name="school" placeholder="School" onBlur={(e) => setSchool(e.target.value)} required />
          <textarea name="bio" placeholder="Personal Bio" onBlur={(e) => setBio(e.target.value)} required />
          <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit">Next</button>
          </div>
        </form>
      )}

      {slide === 1 && usertype === "nonprofit" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
          <h2>Nonprofit Info</h2>
          <input name="name" placeholder="Nonprofit Name" onBlur={(e) => setNonprofitName(e.target.value)} required />
          <input name="location" placeholder="Location" onBlur={(e) => setLocation(e.target.value)} required />
          <div>
            <p className="cause-prompt">Select your cause(s):</p>
            <div className="interests-grid">
              {[
                "Animals", "Children & Youth", "Cultural & Education", "Disabilities", "Disaster Relief", "Elderly",
                "Environment", "Global – Locale Based", "Health & Disease", "Homeless", "Hunger & Poverty",
                "International", "Military Charities", "Racial Equality", "Service & Benevolence Clubs", "Women's Issues"
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
          </div>
          <textarea name="mission" placeholder="Mission Statement" onBlur={(e) => setMission(e.target.value)} required />
          <div className="form-nav-buttons">
            <button type="button" onClick={handlePreviousSlide}>Back</button>
            <button type="submit">Next</button>
          </div>
        </form>
      )}

      {/* Slide for students to pick their interests and passions */}
      {slide === 2 && usertype === "student" && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleNextSlide(); }}>
          <h2>What are your interests and passions?</h2>
          <div className="interests-grid">
            {[
              "Animals", "Art and Culture", "Education", "Engineering", "Environment",
              "Health & Wellness", "Mathematics", "Science", "Social Justice",
              "Sports and Fitness", "Technology"
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

      {/* Slide for creating username and password */}
      {slide === 3 && (
        <form className="form-registration" onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
          <h2>Create your account!</h2>
          <input
            name="username"
            placeholder="Email"
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

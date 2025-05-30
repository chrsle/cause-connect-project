import React, { useState, useRef } from "react";
import "./styles/userProfile.css";
import avatar from "../default-avatar.png";
import { dummyStudent } from "../constants/dummyStudent";
import NavBar from "../components/navBar";
import { dummyOrganization } from "../constants/dummyOrgs";

function OrganizationProfile() {
  const [imageUrl, setImageUrl] = useState(avatar);
  const [isHovering, setIsHovering] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState(
    dummyOrganization.category.split(", ")
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableInterests = [
    "Animals",
    "Art and Culture",
    "Education",
    "Engineering",
    "Environment",
    "Health & Wellness",
    "Mathematics",
    "Science",
    "Social Justice",
    "Sports & Fitness",
    "Technology"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setImageUrl(result);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsDataURL(file);
      
      // Reset the input after selection
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
 // Interest toggling functionality
 const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

    // Handle saving changes
    const saveChanges = () => {
        // Here you would typically save the changes to your backend
        // For now, we'll just exit edit mode
        setEditMode(false);
      };


  return (
    <>
      <NavBar userType="organization" />
      <div className="user-profile">
        {/* Left section with profile picture and name */}
        <div className="left-container">
          <div 
            className="profile-pic-container"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img src={imageUrl} alt="Profile" className="user-profile-profile-pic" />
            
            {isHovering && (
              <div className="user-profile-image-overlay">
                <label className="user-profile-camera-button">
                  <span className="camera-icon">📷</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden-input" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </label>
              </div>
            )}
          </div>

          <div>
            <span className="username">
              {dummyOrganization.name}'s profile page
            </span>
          </div>

          <div className="skills-container">
            <h3 className="skills-title">Upcoming Events: {dummyStudent.upcoming_events}</h3>
            <h3 className="skills-title">Past Events: {dummyStudent.past_events}</h3>
          </div>

          <button 
            className="edit-profile-btn"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Save Profile" : "Edit Profile"}
          </button>
        </div>

        {/* Right section with profile details */}
        <div className="right-container">
          <h2 className="section-title">Profile Information</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">👤</span> Name
              </h2>
              {editMode ? (
                <input 
                  type="text" 
                  className="info-input" 
                  defaultValue={dummyOrganization.name} 
                />
              ) : (
                <p className="user-info">{dummyOrganization.name}</p>
              )}
            </div>

            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">✉️</span> Email
              </h2>
              {editMode ? (
                <input 
                  type="email" 
                  className="info-input" 
                  defaultValue="organization@example.com" 
                />
              ) : (
                <p className="user-info">organization@example.com</p>
              )}
            </div>

            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">💼</span> Location
              </h2>
              {editMode ? (
                <input 
                  type="text" 
                  className="info-input" 
                  defaultValue={dummyStudent.school} 
                />
              ) : (
                <p className="user-info">{dummyStudent.school}</p>
              )}
            </div>

            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">❤️</span> Specializations
              </h2>
              {editMode ? (
                  <div className="interests-dropdown-container">
                  <div className="selected-interests">
                    {selectedInterests.map((interest, index) => (
                      <span key={index} className="selected-interest">
                        {interest}
                        <span 
                          className="remove-interest" 
                          onClick={() => toggleInterest(interest)}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="interests-dropdown">
                    <div className="dropdown-label">
                      Add interests <span className="dropdown-arrow">▼</span>
                    </div>
                    <div className="dropdown-options">
                      {availableInterests
                        .filter(interest => !selectedInterests.includes(interest))
                        .map((interest, index) => (
                          <div 
                            key={index} 
                            className="dropdown-option"
                            onClick={() => toggleInterest(interest)}
                          >
                            {interest}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="user-info">{selectedInterests.join(", ")}</p>
              )}
            </div>

            <div className="info-item bio-item">
              <h2 className="info-label">
                <span className="info-icon">📝</span> Bio
              </h2>
              {editMode ? (
                <textarea 
                  className="bio-input" 
                  defaultValue="I'm a student passionate about learning and connecting with others in my field."
                />
              ) : (
                <p className="user-bio">{dummyOrganization.statement}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
  );
}

export default OrganizationProfile;
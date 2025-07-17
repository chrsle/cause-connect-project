import React, { useState, useEffect } from "react";
import "./styles/userProfile.css";
import avatar from "../default-avatar.png";
import NavBar from "../components/navBar";
import { getUserProfile, updateUserProfile } from "../utils/profile-utils";
import { createAvatarFromName } from "../utils/profile-pic-utils";

interface NonprofitProfile {
  nonprofit_name: string;
  location: string;
  category: string;
  statement: string;
}

interface UserData {
  email: string;
  profile: NonprofitProfile;
}

function OrganizationProfile() {
  const [imageUrl, setImageUrl] = useState(avatar);
  const [editMode, setEditMode] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showNameWarning, setShowNameWarning] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form data state for editing
  const [formData, setFormData] = useState({
    nonprofit_name: '',
    location: '',
    category: '',
    statement: ''
  });

  const availableInterests = [
  "Animals", "Children & Youth", "Cultural & Education", "Disabilities", "Disaster Relief", "Elderly",
              "Environment", "Global – Local Based", "Health & Disease", "Homeless", "Hunger & Poverty",
              "International", "Military Charities", "Racial Equality", "Service & Benevolence Clubs", "Women's Issues", 
              "Sports", "Music/Art", "Engineering", "Mathematics", "Science", "Social Justice"
  ];

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Helper function for API calls
        const makeRequest = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) => {
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };

          const requestOptions: RequestInit = {
            method,
            headers,
            credentials: 'include', 
            body: data ? JSON.stringify(data) : undefined,
          };

          const response = await fetch(url, requestOptions);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred');
          }
          return await response.json();
        };

        const API_BASE = "https://causeconnectbackend.onrender.com/api";
        
        const data = await makeRequest(`${API_BASE}/me`, 'GET');
        console.log('Nonprofit data received:', data);
        
        if (data && data.profile) {
          // Set the user data with both email and profile
          setUserData({
            email: data.email,
            profile: data.profile
          });
          
          // Set form data for editing
          setFormData({
            nonprofit_name: data.profile.nonprofit_name || '',
            location: data.profile.location || '',
            category: data.profile.category || '',
            statement: data.profile.statement || ''
          });
          
          // Set selected interests from category
          if (data.profile.category) {
            setSelectedInterests(data.profile.category.split(", "));
          }

          // Set dynamic avatar based on organization name
          if (data.profile.nonprofit_name) {
            const dynamicAvatar = createAvatarFromName(data.profile.nonprofit_name);
            setImageUrl(dynamicAvatar);
          }
        } else {
          setError('No profile data found');
        }
      } catch (error) {
        console.error('Error fetching nonprofit profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update profile picture when name changes
  useEffect(() => {
    if (formData.nonprofit_name) {
      const dynamicAvatar = createAvatarFromName(formData.nonprofit_name);
      setImageUrl(dynamicAvatar);
    }
  }, [formData.nonprofit_name]);

  // Update selected interests when they change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: selectedInterests.join(", ")
    }));
  }, [selectedInterests]);

  // Interest toggling functionality
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Show warning if nonprofit name is being changed
    if (field === 'nonprofit_name' && userData?.profile.nonprofit_name && value !== userData.profile.nonprofit_name) {
      setShowNameWarning(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle saving changes
  const saveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await updateUserProfile(formData);
      
      // Update local state with new data
      if (userData) {
        setUserData({
          ...userData,
          profile: {
            ...userData.profile,
            ...formData
          }
        });
      }
      
      setEditMode(false);
      setShowNameWarning(false);
      console.log('Nonprofit profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode && !saving) {
      saveChanges();
    } else if (!editMode) {
      setEditMode(true);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <NavBar userType="organization" />
        <div className="user-profile">
          <div className="loading-message">Loading profile...</div>
        </div>
      </>
    );
  }

  // Show error state
  if (error && !userData) {
    return (
      <>
        <NavBar userType="organization" />
        <div className="user-profile">
          <div className="error-message">Error: {error}</div>
        </div>
      </>
    );
  }

  // Use real data or fallback
  const displayData = userData?.profile || {
    nonprofit_name: 'Unknown Organization',
    location: 'Unknown Location',
    category: 'No categories listed',
    statement: 'No statement available'
  };

  return (
    <>
      <NavBar userType="organization" />
      <div className="user-profile">
        {/* Left section with profile picture and name */}
        <div className="left-container">
          <div className="profile-pic-container">
            <img src={imageUrl} alt="Profile" className="user-profile-profile-pic" />
          </div>

          <div>
            <span className="username">
              {displayData.nonprofit_name}'s profile page
            </span>
          </div>

          <button 
            className="edit-profile-btn"
            onClick={handleEditToggle}
            disabled={saving}
          >
            {saving ? "Saving..." : editMode ? "Save Profile" : "Edit Profile"}
          </button>
          
          {error && <div className="error-message" style={{marginTop: '10px', color: 'red'}}>{error}</div>}
        </div>

        {/* Right section with profile details */}
        <div className="right-container">
          <h2 className="section-title">Profile Information</h2>
          
          {/* Name change warning */}
          {showNameWarning && (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '5px',
              padding: '15px',
              marginBottom: '20px',
              color: '#856404'
            }}>
              <strong>⚠️ Warning:</strong> Changing your organization name will only affect new events you create. 
              All current and active events will still display your previous name.
            </div>
          )}
          
          <div className="info-grid">
            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">👤</span> Name
              </h2>
              {editMode ? (
                <input 
                  type="text" 
                  className="info-input" 
                  value={formData.nonprofit_name}
                  onChange={(e) => handleInputChange('nonprofit_name', e.target.value)}
                />
              ) : (
                <p className="user-info">{displayData.nonprofit_name}</p>
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
                  value={userData?.email || ""}
                  disabled // Email shouldn't be editable from profile
                />
              ) : (
                <p className="user-info">{userData?.email || "No email"}</p>
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
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              ) : (
                <p className="user-info">{displayData.location}</p>
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
                <p className="user-info">{selectedInterests.join(", ") || displayData.category}</p>
              )}
            </div>

            <div className="info-item bio-item">
              <h2 className="info-label">
                <span className="info-icon">📝</span> Statement
              </h2>
              {editMode ? (
                <textarea 
                  className="bio-input" 
                  value={formData.statement}
                  onChange={(e) => handleInputChange('statement', e.target.value)}
                />
              ) : (
                <p className="user-bio">{displayData.statement}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
  );
}

export default OrganizationProfile;
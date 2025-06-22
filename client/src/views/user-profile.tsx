import React, { useState, useRef, useEffect } from "react";
import "./styles/userProfile.css";
import avatar from "../default-avatar.png";
import NavBar from "../components/navBar";
import { getUserProfile, updateUserProfile } from "../utils/profile-utils";

interface StudentProfile {
  full_name: string;
  age: number;
  school: string;
  bio: string;
  interests: string;
}

interface UserData {
  username: string;
  profile: StudentProfile;
}

function UserProfile() {
  const [imageUrl, setImageUrl] = useState(avatar);
  const [isHovering, setIsHovering] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form data state for editing
  const [formData, setFormData] = useState({
    full_name: '',
    age: 0,
    school: '', // location
    bio: '',
    interests: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableInterests = [
  "Animals",
  "Children & Youth", 
  "Cultural & Education",
  "Disabilities",
  "Disaster Relief",
  "Elderly",
  "Environment",
  "Global – Locale Based",
  "Health & Disease",
  "Homeless",
  "Hunger & Poverty",
  "International",
  "Military Charities",
  "Racial Equality",
  "Service & Benevolence Clubs",
  "Women's Issues",
  "Sports"
];

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Helper function for API calls (same as in NavBar)
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

        const API_BASE = "http://localhost:5001/api";
        
        const data = await makeRequest(`${API_BASE}/me`, 'GET');
        console.log('User data received:', data);
        
        if (data && data.profile) {
          // Set the user data with both username and profile
          setUserData({
            username: data.username,
            profile: data.profile
          });
          
          // Set form data for editing
          setFormData({
            full_name: data.profile.full_name || '',
            age: data.profile.age || 0,
            school: data.profile.school || '',
            bio: data.profile.bio || '',
            interests: data.profile.interests || ''
          });
          
          // Set selected interests
          if (data.profile.interests) {
            setSelectedInterests(data.profile.interests.split(", "));
          }
        } else {
          setError('No profile data found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update selected interests when they change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      interests: selectedInterests.join(", ")
    }));
  }, [selectedInterests]);

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

  const handleInputChange = (field: string, value: string | number) => {
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
      console.log('Profile updated successfully');
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
        <NavBar userType="student" />
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
        <NavBar userType="student" />
        <div className="user-profile">
          <div className="error-message">Error: {error}</div>
        </div>
      </>
    );
  }

  // Use real data or fallback
  const displayData = userData?.profile || {
    full_name: 'Unknown User',
    age: 0,
    school: 'Unknown Location',
    bio: 'No bio available',
    interests: 'No interests listed'
  };

  return (
    <>
      <NavBar userType="student" />
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
              {displayData.full_name}'s profile page
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
          
          <div className="info-grid">
            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">👤</span> Name
              </h2>
              {editMode ? (
                <input 
                  type="text" 
                  className="info-input" 
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                />
              ) : (
                <p className="user-info">{displayData.full_name}</p>
              )}
            </div>

            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">✉️</span> Username
              </h2>
              {editMode ? (
                <input 
                  type="text" 
                  className="info-input" 
                  value={userData?.username || ""}
                  disabled // Username shouldn't be editable from profile
                />
              ) : (
                <p className="user-info">{userData?.username || "No username"}</p>
              )}
            </div>

            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">🎂</span> Age
              </h2>
              {editMode ? (
                <input 
                  type="number" 
                  className="info-input" 
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                />
              ) : (
                <p className="user-info">{displayData.age}</p>
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
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                />
              ) : (
                <p className="user-info">{displayData.school}</p>
              )}
            </div>

            <div className="info-item">
              <h2 className="info-label">
                <span className="info-icon">❤️</span> Interests
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
                <p className="user-info">{selectedInterests.join(", ") || displayData.interests}</p>
              )}
            </div>

            <div className="info-item bio-item">
              <h2 className="info-label">
                <span className="info-icon">📝</span> Bio
              </h2>
              {editMode ? (
                <textarea 
                  className="bio-input" 
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              ) : (
                <p className="user-bio">{displayData.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
  );
}

export default UserProfile;
import React, { useState, useEffect } from "react";
import "./styles/settingsPage.css";
import NavBar from "../components/navBar";
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../utils/profile-utils';
import { getSession } from '../utils/user-utils';

interface UserProfile {
  full_name?: string;
  email?: string;
  age?: number;
  school?: string;
  bio?: string;
  interests?: string;
  nonprofit_name?: string;
  location?: string;
  category?: string;
  statement?: string;
}

interface AccountSettingsData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // Fix: Change userType to use the specific union type
  const [userType, setUserType] = useState<"student" | "organization">("student");
  const [sessionEmail, setSessionEmail] = useState<string>('');

  const [formData, setFormData] = useState<AccountSettingsData>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileFormData, setProfileFormData] = useState<UserProfile>({
    full_name: '',
    email: '',
    age: 0,
    school: '',
    bio: '',
    interests: '',
    nonprofit_name: '',
    location: '',
    category: '',
    statement: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get session data first
        const sessionData = await getSession();
        if (sessionData?.email) {
          setSessionEmail(sessionData.email);
          setFormData(prev => ({ ...prev, email: sessionData.email }));
        }

        // Get user profile
        const profile = await getUserProfile();
        setUserProfile(profile);
        
        // Determine user type based on profile data
        const isStudent = 'full_name' in profile;
        // Fix: Use 'organization' instead of 'nonprofit' to match your type definition
        setUserType(isStudent ? 'student' : 'organization');
        
        // Set profile form data
        if (isStudent) {
          setProfileFormData({
            full_name: profile.full_name || '',
            age: profile.age || 0,
            school: profile.school || '',
            bio: profile.bio || '',
            interests: profile.interests || '',
          });
        } else {
          setProfileFormData({
            nonprofit_name: profile.nonprofit_name || '',
            location: profile.location || '',
            category: profile.category || '',
            statement: profile.statement || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If profile doesn't exist, that's ok - user can create one
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ 
      ...prev, 
      [name]: name === 'age' ? parseInt(value) || 0 : value 
    }));
  };

  const handleAccountSave = async () => {
    try {
      // Validate passwords if changing password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          alert("New passwords do not match.");
          return;
        }
        if (!formData.currentPassword) {
          alert("Current password is required to set a new password.");
          return;
        }
        if (formData.newPassword.length < 8) {
          alert("New password must be at least 8 characters long.");
          return;
        }
      }

      // Create request payload
      const updateData: any = {};
      
      // Only include email if it's different from session email
      if (formData.email !== sessionEmail) {
        updateData.email = formData.email;
      }
      
      // Only include password fields if changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // If no changes, don't make request
      if (Object.keys(updateData).length === 0) {
        alert('No changes to save.');
        return;
      }

      const response = await fetch('http://localhost:5001/api/account/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account settings.');
      }

      alert('Account settings updated successfully!');
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Update error:', error);
      alert(`Error updating settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleProfileSave = async () => {
    try {
      // Validate required fields based on user type
      if (userType === 'student') {
        if (!profileFormData.full_name || !profileFormData.age || !profileFormData.school || !profileFormData.bio) {
          alert('Please fill in all required fields (Full Name, Age, School, Bio).');
          return;
        }
      } else if (userType === 'organization') {
        if (!profileFormData.nonprofit_name || !profileFormData.location || !profileFormData.category || !profileFormData.statement) {
          alert('Please fill in all required fields (Organization Name, Location, Category, Statement).');
          return;
        }
      }

      await updateUserProfile(profileFormData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelAccount = () => {
    // Reset account form to original values
    setFormData({
      email: sessionEmail,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleCancelProfile = () => {
    // Reset profile form to original values based on user type
    if (userProfile) {
      if (userType === 'student') {
        setProfileFormData({
          full_name: userProfile.full_name || '',
          age: userProfile.age || 0,
          school: userProfile.school || '',
          bio: userProfile.bio || '',
          interests: userProfile.interests || '',
        });
      } else {
        setProfileFormData({
          nonprofit_name: userProfile.nonprofit_name || '',
          location: userProfile.location || '',
          category: userProfile.category || '',
          statement: userProfile.statement || '',
        });
      }
    }
  };

  const handleCancelSecurity = () => {
    // Reset password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  if (loading) {
    return (
      <>
        <NavBar userType={userType} />
        <div className="settings-page">
          <div className="settings-container">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar userType={userType} />
      <div className="settings-page">
        <div className="settings-container">
          {/* Header */}
          <div className="settings-header">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Manage your account and profile information</p>
          </div>

          <div className="settings-content">
            {/* Left Sidebar */}
            <div className="settings-sidebar">
              <div className="profile-section">
                
                <div className="profile-info">
                  <h3 className="profile-name">
                    {userType === 'student' ? profileFormData.full_name || 'Student' : profileFormData.nonprofit_name || 'Organization'}
                  </h3>
                  <p className="profile-email">{sessionEmail}</p>
                </div>
              </div>

              <nav className="settings-nav">
                <button 
                  className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                  onClick={() => setActiveTab('account')}
                >
                  <span className="nav-icon">👤</span>
                  Account Settings
                </button>
                <button 
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <span className="nav-icon">📝</span>
                  Profile Information
                </button>
                <button 
                  className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <span className="nav-icon">🔒</span>
                  Security
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="settings-main">
              {activeTab === 'account' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2 className="section-title">Account Information</h2>
                    <p className="section-description">Update your email address</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleAccountChange}
                      placeholder="Enter your email address"
                    />
                  </div>

                  {/* Email Change Disclaimer */}
                  <div className="email-disclaimer">
                    <div className="info-card">
                      <h4>⚠️ Important Notice</h4>
                      <p>After changing your email address, please log out and log back in with your new email to see the updated information reflected throughout the application.</p>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={handleCancelAccount}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleAccountSave}>
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2 className="section-title">Profile Information</h2>
                    <p className="section-description">
                      {userType === 'student' ? 'Update your personal information and interests' : 'Update your organization information'}
                    </p>
                  </div>

                  {userType === 'student' ? (
                    <>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          name="full_name"
                          className="form-input"
                          value={profileFormData.full_name || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Age *</label>
                        <input
                          type="number"
                          name="age"
                          className="form-input"
                          value={profileFormData.age || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter your age"
                          min="1"
                          max="120"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">School *</label>
                        <input
                          type="text"
                          name="school"
                          className="form-input"
                          value={profileFormData.school || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter your school name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Bio *</label>
                        <textarea
                          name="bio"
                          className="form-input"
                          value={profileFormData.bio || ''}
                          onChange={handleProfileChange}
                          placeholder="Tell us about yourself"
                          rows={4}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Interests</label>
                        <input
                          type="text"
                          name="interests"
                          className="form-input"
                          value={profileFormData.interests || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter your interests (comma-separated)"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">Organization Name *</label>
                        <input
                          type="text"
                          name="nonprofit_name"
                          className="form-input"
                          value={profileFormData.nonprofit_name || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter organization name"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Location *</label>
                        <input
                          type="text"
                          name="location"
                          className="form-input"
                          value={profileFormData.location || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter your location"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Category *</label>
                        <input
                          type="text"
                          name="category"
                          className="form-input"
                          value={profileFormData.category || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter organization category"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Mission Statement *</label>
                        <textarea
                          name="statement"
                          className="form-input"
                          value={profileFormData.statement || ''}
                          onChange={handleProfileChange}
                          placeholder="Enter your organization's mission statement"
                          rows={4}
                        />
                      </div>
                    </>
                  )}

                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={handleCancelProfile}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleProfileSave}>
                      Save Profile
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2 className="section-title">Security Settings</h2>
                    <p className="section-description">Change your password</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-input"
                      value={formData.currentPassword}
                      onChange={handleAccountChange}
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-input"
                      value={formData.newPassword}
                      onChange={handleAccountChange}
                      placeholder="Enter a new password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={handleAccountChange}
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div className="security-info">
                    <div className="info-card">
                      <h4>Password Requirements:</h4>
                      <ul>
                        <li>At least 8 characters long</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character</li>
                      </ul>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-secondary" onClick={handleCancelSecurity}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleAccountSave}>
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
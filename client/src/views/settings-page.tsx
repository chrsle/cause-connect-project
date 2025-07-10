import React, { useState, useEffect } from "react";
import "./styles/settingsPage.css";
import NavBar from "../components/navBar";
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../utils/profile-utils';
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
  const [userType, setUserType] = useState<"student" | "organization">("student");
  const [sessionEmail, setSessionEmail] = useState<string>('');

  const [formData, setFormData] = useState<AccountSettingsData>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
        setUserType(isStudent ? 'student' : 'organization');
        
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

  const handleCancelAccount = () => {
    // Reset account form to original values
    setFormData({
      email: sessionEmail,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
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
            <p className="settings-subtitle">Manage your account and security settings</p>
          </div>

          <div className="settings-content">
            {/* Left Sidebar */}
            <div className="settings-sidebar">
              <div className="profile-section">
                <div className="profile-info">
                  <h3 className="profile-name">
                    {userType === 'student' ? 
                      (userProfile?.full_name || 'Student') : 
                      (userProfile?.nonprofit_name || 'Organization')
                    }
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
                        <li>At least 12 characters long</li>
                        <li>Password cannot exceed 70 characters</li>
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
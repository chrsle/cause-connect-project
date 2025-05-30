import React, { useState, useRef } from "react";
import "./styles/settingsPage.css";
import avatar from "../default-avatar.png";
import { dummyStudent } from "../constants/dummyStudent";
import NavBar from "../components/navBar";
import { useNavigate } from 'react-router-dom';

interface AccountSettingsData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(avatar);
  const [isHovering, setIsHovering] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState(
    dummyStudent.interests.split(", ")
  );
  const [activeTab, setActiveTab] = useState('account');

  const [formData, setFormData] = useState<AccountSettingsData>({
    email: dummyStudent.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch('/api/account/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update account settings.');
      }

      alert('Account settings updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating settings.');
    }
  };

  return (
    <>
      <NavBar userType="student" />
      <div className="settings-page">
        <div className="settings-container">
          {/* Header */}
          <div className="settings-header">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Manage your account preferences and security</p>
          </div>

          <div className="settings-content">
            {/* Left Sidebar */}
            <div className="settings-sidebar">
              <div className="profile-section">
          <div 
            className="profile-pic-container"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img src={imageUrl} alt="Profile" className="user-profile-profile-pic" />
          </div>
                <div className="profile-info">
                  <h3 className="profile-name">{dummyStudent.full_name}</h3>
                  <p className="profile-email">{dummyStudent.email}</p>
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
                <button 
                  className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <span className="nav-icon">⚙️</span>
                  Preferences
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="settings-main">
              {activeTab === 'account' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2 className="section-title">Account Information</h2>
                    <p className="section-description">Update your personal information and email address</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      defaultValue={dummyStudent.full_name}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2 className="section-title">Security Settings</h2>
                    <p className="section-description">Manage your password and security preferences</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-input"
                      value={formData.currentPassword}
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2 className="section-title">Preferences</h2>
                    <p className="section-description">Customize your experience and notifications</p>
                  </div>

                  <div className="preference-group">
                    <h4>Email Notifications</h4>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        New event notifications
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        Application updates
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                        Weekly digest
                      </label>
                    </div>
                  </div>

                  <div className="preference-group">
                    <h4>Privacy Settings</h4>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        Make profile visible to organizations
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span className="checkmark"></span>
                        Allow organizations to contact me
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../views/styles/navBar.css";
import blueTransparent from "../blueTransparent.png";
import { useState, useEffect } from "react";
import profileIcon2 from "../profileIcon2.png";
import "../views/styles/dropDownMenu.css";
import avatar from "../default-avatar.png";
import { dummyStudent } from "../constants/dummyStudent";
import { dummyOrganization } from "../constants/dummyOrgs";
import { getOrganizationProfile } from "../utils/events-utils";
import { getUserProfile } from "../utils/profile-utils";
import { logout } from "../utils/user-utils"; 

interface NavBarProps {
    userType: "student" | "organization";
}

interface StudentProfile {
  full_name: string;
  age: number;
  school: string;
  bio: string;
  interests: string;
  email?: string; // Add email from users table
}

interface OrganizationProfile {
  nonprofit_name: string;
  location: number;
  category: string;
  statement: string;
  email?: string; // Add email from users table
}

const NavBar: React.FC<NavBarProps> = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Add navigate hook

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.success) {
        // Clear any local state if needed
        setStudentProfile(null);
        setOrganizationProfile(null);
        setIsOpen(false);
        
        // Redirect to login page
        navigate('/');
      } else {
        console.error('Logout failed:', response.message);
        // Even if logout fails on backend, redirect to login for security
        navigate('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, redirect to login for security
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use /me endpoint for both user types since it returns email
        const data = await makeRequest(`${API_BASE}/me`, 'GET');
        console.log('User data received:', data); // Debug log
        
        if (userType === "student") {
          if (data && data.profile) {
            // Add email from the main user data to the profile
            const profileWithEmail = {
              ...data.profile,
              email: data.email
            };
            setStudentProfile(profileWithEmail);
          } else {
            setError('No student profile found');
          }
        } else {
          if (data && data.profile) {
            // Add email from the main user data to the profile
            const profileWithEmail = {
              ...data.profile,
              email: data.email
            };
            setOrganizationProfile(profileWithEmail);
          } else {
            setError('No organization profile found');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    // Helper function for API calls (inline version since we need it here)
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

    fetchUserProfile();
  }, [userType]);

  // Get display data with fallback to dummy data
  const getDisplayData = () => {
    if (userType === "organization") {
      if (organizationProfile) {
        return {
          name: organizationProfile.nonprofit_name,
          email: organizationProfile.email || 'No email'
        };
      } else {
        return {
          name: dummyOrganization.name,
          email: dummyOrganization.email // fallback to dummy data
        };
      }
    } else {
      if (studentProfile) {
        return {
          name: studentProfile.full_name,
          email: studentProfile.email || 'No email'
        };
      } else {
        return {
          name: dummyStudent.full_name,
          email: dummyStudent.email // fallback to dummy data
        };
      }
    }
  };

  const displayData = getDisplayData();
    
  return (
        <nav className="navbar">
          <div className = "navbar-left">
            
            {userType === "organization" ? (
              <Link to="/organization-page" className="navbar-logo-link">
                <div className="navbar-logo">
                  <img src={blueTransparent} alt="Logo" />
                  <h1>Cause Connect</h1>
                </div>          
              </Link>
            ) : (
              <Link to="/landing-page" className="navbar-logo-link">
                <div className="navbar-logo">
                  <img src={blueTransparent} alt="Logo" />
                  <h1>Cause Connect</h1>
                </div>          
              </Link>
            )}
          </div>
          
          <div className="navbar-profile">
  <button className="dropdown-button" onClick={() => setIsOpen(!isOpen)}>
    <img src={profileIcon2} alt="Profile" />
  </button>
  
            {isOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-profile">
                  <img src={avatar} alt="Profile" />
                  {loading ? (
                    <>
                      <h4>Loading...</h4>
                      <p>Loading...</p>
                    </>
                  ) : error ? (
                    <>
                      <h4>Error loading profile</h4>
                      <p>{error}</p>
                    </>
                  ) : (
                    <>
                      <h4>{displayData.name}</h4>
                      <p>{displayData.email}</p>
                    </>
                  )}
                </div>

                <div className="dropdown-list-container">
                 {userType === "organization" ? (
                    <button className="dropdown-list" onClick={() => (window.location.href = 'organization-profile')}>
                    View Profile
                  </button>
                  ) : (
                    <button className="dropdown-list" onClick={() => (window.location.href = 'user-profile')}>
                    View Profile
                    </button>
                  )}
                  
                </div>

                <div>
                  {userType === "organization" ? (
                    <button className="dropdown-list" onClick={() => (window.location.href = 'org-my-events')}>
                      View Volunteer Signups
                    </button>
                  ) : (
                    <button className="dropdown-list" onClick={() => (window.location.href = 'my-events')}>
                      My Events
                    </button>
                  )}
                </div>
              
                <div>
                  <button className="dropdown-list"
                  onClick={
                    () => (window.location.href='settings-page')
                  }>Settings</button>
                </div>

                <div>
                  <button className="dropdown-list" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </nav>
      );
}

export default NavBar;
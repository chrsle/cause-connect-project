import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../views/styles/navBar.css";
import blueTransparent from "../blueTransparent.png";
import { useState, useEffect } from "react";
import "../views/styles/dropDownMenu.css";
import { getOrganizationProfile } from "../utils/events-utils";
import { getUserProfile } from "../utils/profile-utils";
import { logout } from "../utils/user-utils";
import { createAvatarFromName } from "../utils/profile-pic-utils";

interface NavBarProps {
    userType: "student" | "organization";
}

interface StudentProfile {
  full_name: string;
  age: number;
  school: string;
  bio: string;
  interests: string;
  email?: string;
}

interface OrganizationProfile {
  nonprofit_name: string;
  location: number;
  category: string;
  statement: string;
  email?: string;
}

const NavBar: React.FC<NavBarProps> = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.success) {
        setStudentProfile(null);
        setOrganizationProfile(null);
        setIsOpen(false);
        navigate('/');
      } else {
        console.error('Logout failed:', response.message);
        navigate('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await makeRequest(`${API_BASE}/me`, 'GET');
        
        if (userType === "student") {
          if (data && data.profile) {
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

    const API_BASE = "http://causeconnectbackend.onrender.com:5001/api";

    fetchUserProfile();
  }, [userType]);

  const getDisplayData = () => {
    if (userType === "organization") {
      if (organizationProfile) {
        return {
          name: organizationProfile.nonprofit_name,
          email: organizationProfile.email || 'No email'
        };
      }
    } else {
      if (studentProfile) {
        return {
          name: studentProfile.full_name,
          email: studentProfile.email || 'No email'
        };
      }
    }
    return {
      name: userType === "organization" ? "Organization" : "Student",
      email: 'No email'
    };
  };

  const displayData = getDisplayData();
  const avatarUrl = createAvatarFromName(displayData.name);
    
  return (
    <nav className="navbar">
      <div className="navbar-left">
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
          <img src={avatarUrl} alt="Profile" className="navbar-profile-pic" />
        </button>
        
        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-profile">
              <img src={avatarUrl} alt="Profile" className="dropdown-profile-pic" />
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
                <button className="dropdown-list" onClick={() => navigate('/organization-profile')}>
                  View Profile
                </button>
              ) : (
                <button className="dropdown-list" onClick={() => navigate('/user-profile')}>
                  View Profile
                </button>
              )}
            </div>

            <div>
              {userType === "organization" ? (
                <button className="dropdown-list" onClick={() => navigate('/org-my-events')}>
                  View Volunteer Signups
                </button>
              ) : (
                <button className="dropdown-list" onClick={() => navigate('/my-events')}>
                  My Events
                </button>
              )}
            </div>
          
            <div>
              <button className="dropdown-list" onClick={() => navigate('/settings-page')}>
                Settings
              </button>
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
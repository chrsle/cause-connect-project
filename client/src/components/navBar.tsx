import React from 'react';
import { Link } from 'react-router-dom';
import "../views/styles/navBar.css";
import blueTransparent from "../blueTransparent.png";
import { useState } from "react";
import profileIcon2 from "../profileIcon2.png";
import "../views/styles/dropDownMenu.css";
import avatar from "../default-avatar.png";
import { dummyStudent } from "../constants/dummyStudent";
import { dummyOrganization } from "../constants/dummyOrgs";

interface NavBarProps {
    userType: "student" | "organization";
  }


const NavBar: React.FC<NavBarProps> = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
    
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
                {userType === "organization" ? (
                  <div className="dropdown-profile">
                    <img src={avatar} alt="Profile" />
                    <h4>{dummyOrganization.name}</h4>
                    <p>{dummyOrganization.email}</p>
                  </div>
                ) : (
                  <div className="dropdown-profile">
                    <img src={avatar} alt="Profile" />
                    <h4>{dummyStudent.full_name}</h4>
                    <p>{dummyStudent.email}</p>
                  </div>
                )}

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
                  <button className="dropdown-list">Log out</button>
                </div>
              </div>
            )}
          </div>
          
        </nav>
      );
}

export default NavBar;
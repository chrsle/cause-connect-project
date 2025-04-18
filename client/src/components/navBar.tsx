import React from 'react';
import { Link } from 'react-router-dom';
import "../views/styles/navBar.css";
import blueTransparent from "../blueTransparent.png";
import { useState } from "react";
import profileIcon2 from "../profileIcon2.png";

const NavBar = () => {
    return (
        <nav className="navbar">
          <div className = "navbar-left">
            <div className="navbar-logo">
              <img src={blueTransparent} alt="Logo" />
              <h1>Cause Connect</h1>
            </div>
          </div>
          
          <div className="navbar-profile">
            <img src={profileIcon2} alt="Profile" />
          </div>
        </nav>
      );
}

export default NavBar;
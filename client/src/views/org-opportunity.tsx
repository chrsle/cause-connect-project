
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCard from "../components/eventCard";
import EventCardCarousel from "../components/eventCardCarousel";
import { dummyEvents } from "../constants/dummyEvents";
import { dummyStudent } from "../constants/dummyStudent";
import "./styles/landing-page.css";
import EventCardGrid from "../components/eventCardGrid";
import { Organization } from "../types/types";
import { dummyOrganization } from "../constants/dummyOrgs";
import "./styles/orgOpportunity.css";




function OrgOpportunity(){
    const navigate = useNavigate();

    const handleCreateOpportunity = () => {
        navigate('/create-opportunity');
    };

    return(
        <div className ="org-opportunity">
            <NavBar userType="organization"/>

            <div className = "landing-page__content">
                <div className="landing-page-header">
                    <h1 className="landing-page__greeting">
                        Hello, <span className='highlight'> {dummyOrganization.name}</span>
                    </h1>
                    <p className="landing-page__welcome">
                        Welcome back to <span className="highlight"> your</span> platform for{" "}
                        <span className="highlight">connecting</span> with{" "}
                        <span className="highlight">causes</span> you{" "}
                        <span className="highlight">care</span> about
                    </p>
                </div>
            </div>

            <div className="landing-page-events">
                <h2 className="header-events">Active Opportunities</h2>
                <EventCardCarousel events={dummyEvents} userType="organization" />
            </div>

            <div className="landing-page_new-opportunities">
                <button
                    onClick={handleCreateOpportunity}
                    className="create-opportunity-button"
                    aria-label="Create a new opportunity"
                >
                    <div className="create-button-content">
                        <span className="create-button-icon">+</span>
                        <span className="create-button-text">Create a new opportunity</span>
                    </div>
                </button>
            </div>

            <div className="past-opportunities">
                <h2 className="header-pastOpps">Past Opportunities</h2>
            </div>

            <div className="past-opportunities-grid">
                <EventCardGrid events={dummyEvents} userType="organization" />
            </div>
        </div>

    )
}

export default OrgOpportunity;
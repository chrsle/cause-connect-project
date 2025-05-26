import NavBar from "../components/navBar";
import { dummyStudent } from "../constants/dummyStudent";
import { dummyEvents } from "../constants/dummyEvents";
import { Event } from "../types/types";
import EventCardCarousel from "../components/eventCardCarousel";
import DraftEventCard from "../components/draftEventCard";
import EventCard from "../components/eventCard";
import "./styles/orgMyEvents.css";
import EventCardGrid from "../components/eventCardGrid";
import { useState } from "react";
import { dummyOrganization } from "../constants/dummyOrgs";

interface EventCardProps {
    events: Event[];
    userType: "student" | "organization";
}

function OrgMyEvents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  
    // Filter events based on search query
    const filteredEvents = dummyEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Mock draft events data - you can replace this with actual draft events from your API
    const draftEvents = dummyEvents.filter(event => event.status === 'draft');

    // Filter published/upcoming events (non-draft events)
    const upcomingEvents = dummyEvents.filter(event => event.status !== 'draft');

    return(
        <>
            <NavBar userType="organization"/>

            
            <div className="landing-page__content">
                    <div className="landing-page-header">
                      <h1 className="landing-page__greeting">
                        Hello, <span className="highlight">{dummyOrganization.name}</span>
                      </h1>
                      <p className="landing-page__welcome">
                        Here are  <span className="highlight"> your events</span>{" "} 
                      </p>
                    </div>
            </div>

            {/* Draft Events Section */}
            <div className="draft-events-section">
                <div className="draft-header-container">
                    <h2 className="draft-events-title">
                        📝 Draft Events
                    </h2>
                    <span className="draft-badge">Incomplete</span>
                </div>
                <p className="number_of_events draft-count">
                    You have {draftEvents.length} incomplete draft{draftEvents.length !== 1 ? 's' : ''}
                </p>
                <div className="draft-events-notice">
                    <div className="draft-notice-content">
                        <span className="draft-notice-icon">⚠️</span>
                        <p>Complete your drafts to publish them and start accepting applications.</p>
                    </div>
                </div>
                <EventCardCarousel 
                    events={draftEvents} 
                    userType="organization"
                    renderCard={(event, userType) => <DraftEventCard event={event} userType={userType} />}
                />
            </div>

            {/* Upcoming Events Section */}
            <div className="landing-page-events">
                <h2 className="header-events">Upcoming Opportunities</h2>
                <p className="number_of_events"> You have {upcomingEvents.length} upcoming events</p>
                <EventCardCarousel 
                    events={upcomingEvents} 
                    userType="organization"
                    renderCard={(event, userType) => <EventCard event={event} userType={userType} />}
                />
            </div>

            <div className="header-pastEvents">
                <h2 className="header-pastOpps">Past Opportunities</h2>
            </div>

            <div className="past-opportunities-grid">
                <EventCardGrid events={dummyEvents} userType="organization" />
            </div>

        </>
    )
}

export default OrgMyEvents;
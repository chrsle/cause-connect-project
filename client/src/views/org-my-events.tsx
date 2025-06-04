import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCardCarousel from "../components/eventCardCarousel";
import DraftEventCard from "../components/draftEventCard";
import EventCard from "../components/eventCard";
import "./styles/orgMyEvents.css";
import EventCardGrid from "../components/eventCardGrid";
import { useState, useEffect } from "react";
import { dummyOrganization } from "../constants/dummyOrgs";
import { getUserOpportunities, getOrganizationProfile } from "../utils/events-utils";

interface EventCardProps {
    events: Event[];
    userType: "student" | "organization";
}

function OrgMyEvents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [organizationProfile, setOrganizationProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organization profile
        const profile = await getOrganizationProfile();
        setOrganizationProfile(profile);
        
        // Fetch organization's events
        const eventsData = await getUserOpportunities();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Function to categorize events by date/time
  const categorizeEvents = () => {
    const currentDateTime = new Date();
    const upcoming: Event[] = [];
    const past: Event[] = [];
    const draft: Event[] = [];
    
    events.forEach((event: Event) => {
      // Handle draft events first
      if (event.status === 'draft') {
        draft.push(event);
        return;
      }
      
      // Parse date without timezone conversion
      const [year, month, day] = event.startDate.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      // Use raw time for comparison
      const timeToUse = event.rawTime || event.startTime;
      const [hours, minutes] = timeToUse.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      
      // Compare the full datetime (date + time)
      if (eventDate > currentDateTime) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });
    
    return { upcoming, past, draft };
  };
  
  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <NavBar userType="organization"/>
        <div className="landing-page__content">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  // Get categorized events
  const { upcoming: upcomingEvents, past: pastEvents, draft: draftEvents } = categorizeEvents();

  return(
    <>
      <NavBar userType="organization"/>
      
      <div className="landing-page__content">
        <div className="landing-page-header">
          <h1 className="landing-page__greeting">
            Hello, <span className="highlight">{organizationProfile?.nonprofit_name || dummyOrganization.name}</span>
          </h1>
          <p className="landing-page__welcome">
            Here are  <span className="highlight"> your events</span>{" "} 
          </p>
        </div>
      </div>

      {/* Draft Events Section */}
      {draftEvents.length > 0 && (
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
      )}

      {/* Upcoming Events Section */}
      <div className="landing-page-events">
        <h2 className="header-events">Upcoming Opportunities</h2>
        <p className="number_of_events"> You have {upcomingEvents.length} upcoming events</p>
        {upcomingEvents.length > 0 ? (
          <EventCardCarousel 
            events={upcomingEvents} 
            userType="organization"
            renderCard={(event, userType) => <EventCard event={event} userType={userType} />}
          />
        ) : (
          <p>No upcoming events at this time.</p>
        )}
      </div>

      <div className="header-pastEvents">
        <h2 className="header-pastOpps">Past Opportunities</h2>
      </div>

      {/* FIXED: Only show PAST events here, not ALL events */}
      <div className="past-opportunities-grid">
        {pastEvents.length > 0 ? (
          <EventCardGrid events={pastEvents} userType="organization" />
        ) : (
          <p>No past events found.</p>
        )}
      </div>
    </>
  )
}

export default OrgMyEvents;
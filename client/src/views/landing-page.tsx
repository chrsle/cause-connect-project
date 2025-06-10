import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCard from "../components/eventCard";
import EventCardCarousel from "../components/eventCardCarousel";
import { dummyStudent } from "../constants/dummyStudent";
import "./styles/landing-page.css";
import EventCardGrid from "../components/eventCardGrid";
import { getAllOpportunities } from "../utils/events-utils";
import { getUserProfile } from "../utils/profile-utils";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the working profile endpoint instead of /api/me
        try {
          const profileData = await getUserProfile();
          setUserData(profileData);
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
          setUserData(null);
        }

        // Fetch all events
        const eventsData = await getAllOpportunities();
        setEvents(eventsData);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to check if student interests match organization causes
  const getInterestMatchedEvents = (events: Event[], studentInterests: string) => {
    if (!studentInterests || !studentInterests.trim()) {
      return [];
    }
    
    // Convert student interests string to array and clean up
    const studentInterestArray = studentInterests
      .split(',')
      .map(interest => interest.trim().toLowerCase())
      .filter(interest => interest.length > 0);
    
    if (studentInterestArray.length === 0) {
      return [];
    }
    
    const matchedEvents = events.filter(event => {
      // Get event causes - now properly populated from backend JOIN
      const eventCauses = event.cause ? 
        event.cause.split(',').map(cause => cause.trim().toLowerCase()) : 
        [];
      
      // Check if at least one student interest matches one event cause
      const hasMatch = studentInterestArray.some(interest => 
        eventCauses.some(cause => {
          // Check for exact match or partial match
          return cause.includes(interest) || 
                 interest.includes(cause) ||
                 cause === interest;
        })
      );
      
      return hasMatch;
    });
    
    return matchedEvents;
  };

  // Filter events based on search query (for explore section only)
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.organization && event.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get interest-matched events for "Dive Deeper" section
  const interestMatchedEvents = userData?.interests ? 
    getInterestMatchedEvents(events, userData.interests) : 
    [];

  // For explore section: show only first 8 events if no search, all filtered if searching
  const exploreEvents = searchQuery.trim() 
    ? filteredEvents // Show all matching results when searching
    : filteredEvents.slice(0, 8); // Limit to 8 when not searching

  if (loading) {
    return (
      <div className="landing-page">
        <NavBar userType="student"/>
        <div className="landing-page__content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <NavBar userType="student"/>
      <div className="landing-page__content">
        <div className="landing-page-header">
          <h1 className="landing-page__greeting">
            Hello, <span className="highlight">{userData?.full_name || dummyStudent.full_name}</span>
          </h1>
          <p className="landing-page__welcome">
            Welcome back to <span className="highlight"> your</span> platform for{" "}
            <span className="highlight">connecting</span> with{" "}
            <span className="highlight">causes</span> you{" "}
            <span className="highlight">care</span> about
          </p>
        </div>

        <div className="landing-page-events">
          <h2 className="header-events">Dive Deeper into your Interests</h2>
          {userData?.interests ? (
            <>
              <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
                Events from organizations matching your interests: <strong>{userData.interests}</strong>
              </p>
              {/*Events count bar */}
              <p className="number_of_events">
                You have {interestMatchedEvents.length} event{interestMatchedEvents.length !== 1 ? 's' : ''} matching your interests
              </p>
              {interestMatchedEvents.length > 0 ? (
                <EventCardCarousel 
                  events={interestMatchedEvents} 
                  userType="student"  
                  renderCard={(event, userType) => <EventCard event={event} userType={userType} />}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#666', margin: '20px 0', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <p>No events found from organizations matching your current interests.</p>
                  <p>Check out the "Explore New Causes" section below to discover new opportunities!</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', margin: '20px 0', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p>Complete your profile to see personalized event recommendations!</p>
              <p>Visit your profile page to add your interests.</p>
            </div>
          )}
        </div>

        <div className="landing-page-explore">
          <h2 className="header-explore">Explore New Causes</h2>

          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search for events by title, location, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Show search results info */}
          {searchQuery.trim() && (
            <p style={{ margin: '10px 0', color: '#666', textAlign: 'center' }}>
              {exploreEvents.length} event{exploreEvents.length !== 1 ? 's' : ''} found for "{searchQuery}"
            </p>
          )}

          {/* Show limited events or search results - NO FILTERING BY INTERESTS */}
          <EventCardGrid events={exploreEvents} userType="student"/>
          
          {/* Show message when not searching and there are more events */}
          {!searchQuery.trim() && filteredEvents.length > 8 && (
            <p style={{ margin: '20px 0', color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
              Showing 8 of {filteredEvents.length} events. Use the search bar to find specific events.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
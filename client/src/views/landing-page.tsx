import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCard from "../components/eventCard";
import EventCardCarousel from "../components/eventCardCarousel";
import { dummyStudent } from "../constants/dummyStudent";
import "./styles/landing-page.css";
import EventCardGrid from "../components/eventCardGrid";
import { getAllOpportunities } from "../utils/events-utils";
import { getUserProfile } from "../utils/profile-utils"; // Import the working function

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
          console.log("Profile data received:", profileData);
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

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.organization && event.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          {events.length > 0 ? (
            <EventCardCarousel 
              events={events} 
              userType="student"  
              renderCard={(event, userType) => <EventCard event={event} userType={userType} />}
            />
          ) : (
            <p>No events available at this time.</p>
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

          {/* Show limited events or search results */}
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
import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCard from "../components/eventCard";
import EventCardCarousel from "../components/eventCardCarousel";
import { dummyStudent } from "../constants/dummyStudent";
import "./styles/landing-page.css";
import EventCardGrid from "../components/eventCardGrid";
import { getAllOpportunities } from "../utils/events-utils";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserData(userData);
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
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Hello, <span className="highlight">{userData?.profile?.full_name || dummyStudent.full_name}</span>
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
              placeholder="Search for events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <EventCardGrid events={filteredEvents} userType="student"/>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
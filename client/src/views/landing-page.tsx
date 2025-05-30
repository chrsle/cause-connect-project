import React, { useState,useEffect } from "react";
import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCard from "../components/eventCard";
import EventCardCarousel from "../components/eventCardCarousel";
import { dummyEvents } from "../constants/dummyEvents";
import { dummyStudent } from "../constants/dummyStudent";
import "./styles/landing-page.css";
import EventCardGrid from "../components/eventCardGrid";



const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load user info");
        }

        const data = await res.json();
        setUserData(data);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Filter events based on search query
  const filteredEvents = dummyEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="landing-page">
      <NavBar userType="student"/>
      <div className="landing-page__content">
        <div className="landing-page-header">
          <h1 className="landing-page__greeting">
            Hello, <span className="highlight">{dummyStudent.full_name}</span>
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
          <EventCardCarousel events={dummyEvents} userType="student"  renderCard={(event, userType) => <EventCard event={event} userType={userType} />}/>
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

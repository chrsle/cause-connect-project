import NavBar from "../components/navBar";
import { dummyStudent } from "../constants/dummyStudent";
import EventCardCarousel from "../components/eventCardCarousel";
import { Event } from "../types/types";
import "./styles/UserMyEvents.css";
import EventCard from "../components/eventCard";
import EventCardGrid from "../components/eventCardGrid";
import { useState, useEffect } from "react";
import { getAllOpportunities } from "../utils/events-utils";

interface EventCardProps {
    events: Event[];
}

function MyEvents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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

        // Fetch all events (since student doesn't have their own events, show all available)
        const eventsData = await getAllOpportunities();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
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
      <>
        <NavBar userType="student"/>
        <div className="landing-page__content">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return(
    <>
      <NavBar userType="student"/>
      
      <div className="landing-page__content">
        <div className="landing-page-header">
          <h1 className="landing-page__greeting">
            Hello, <span className="highlight">{userData?.profile?.full_name || dummyStudent.full_name}</span>
          </h1>
          <p className="landing-page__welcome">
            Here are  <span className="highlight"> your events</span>{" "} 
          </p>
        </div>
      </div>

      <div className="landing-page-events">
        <h2 className="header-events">Upcoming Opportunities</h2>
        <p className="number_of_events"> You have {userData?.profile?.upcoming_events || dummyStudent.upcoming_events} upcoming events</p>
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

      <div className="header-pastEvents">
        <h2 className="header-pastOpps">Past Opportunities</h2>
      </div>

      <div className="past-opportunities-grid">
        {events.length > 0 ? (
          <EventCardGrid events={events} userType="student"/>
        ) : (
          <p>No events found.</p>
        )}
      </div>
    </>
  )
}

export default MyEvents;
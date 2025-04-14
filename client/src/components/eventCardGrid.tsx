import React, { useState, useEffect } from 'react';
import EventCard from './eventCard';
import "../views/styles/eventGrid.css";
import { Event } from "../types/types";

const EventCardGrid: React.FC<{ events: Event[] }> = ({ events }) => {
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>(events.slice(0, 12)); // Show first 12 events initially
  const [loading, setLoading] = useState(false);

  // Infinite scroll logic
  const handleScroll = () => {
    const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
    if (bottom && !loading) {
      setLoading(true);
    }
  };

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        const moreEvents = events.slice(displayedEvents.length, displayedEvents.length + 12); // Load 12 more events
        setDisplayedEvents(prevEvents => [...prevEvents, ...moreEvents]);
        setLoading(false);
      }, 1000); // Simulate a delay like fetching data from an API
    }
  }, [loading, displayedEvents, events]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="event-card-grid">
      {displayedEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default EventCardGrid;

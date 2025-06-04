import React, { useState, useEffect } from 'react';
import EventCard from './eventCard';
import "../views/styles/eventGrid.css";
import { Event } from "../types/types";

interface EventCardGridProps {
  events: Event[];
  userType: "student" | "organization";
  onEventUpdated?: () => void; // Add this prop
}

const EventCardGrid: React.FC<EventCardGridProps> = ({ events, userType, onEventUpdated }) => {
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>(events.slice(0, 12)); // Show first 12 events initially
  const [loading, setLoading] = useState(false);

  const handleScroll = () => {
    const bottom = window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight;
    if (bottom && !loading) {
      setLoading(true);
    }
  };

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        const moreEvents = events.slice(displayedEvents.length, displayedEvents.length + 12); 
        setDisplayedEvents(prevEvents => [...prevEvents, ...moreEvents]);
        setLoading(false);
      }, 1000); 
    }
  }, [loading, displayedEvents, events]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Reset displayed events when events prop changes (after refresh)
  useEffect(() => {
    setDisplayedEvents(events.slice(0, 12));
  }, [events]);

  return (
    <div className="event-card-grid">
      {displayedEvents.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          userType={userType} 
          onEventUpdated={onEventUpdated} // Pass the callback
        />
      ))}
      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default EventCardGrid;
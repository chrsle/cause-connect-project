import React, { useState, useEffect } from 'react';
import EventCard from './eventCard';
import "../views/styles/eventGrid.css";
import { Event } from "../types/types";

interface EventCardGridProps {
  events: Event[];
  userType: "student" | "organization";
  onEventUpdated?: () => void;
}

const EventCardGrid: React.FC<EventCardGridProps> = ({ events, userType, onEventUpdated }) => {
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>(events.slice(0, 12));
  const [loading, setLoading] = useState(false);

  const handleScroll = () => {
    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const scrollThreshold = document.documentElement.offsetHeight - 100; // Trigger 100px before bottom
    const bottom = scrollPosition >= scrollThreshold;

    if (bottom && !loading && displayedEvents.length < events.length) {
      setLoading(true);
    }
  };

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        const moreEvents = events.slice(displayedEvents.length, displayedEvents.length + 12);
        setDisplayedEvents(prevEvents => [...prevEvents, ...moreEvents]);
        setLoading(false);
      }, 500); // Simulate slight delay
    }
  }, [loading, displayedEvents, events]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [displayedEvents, events]);

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
          onEventUpdated={onEventUpdated}
        />
      ))}

      {loading && <div className="loading">Loading...</div>}

      {!loading && displayedEvents.length < events.length && (
        <div className="show-more-container">
          <button 
            onClick={() => setLoading(true)} 
            className="show-more-button"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCardGrid;

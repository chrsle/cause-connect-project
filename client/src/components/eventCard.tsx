import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Event } from "../types/types";
import "../views/styles/eventCard.css";
import "../views/styles/expandedEventCard.css";
import ExpandedCardPortal from "./expandedCard"

interface EventCardProps {
  event: Event;
  userType: "student" | "organization";
}

const EventCard: React.FC<EventCardProps> = ({ event, userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Check if event is happening today or soon
  const isUpcoming = () => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <>
      <div className="event-card">
        <div className={`card-container ${isOpen ? "background-disabled" : ""}`}>
          {/* Event Status Badge */}
          {isUpcoming() && (
            <div className="event-badge upcoming">
              <span>Upcoming</span>
            </div>
          )}
          
          {/* Event Title */}
          <div className="event-header">
            <h2 className="event-card__title">{event.title}</h2>
          </div>

          {/* Date and Time Section */}
          <div className="event-datetime">
            <div className="datetime-group">
              <label className="datetime-label">📅 Date</label>
              <div className="datetime-content">
                <span className="event-card__startdate">
                  {formatDate(event.startDate)}
                </span>
                {event.startDate !== event.endDate && (
                  <>
                    <span className="date-separator">-</span>
                    <span className="event-card__enddate">
                      {formatDate(event.endDate)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="datetime-group">
              <label className="datetime-label">🕐 Time</label>
              <div className="datetime-content">
                <span className="event-card__starttime">
                  {formatTime(event.startTime)}
                </span>
                <span className="time-separator">-</span>
                <span className="event-card__endtime">
                  {formatTime(event.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="event-location">
            <label className="location-label">📍 Location</label>
            <p className="event-card__location">{event.location}</p>
          </div>

          {/* Action Button */}
          <div className="event-actions">
            {userType === "student" ? (
              <button className="action-button view-button" onClick={() => setIsOpen(!isOpen)}>
                <i className="material-icons">visibility</i>
                <span>View Details</span>
              </button>
            ) : (
              <button className="action-button edit-button-styled" onClick={() => setIsOpen(!isOpen)}>
                <i className="material-icons">edit_note</i>
                <span>Edit Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Render portal outside of the component hierarchy */}
      <ExpandedCardPortal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        event={event}
        userType={userType}
        isPast= {new Date(event.endDate) < new Date()}
      />
    </>
  );
};

export default EventCard;
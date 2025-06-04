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
  onEventUpdated?: () => void; // Added this prop
}

const EventCard: React.FC<EventCardProps> = ({ event, userType, onEventUpdated }) => {
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

  // Format date for display WITHOUT timezone conversion
  const formatDate = (dateString: string) => {
    // Use the formatted date from backend if available, otherwise format safely
    if (event.formattedDate && dateString === event.startDate) {
      return event.formattedDate;
    }
    
    // Parse date without timezone conversion
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    // Use the formatted time from backend if available
    if (event.formattedTime && timeString === event.startTime) {
      return event.formattedTime;
    }
    return timeString;
  };

  // Check if event is happening today or soon (fix timezone issue here too)
  const isUpcoming = () => {
    const currentDateTime = new Date();
    
    // Parse event date without timezone conversion
    const [year, month, day] = event.startDate.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    
    // Parse and set the event time
    const timeToUse = event.rawTime || event.startTime;
    const [hours, minutes] = timeToUse.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
    
    // Check if event datetime is in the future
    const isInFuture = eventDate > currentDateTime;
    
    // Check if event is within the next 7 days
    const diffTime = eventDate.getTime() - currentDateTime.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Show "Upcoming" badge only if event is in future AND within 7 days
    return isInFuture && diffDays <= 7 && diffDays >= 0;
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
        isPast={(() => {
          // Fix timezone issue in date comparison
          const [year, month, day] = event.endDate.split('-').map(Number);
          const eventEndDate = new Date(year, month - 1, day);
          eventEndDate.setHours(23, 59, 59, 999); // End of day
          return eventEndDate < new Date();
        })()}
        onEventUpdated={onEventUpdated} // Pass the callback
      />
    </>
  );
};

export default EventCard;
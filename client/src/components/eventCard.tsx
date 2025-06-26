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
  onEventUpdated?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, userType, onEventUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Debug log to see what data we're getting
  useEffect(() => {
    console.log('EventCard received event data:', event);
  }, [event]);
  
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

  // Helper function to determine if an event is past
  const isEventPast = (event: Event) => {
    const startDate = event.startDate;
    const startTime = event.rawTime || event.startTime;
    
    // Safety checks for required fields
    if (!startDate || !startTime) {
      return false;
    }

    try {
      const currentDateTime = new Date();
      
      // Parse event date without timezone conversion
      const [year, month, day] = startDate.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      // Parse and set the event time
      const [hours, minutes] = startTime.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      
      // Event is past if the event datetime has already occurred
      return eventDate < currentDateTime;
    } catch (error) {
      console.error('Error checking if event is past:', event, error);
      return false;
    }
  };

  // Get the correct field value with fallbacks for different data structures
  const getEventField = (field: string) => {
    const fieldMappings: { [key: string]: string[] } = {
      'startDate': ['startDate', 'date', 'event_date'],
      'endDate': ['endDate', 'end_date'],
      'startTime': ['startTime', 'time', 'event_time', 'rawTime'],
      'endTime': ['endTime', 'end_time'],
      'organization': ['organization', 'nonprofit_name', 'organizer'],
      'description': ['body', 'description', 'event_description'],
      'location': ['location', 'event_location'],
      'title': ['title', 'name', 'event_name']
    };

    const possibleFields = fieldMappings[field] || [field];
    
    for (const fieldName of possibleFields) {
      if (event[fieldName as keyof Event]) {
        return event[fieldName as keyof Event];
      }
    }
    
    return null;
  };

  // Format date for display WITHOUT timezone conversion
  const formatDate = (dateString: string) => {
    // Safety check for undefined/null dateString
    if (!dateString) {
      return 'Date TBD';
    }

    // Use the formatted date from backend if available
    if (event.formattedDate && dateString === getEventField('startDate')) {
      return event.formattedDate;
    }
    
    try {
      // Parse date without timezone conversion
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  // Format time for display
 // Format time for display - Convert from military to 12-hour format (alternative)
const formatTime = (timeString: string) => {
  // Safety check for undefined/null timeString
  if (!timeString) {
    return 'Time TBD';
  }
  // Use the formatted time from backend if available
  if (event.formattedTime && timeString === getEventField('startTime')) {
    return event.formattedTime;
  }
  try {
    // Convert military time (HH:MM) to 12-hour format
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Determine AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    // Format minutes with leading zero if needed
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', timeString, error);
    return timeString; // Return original if formatting fails
  }
};

  // Check if event is happening today or soon
  const isUpcoming = () => {
    const startDate = getEventField('startDate') as string;
    const startTime = getEventField('startTime') as string;
    
    // Safety checks for required fields
    if (!startDate || !startTime) {
      return false;
    }

    try {
      const currentDateTime = new Date();
      
      // Parse event date without timezone conversion
      const [year, month, day] = startDate.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      // Parse and set the event time
      const timeToUse = event.rawTime || startTime;
      if (!timeToUse) {
        return false;
      }
      
      const [hours, minutes] = timeToUse.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      
      // Check if event datetime is in the future
      const isInFuture = eventDate > currentDateTime;
      
      // Check if event is within the next 7 days
      const diffTime = eventDate.getTime() - currentDateTime.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Show "Upcoming" badge only if event is in future AND within 7 days
      return isInFuture && diffDays <= 7 && diffDays >= 0;
    } catch (error) {
      console.error('Error checking if event is upcoming:', event, error);
      return false;
    }
  };

  // Get display values with fallbacks
  const displayTitle = getEventField('title') as string || 'Untitled Event';
  const displayStartDate = getEventField('startDate') as string;
  const displayEndDate = getEventField('endDate') as string;
  const displayStartTime = getEventField('startTime') as string;
  const displayEndTime = getEventField('endTime') as string;
  const displayLocation = getEventField('location') as string || 'Location TBD';
  const displayOrganization = getEventField('organization') as string;
  const displayDescription = getEventField('description') as string;

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
            <h2 className="event-card__title">{displayTitle}</h2>
          </div>

          {/* Date and Time Section */}
          <div className="event-datetime">
            <div className="datetime-group">
              <label className="datetime-label">📅 Date</label>
              <div className="datetime-content">
                <span className="event-card__startdate">
                  {formatDate(displayStartDate)}
                </span>
                {displayEndDate && displayStartDate !== displayEndDate && (
                  <>
                    <span className="date-separator">-</span>
                    <span className="event-card__enddate">
                      {formatDate(displayEndDate)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="datetime-group">
              <label className="datetime-label">🕐 Time</label>
              <div className="datetime-content">
                <span className="event-card__starttime">
                  {formatTime(displayStartTime)}
                </span>
                {displayEndTime && (
                  <>
                    <span className="time-separator">-</span>
                    <span className="event-card__endtime">
                      {formatTime(displayEndTime)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="event-location">
            <label className="location-label">📍 Location</label>
            <p className="event-card__location">{displayLocation}</p>
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
        event={{
          ...event,
          // Ensure consistent field names for the modal
          title: displayTitle,
          startDate: displayStartDate,
          endDate: displayEndDate,
          startTime: displayStartTime,
          endTime: displayEndTime,
          location: displayLocation,
          organization: displayOrganization,
          body: displayDescription,
        }}
        userType={userType}
        isPast={isEventPast(event)}
        onEventUpdated={onEventUpdated}
      />
    </>
  );
};

export default EventCard;
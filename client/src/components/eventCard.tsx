
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

  return (
    <>
      <div className="event-card">
        <div className={`card-container ${isOpen ? "background-disabled" : ""}`}>
          <h2 className="event-card__title">{event.title}</h2>
          <p className="event-card__startdate">{event.startDate}</p>
          <p className="event-card__enddate">{event.endDate}</p>
          <p className="event-card__starttime">{event.startTime}</p>
          <p className="event-card__endtime">{event.endTime}</p>
          <p className="event-card__location">{event.location}</p>
        
          <button className="edit-button" onClick={() => setIsOpen(!isOpen)}>
            <i className="material-icons">edit_note</i>
          </button>
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


{/* <h2>Edit Event</h2>

<label>Title</label>
<input
  type="text"
  value={editableEvent.title}
  onChange={(e) => setEditableEvent({ ...editableEvent, title: e.target.value })}
/>

<label>Organization</label>
<input
  type="text"
  value={editableEvent.organization}
  onChange={(e) => setEditableEvent({ ...editableEvent, organization: e.target.value })}
/>

<label>Start Date</label>
<input
  type="date"
  value={editableEvent.startDate}
  onChange={(e) => setEditableEvent({ ...editableEvent, startDate: e.target.value })}
/>

<label>End Date</label>
<input
  type="date"
  value={editableEvent.endDate}
  onChange={(e) => setEditableEvent({ ...editableEvent, endDate: e.target.value })}
/>

<label>Start Time</label>
<input
  type="time"
  value={editableEvent.startTime}
  onChange={(e) => setEditableEvent({ ...editableEvent, startTime: e.target.value })}
/>

<label>End Time</label>
<input
  type="time"
  value={editableEvent.endTime}
  onChange={(e) => setEditableEvent({ ...editableEvent, endTime: e.target.value })}
/>

<label>Location</label>
<input
  type="text"
  value={editableEvent.location}
  onChange={(e) => setEditableEvent({ ...editableEvent, location: e.target.value })}
/>

<label>Description</label>
<textarea
  value={editableEvent.body}
  onChange={(e) => setEditableEvent({ ...editableEvent, body: e.target.value })}
/>

        
<div className="action-buttons">
  <button onClick={handleSave}>Save Changes</button>
</div> */}
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Event } from "../types/types";
import "../views/styles/eventCard.css";
import "../views/styles/expandedEventCard.css";



const ExpandedCardPortal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  userType: "student" | "organization";
  isPast: boolean;
}> = ({ isOpen, onClose, event, userType, isPast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event>({ ...event });
  const [hasJoined, setHasJoined] = useState(false);


  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Updated event:", editedEvent);
    setIsEditing(false);
    // Here you'd typically call a prop like onSave(editedEvent)
  };

  const handleJoinEvent =() => {
    //will check if they actually successfully joined the event
  }

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="expanded-card">
        <button className="close-button" onClick={onClose}>
          <i className="material-icons">close</i>
        </button>

        {isEditing ? (
          <>
            <div className="expanded-card-editing">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input name="title" id="title" value={editedEvent.title} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization</label>
                <input name="organization" id="organization" value={editedEvent.organization} onChange={handleChange} />
              </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="startDate">Start Date</label>
        <input type="date" name="startDate" id="startDate" value={editedEvent.startDate} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">End Date</label>
        <input type="date" name="endDate" id="endDate" value={editedEvent.endDate} onChange={handleChange} />
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="startTime">Start Time</label>
        <input type="time" name="startTime" id="startTime" value={editedEvent.startTime} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="endTime">End Time</label>
        <input type="time" name="endTime" id="endTime" value={editedEvent.endTime} onChange={handleChange} />
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="location">Location</label>
      <input name="location" id="location" value={editedEvent.location} onChange={handleChange} />
    </div>

    <div className="form-group">
      <label htmlFor="body">Description</label>
      <textarea name="body" id="body" value={editedEvent.body} onChange={handleChange} rows={4} />
    </div>
  </div>
            
          </>
        ) : (
          <>
            <h2 className="event-card__title">{event.title}</h2>
            <p><span className="event-card_label">Organization: </span>{event.organization}</p>
            <p><span className="event-card_label">Start Date: </span>{event.startDate}</p>
            <p><span className="event-card_label">End Date: </span>{event.endDate}</p>
            <p><span className="event-card_label">Start Time: </span>{event.startTime}</p>
            <p><span className="event-card_label">End Time: </span>{event.endTime}</p>
            <p><span className="event-card_label">Location: </span>{event.location}</p>
            <p><span className="event-card_label">Description: </span>{event.body}</p>
          </>
        )}

        <div className="action-buttons">
          {userType === "student" ? (
            !isPast ? (
              <button
                className="expanded-card-join-event-button"
                onClick={() => {
                console.log("Joined event:", event.title);
                setHasJoined(true); // <-- triggers UI update
              }}
              >
                {hasJoined ? "Successfully Joined!" : "Join Event"}
              </button>
            ) : null
            
          ) : !isPast ? (
          isEditing ? (
            <>
              <button className="expanded-card-save-button"onClick={handleSave}>Save</button>
              <button className="expanded-card-cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="expanded-card-edit-button" onClick={() => setIsEditing(true)}>Edit Event</button>
          )
        ) : null }
        </div>

      </div>
    </>,
    document.body
  );
};

export default ExpandedCardPortal;

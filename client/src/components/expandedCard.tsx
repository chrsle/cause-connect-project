import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { Event } from "../types/types";
import { updateOpportunity, deleteOpportunity, getOrganizationProfile } from "../utils/events-utils";
import "../views/styles/eventCard.css";
import "../views/styles/expandedEventCard.css";

const ExpandedCardPortal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  userType: "student" | "organization";
  isPast: boolean;
  onEventUpdated?: () => void;
}> = ({ isOpen, onClose, event, userType, isPast, onEventUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event>({ ...event });
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEvent(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await getOrganizationProfile();
      
      await updateOpportunity(
        editedEvent.id,
        profile.nonprofit_name,
        editedEvent.title,
        editedEvent.body,
        editedEvent.startDate,
        editedEvent.rawTime || editedEvent.startTime,
        editedEvent.location
      );
      
      setIsEditing(false);
      onEventUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteOpportunity(event.id);
      onEventUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = () => {
    setHasJoined(true);
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="expanded-card">
        <button className="close-button" onClick={onClose}>
          <i className="material-icons">close</i>
        </button>

        {error && (
          <div className="error-message" style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px' 
          }}>
            {error}
          </div>
        )}

        {isEditing ? (
          <>
            <div className="expanded-card-editing">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input 
                  name="title" 
                  id="title" 
                  value={editedEvent.title} 
                  onChange={handleChange} 
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization</label>
                <input 
                  name="organization" 
                  id="organization" 
                  value={editedEvent.organization} 
                  onChange={handleChange} 
                  disabled={true}
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    id="startDate" 
                    value={editedEvent.startDate} 
                    onChange={handleChange} 
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startTime">Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    id="startTime" 
                    value={editedEvent.rawTime || editedEvent.startTime} 
                    onChange={(e) => {
                      setEditedEvent(prev => ({ 
                        ...prev, 
                        startTime: e.target.value,
                        rawTime: e.target.value 
                      }));
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input 
                  name="location" 
                  id="location" 
                  value={editedEvent.location} 
                  onChange={handleChange} 
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="body">Description</label>
                <textarea 
                  name="body" 
                  id="body" 
                  value={editedEvent.body} 
                  onChange={handleChange} 
                  rows={4} 
                  disabled={isLoading}
                />
              </div>

              <div className="expanded-card-action-buttons">
                <button 
                  className="delete-button" 
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="event-card__title">{event.title}</h2>
            <p><span className="event-card_label">Organization: </span>{event.organization}</p>
            <p><span className="event-card_label">Date: </span>{event.formattedDate || event.startDate}</p>
            <p><span className="event-card_label">Time: </span>{event.formattedTime || event.startTime}</p>
            <p><span className="event-card_label">Location: </span>{event.location}</p>
            <p><span className="event-card_label">Description: </span>{event.body}</p>
          </>
        )}

        <div className="expanded-card-action-buttons">
          {userType === "student" ? (
            !isPast ? (
              <button
                className="expanded-card-join-event-button"
                onClick={handleJoinEvent}
              >
                {hasJoined ? "Successfully Joined!" : "Join Event"}
              </button>
            ) : null
          ) : !isPast ? (
            isEditing ? (
              <>
                <button 
                  className="expanded-card-save-button" 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="expanded-card-cancel-button" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedEvent({ ...event });
                    setError(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {event.status === "draft" ? (
                  <button 
                    className="expanded-card-edit-button" 
                    onClick={() => (window.location.href = 'create-opportunity')}
                  >
                    Complete Draft
                  </button>
                ) : (
                  <button 
                    className="expanded-card-edit-button" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Event
                  </button>
                )}
              </>    
            )
          ) : null}
        </div>
      </div>
    </>,
    document.body
  );
};

export default ExpandedCardPortal;
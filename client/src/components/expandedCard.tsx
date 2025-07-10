import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { Event } from "../types/types";
import { updateOpportunity, deleteOpportunity, getOrganizationProfile } from "../utils/events-utils";
import { volunteerForOpportunity, cancelVolunteerSignup, getVolunteeredOpportunities } from "../utils/reserve-utils";
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
  const [isCheckingJoinStatus, setIsCheckingJoinStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Get the correct field value with fallbacks for different data structures
  const getEventField = (field: string, eventData: Event = event) => {
    const fieldMappings: { [key: string]: string[] } = {
      'startDate': ['startDate', 'date', 'event_date'],
      'endDate': ['endDate', 'end_date'],
      'startTime': ['startTime', 'time', 'event_time', 'rawTime'],
      'endTime': ['endTime', 'end_time'], // Fixed: Added 'end_time' mapping
      'organization': ['organization', 'nonprofit_name', 'organizer'],
      'description': ['body', 'description', 'event_description'],
      'location': ['location', 'event_location'],
      'title': ['title', 'name', 'event_name']
    };

    const possibleFields = fieldMappings[field] || [field];
    
    for (const fieldName of possibleFields) {
      if (eventData[fieldName as keyof Event]) {
        return eventData[fieldName as keyof Event];
      }
    }
    
    return null;
  };

  // Format time from military to 12-hour format
  const formatTimeDisplay = (timeString: string) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  // Format date consistently
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format time range display
  const formatTimeRange = (startTime: string, endTime?: string) => {
    const formattedStart = formatTimeDisplay(startTime);
    if (!endTime) {
      return formattedStart;
    }
    const formattedEnd = formatTimeDisplay(endTime);
    return `${formattedStart} - ${formattedEnd}`;
  };

  // Check if student has already joined this event - FIXED VERSION
  useEffect(() => {
    const checkJoinStatus = async () => {
      if (userType === "student" && event.id && isOpen) {
        setIsCheckingJoinStatus(true);
        setError(null); // Clear any previous errors
        
        try {
          console.log('Checking join status for event:', event.id);
          const volunteeredEvents = await getVolunteeredOpportunities();
          console.log('Volunteered events:', volunteeredEvents);
          
          // Check if this event ID exists in the volunteered events
          const hasJoinedEvent = volunteeredEvents.some((vol: any) => {
            console.log('Comparing:', vol.opportunity_id, 'with', event.id);
            // Convert both to numbers for safe comparison
            const volId = typeof vol.opportunity_id === 'string' ? parseInt(vol.opportunity_id) : vol.opportunity_id;
            const eventId = typeof event.id === 'string' ? parseInt(event.id) : event.id;
            return volId === eventId;
          });
          
          console.log('Has joined event:', hasJoinedEvent);
          setHasJoined(hasJoinedEvent);
        } catch (error) {
          console.error('Error checking join status:', error);
          // Don't show error to user for status checking
          setHasJoined(false); // Default to not joined if error
        } finally {
          setIsCheckingJoinStatus(false);
        }
      }
    };

    // Reset state when modal opens
    if (isOpen && userType === "student") {
      setHasJoined(false);
      checkJoinStatus();
    }
  }, [isOpen, event.id, userType]);

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
        editedEvent.location,
        editedEvent.endTime // Pass end time to the update function
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

  const handleJoinEvent = async () => {
    if (hasJoined) {
      // If already joined, allow them to cancel
      await handleCancelJoin();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await volunteerForOpportunity(event.id);
      setHasJoined(true);
      console.log('Successfully joined event:', event.title);
    } catch (error: any) {
      console.error('Error joining event:', error);
      // Check if it's because user already joined
      if (error.message && error.message.includes('already')) {
        setHasJoined(true);
        setError('You have already joined this event!');
      } else {
        setError('Failed to join event. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelJoin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await cancelVolunteerSignup(event.id);
      setHasJoined(false);
      console.log('Successfully cancelled signup for event:', event.title);
    } catch (error) {
      console.error('Error cancelling signup:', error);
      setError('Failed to cancel signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getJoinButtonText = () => {
    if (isLoading) return 'Processing...';
    if (isCheckingJoinStatus) return 'Checking...';
    if (hasJoined) return 'Leave Event';
    return 'Join Event';
  };

  const getJoinButtonClass = () => {
    let baseClass = 'expanded-card-join-event-button';
    if (hasJoined) baseClass += ' joined';
    return baseClass;
  };

  // Get display values using the field mapping
  const displayStartDate = getEventField('startDate') as string;
  const displayStartTime = getEventField('startTime') as string;
  const displayEndTime = getEventField('endTime') as string; // This will now properly get end_time from DB

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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
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

                <div className="form-group">
                  <label htmlFor="endTime">End Time <span style={{color: '#666', fontSize: '0.9em'}}></span></label>
                  <input 
                    type="time" 
                    name="endTime" 
                    id="endTime" 
                    value={editedEvent.endTime || getEventField('endTime', editedEvent) as string || ''} 
                    onChange={handleChange}
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
            <p><span className="event-card_label">Date: </span>{formatDateDisplay(displayStartDate)}</p>
            <p><span className="event-card_label">Time (PST): </span>{formatTimeRange(displayStartTime, displayEndTime)}</p>
            <p><span className="event-card_label">Location: </span>{event.location}</p>
            <p><span className="event-card_label">Description: </span>{event.body}</p>
          </>
        )}

        <div className="expanded-card-action-buttons">
          {userType === "student" ? (
            !isPast ? (
              <button
                className={getJoinButtonClass()}
                onClick={handleJoinEvent}
                disabled={isLoading || isCheckingJoinStatus}
              >
                {getJoinButtonText()}
              </button>
            ) : (
              <p className="past-event-message" style={{ 
                color: '#666', 
                fontStyle: 'italic', 
                textAlign: 'center', 
                margin: '20px 0' 
              }}>
                This event has already occurred.
              </p>
            )
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
          ) : (
            <p className="past-event-message" style={{ 
              color: '#666', 
              fontStyle: 'italic', 
              textAlign: 'center', 
              margin: '20px 0' 
            }}>
              This event has already occurred and cannot be edited.
            </p>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default ExpandedCardPortal;
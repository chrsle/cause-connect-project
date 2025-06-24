import NavBar from "../components/navBar";
import { Event, Student } from "../types/types";
import "./styles/orgMyEvents.css";
import { useState, useEffect } from "react";
import { dummyOrganization } from "../constants/dummyOrgs";
import { getUserOpportunities, getOrganizationProfile, getEventVolunteers, removeVolunteerFromEvent } from "../utils/events-utils";

interface EventWithVolunteers extends Event {
  volunteers: Student[];
}

function OrgMyEvents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [events, setEvents] = useState<EventWithVolunteers[]>([]);
  const [organizationProfile, setOrganizationProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [expandedVolunteer, setExpandedVolunteer] = useState<number | null>(null);
  
  // Add this debugging version to your OrgMyEvents component's useEffect

useEffect(() => {
  const fetchData = async () => {
    try {
      console.log('Starting to fetch data...');
      
      // Fetch organization profile
      const profile = await getOrganizationProfile();
      console.log('Organization profile:', profile);
      setOrganizationProfile(profile);
      
      // Fetch organization's events
      const eventsData = await getUserOpportunities();
      console.log('Events data:', eventsData);
      
      // Fetch volunteers for each event
      const eventsWithVolunteers = await Promise.all(
        eventsData.map(async (event: Event) => {
          try {
            console.log(`Fetching volunteers for event ${event.id}:`, event.title);
            const volunteers = await getEventVolunteers(event.id);
            console.log(`Volunteers for event ${event.id}:`, volunteers);
            return { ...event, volunteers };
          } catch (error) {
            console.error(`Error fetching volunteers for event ${event.id}:`, error);
            // Log more details about the error
            if (error instanceof Error) {
              console.error('Error message:', error.message);
            }
            return { ...event, volunteers: [] };
          }
        })
      );
      
      console.log('Final events with volunteers:', eventsWithVolunteers);
      setEvents(eventsWithVolunteers);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
  
  // Function to categorize events by date/time
  const categorizeEvents = (eventsToFilter: EventWithVolunteers[]) => {
    const currentDateTime = new Date();
    const upcoming: EventWithVolunteers[] = [];
    const past: EventWithVolunteers[] = [];
    
    eventsToFilter.forEach((event: EventWithVolunteers) => {
      // Parse date without timezone conversion
      const [year, month, day] = event.startDate.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      // Use raw time for comparison
      const timeToUse = event.rawTime || event.startTime;
      const [hours, minutes] = timeToUse.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      
      // Compare the full datetime (date + time)
      if (eventDate > currentDateTime) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });
    
    return { upcoming, past };
  };
  
  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.volunteers.some(volunteer => 
      volunteer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Format date for display
  const formatDate = (dateString: string) => {
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
      return 'Invalid Date';
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
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

  // Handle removing volunteer from event - using user ID as identifier
  const handleRemoveVolunteer = async (eventId: number, userId: number) => {
    if (window.confirm('Are you sure you want to remove this volunteer from the event?')) {
      try {
        await removeVolunteerFromEvent(eventId, userId);
        // Update the local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, volunteers: event.volunteers.filter(v => v.user_id !== userId) }
              : event
          )
        );
      } catch (error) {
        console.error('Error removing volunteer:', error);
        alert('Failed to remove volunteer. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <>
        <NavBar userType="organization"/>
        <div className="landing-page__content">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  // Get categorized events from filtered results
  const { upcoming: upcomingEvents, past: pastEvents } = categorizeEvents(filteredEvents);

  return(
    <>
      <NavBar userType="organization"/>
      
      <div className="landing-page__content">
        <div className="landing-page-header">
          <h1 className="landing-page__greeting">
            Hello, <span className="highlight">{organizationProfile?.nonprofit_name || dummyOrganization.name}</span>
          </h1>
          <p className="landing-page__welcome">
            Here are your events and <span className="highlight">volunteers</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search events or volunteers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="events-section">
        <h2 className="section-title">Upcoming Events</h2>
        <p className="events-count">
          {searchQuery ? 
            `Found ${upcomingEvents.length} upcoming events` : 
            `You have ${upcomingEvents.length} upcoming events`
          }
        </p>
        
        {upcomingEvents.length > 0 ? (
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-header" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                  <div className="event-info">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-details">
                      <span className="event-date">{formatDate(event.startDate)} at {formatTime(event.startTime)}</span>
                      <span className="event-location">{event.location}</span>
                    </div>
                  </div>
                  <div className="event-stats">
                    <span className="volunteer-count">{event.volunteers.length} volunteers</span>
                    <span className="expand-icon">{expandedEvent === event.id ? '▼' : '▶'}</span>
                  </div>
                </div>
                
                {expandedEvent === event.id && (
                  <div className="volunteers-list">
                    {event.volunteers.length > 0 ? (
                      event.volunteers.map((volunteer) => (
                        <div key={volunteer.user_id} className="volunteer-item">
                          <div 
                            className="volunteer-basic-info"
                            onClick={() => setExpandedVolunteer(expandedVolunteer === volunteer.user_id ? null : volunteer.user_id)}
                          >
                            <span className="volunteer-name">{volunteer.full_name}</span>
                            <div className="volunteer-actions">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveVolunteer(event.id, volunteer.user_id);
                                }}
                                className="remove-volunteer-btn"
                                title="Remove volunteer"
                              >
                                ✕
                              </button>
                              <span className="expand-volunteer-icon">
                                {expandedVolunteer === volunteer.user_id ? '▼' : '▶'}
                              </span>
                            </div>
                          </div>
                          
                          {expandedVolunteer === volunteer.user_id && (
                            <div className="volunteer-details">
                              <div className="detail-row">
                                <strong>Age:</strong> {volunteer.age}
                              </div>
                              <div className="detail-row">
                                <strong>Location:</strong> {volunteer.school}
                              </div>
                              <div className="detail-row">
                                <strong>Email:</strong> {volunteer.email}
                              </div>
                              {volunteer.phone && (
                                <div className="detail-row">
                                  <strong>Phone:</strong> {volunteer.phone}
                                </div>
                              )}
                              {volunteer.bio && (
                                <div className="detail-row">
                                  <strong>Bio:</strong> {volunteer.bio}
                                </div>
                              )}
                              {volunteer.interests && (
                                <div className="detail-row">
                                  <strong>Interests:</strong> {volunteer.interests}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-volunteers">No volunteers signed up yet</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events">
            {searchQuery ? 
              "No upcoming events match your search." : 
              "No upcoming events at this time."
            }
          </p>
        )}
      </div>

      {/* Past Events Section */}
      <div className="events-section">
        <h2 className="section-title">Past Events</h2>
        
        {pastEvents.length > 0 ? (
          <div className="events-list">
            {pastEvents.map((event) => (
              <div key={event.id} className="event-item past-event">
                <div className="event-header" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                  <div className="event-info">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-details">
                      <span className="event-date">{formatDate(event.startDate)} at {formatTime(event.startTime)}</span>
                      <span className="event-location">{event.location}</span>
                    </div>
                  </div>
                  <div className="event-stats">
                    <span className="volunteer-count">{event.volunteers.length} participated</span>
                    <span className="expand-icon">{expandedEvent === event.id ? '▼' : '▶'}</span>
                  </div>
                </div>
                
                {expandedEvent === event.id && (
                  <div className="volunteers-list">
                    {event.volunteers.length > 0 ? (
                      event.volunteers.map((volunteer) => (
                        <div key={volunteer.user_id} className="volunteer-item">
                          <div 
                            className="volunteer-basic-info"
                            onClick={() => setExpandedVolunteer(expandedVolunteer === volunteer.user_id ? null : volunteer.user_id)}
                          >
                            <span className="volunteer-name">{volunteer.full_name}</span>
                            <span className="expand-volunteer-icon">
                              {expandedVolunteer === volunteer.user_id ? '▼' : '▶'}
                            </span>
                          </div>
                          
                          {expandedVolunteer === volunteer.user_id && (
                            <div className="volunteer-details">
                              <div className="detail-row">
                                <strong>Age:</strong> {volunteer.age}
                              </div>
                              <div className="detail-row">
                                <strong>Location:</strong> {volunteer.school}
                              </div>
                              <div className="detail-row">
                                <strong>Email:</strong> {volunteer.email}
                              </div>
                              {volunteer.phone && (
                                <div className="detail-row">
                                  <strong>Phone:</strong> {volunteer.phone}
                                </div>
                              )}
                              {volunteer.bio && (
                                <div className="detail-row">
                                  <strong>Bio:</strong> {volunteer.bio}
                                </div>
                              )}
                              {volunteer.interests && (
                                <div className="detail-row">
                                  <strong>Interests:</strong> {volunteer.interests}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-volunteers">No volunteers participated</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events">
            {searchQuery ? 
              "No past events match your search." : 
              "No past events found."
            }
          </p>
        )}
      </div>
    </>
  )
}

export default OrgMyEvents;
import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import { Event } from "../types/types";
import EventCard from "../components/eventCard";
import EventCardCarousel from "../components/eventCardCarousel";
import { dummyStudent } from "../constants/dummyStudent";
import "./styles/landing-page.css";
import EventCardGrid from "../components/eventCardGrid";
import { getAllOpportunities, getNearbyOpportunities } from "../utils/events-utils";
import { getUserProfile } from "../utils/profile-utils";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Location filtering state
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [selectedDistance, setSelectedDistance] = useState<string>("all");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationManuallyChanged, setLocationManuallyChanged] = useState(false);

  // Helper function to check if an event is in the future
  const isEventInFuture = (event: Event) => {
    try {
      const currentDateTime = new Date();
      
      // Parse event date without timezone conversion
      const [year, month, day] = event.startDate.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      
      // Use raw time for comparison (use rawTime if available, otherwise parse startTime)
      const timeToUse = event.rawTime || event.startTime;
      if (!timeToUse) {
        return false; // If no time, consider it past to be safe
      }
      
      const [hours, minutes] = timeToUse.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      
      // Return true only if event datetime is in the future
      return eventDate > currentDateTime;
    } catch (error) {
      console.error('Error checking if event is in future:', event, error);
      return false; // If error parsing, consider it past to be safe
    }
  };

  // Filter events to only show future events for students
  const filterFutureEvents = (events: Event[]) => {
    return events.filter(event => isEventInFuture(event));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile and get location from school field
        try {
          const profileData = await getUserProfile();
          setUserData(profileData);
          // Set location from user's school or default
          const userLocation = profileData?.school || dummyStudent.school;
          setCurrentLocation(userLocation);
          setLocationDetected(!!profileData?.school);
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
          setUserData(null);
          setCurrentLocation(dummyStudent.school);
          setLocationDetected(false);
        }

        // Fetch all events initially
        const eventsData = await getAllOpportunities();
        
        // Filter to only show future events for students
        const futureEvents = filterFutureEvents(eventsData);
        
        setAllEvents(futureEvents);
        setFilteredEvents(futureEvents);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect to handle location-based filtering
  useEffect(() => {
    const filterEventsByLocation = async () => {
      if (!currentLocation || selectedDistance === "all") {
        setFilteredEvents(allEvents);
        return;
      }

      try {
        setIsLoadingLocation(true);
        const nearbyEvents = await getNearbyOpportunities(currentLocation, parseInt(selectedDistance));
        
        // Filter nearby events to only show future events for students
        const futureNearbyEvents = filterFutureEvents(nearbyEvents);
        
        setFilteredEvents(futureNearbyEvents);
      } catch (error) {
        console.error("Error filtering events by location:", error);
        // Fallback to all events if location filtering fails
        setFilteredEvents(allEvents);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    if (currentLocation && allEvents.length > 0) {
      filterEventsByLocation();
    }
  }, [currentLocation, selectedDistance, allEvents]);

  // Helper function to check if student interests match organization causes
  const getInterestMatchedEvents = (events: Event[], studentInterests: string) => {
    if (!studentInterests || !studentInterests.trim()) {
      return [];
    }
    
    // Convert student interests string to array and clean up
    const studentInterestArray = studentInterests
      .split(',')
      .map(interest => interest.trim().toLowerCase())
      .filter(interest => interest.length > 0);
    
    if (studentInterestArray.length === 0) {
      return [];
    }
    
    const matchedEvents = events.filter(event => {
      // Get event causes - now properly populated from backend JOIN
      const eventCauses = event.cause ? 
        event.cause.split(',').map(cause => cause.trim().toLowerCase()) : 
        [];
      
      // Check if at least one student interest matches one event cause
      const hasMatch = studentInterestArray.some(interest => 
        eventCauses.some(cause => {
          // Check for exact match or partial match
          return cause.includes(interest) || 
                 interest.includes(cause) ||
                 cause === interest;
        })
      );
      
      return hasMatch;
    });
    
    return matchedEvents;
  };

  const handleLocationChange = (newLocation: string) => {
    setCurrentLocation(newLocation);
    setLocationDetected(false); // User manually changed location
    setLocationManuallyChanged(true); // Track that user changed location manually
  };

  const handleDistanceChange = (distance: string) => {
    setSelectedDistance(distance);
  };

  // Filter events based on search query (from location-filtered events)
  const searchFilteredEvents = filteredEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.organization && event.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get interest-matched events from location-filtered events
  const interestMatchedEvents = userData?.interests ? 
    getInterestMatchedEvents(filteredEvents, userData.interests) : 
    [];

  // For explore section: show only first 8 events if no search, all filtered if searching
  const exploreEvents = searchQuery.trim() 
    ? searchFilteredEvents // Show all matching results when searching
    : searchFilteredEvents.slice(0, 8); // Limit to 8 when not searching

  if (loading) {
    return (
      <div className="landing-page">
        <NavBar userType="student"/>
        <div className="landing-page__content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <NavBar userType="student"/>
      <div className="landing-page__content">
        <div className="landing-page-header">
          <h1 className="landing-page__greeting">
            Hello, <span className="highlight">{userData?.full_name || dummyStudent.full_name}</span>
          </h1>
          <p className="landing-page__welcome">
            Welcome back to <span className="highlight"> your</span> platform for{" "}
            <span className="highlight">connecting</span> with{" "}
            <span className="highlight">causes</span> you{" "}
            <span className="highlight">care</span> about
          </p>
        </div>

        {/* Location Filter */}
        <div className="location-filter-container">
          <div className="location-filter">
            <div className="location-info">
              <span className="location-label">📍 Current Location: </span>
              <span className="location-text">{currentLocation}</span>
              <span className={`location-status ${locationDetected ? 'detected' : locationManuallyChanged ? 'custom' : 'default'}`}>
                {locationDetected ? '(detected)' : locationManuallyChanged ? '(custom)' : '(default)'}
              </span>
            </div>
            
            <div className="location-controls">
              <input
                type="text"
                placeholder="Change location..."
                className="location-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newLocation = (e.target as HTMLInputElement).value.trim();
                    if (newLocation) {
                      handleLocationChange(newLocation);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              
              <select 
                value={selectedDistance} 
                onChange={(e) => handleDistanceChange(e.target.value)}
                className="distance-select"
              >
                <option value="all">All Events</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
              </select>
            </div>
            
            <div className="filter-status">
              {isLoadingLocation ? (
                <span>Loading...</span>
              ) : (
                <span>
                  {filteredEvents.length} upcoming events found
                  {selectedDistance !== 'all' && ` within ${selectedDistance} miles`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="landing-page-events">
          <h2 className="header-events">Dive Deeper into your Interests</h2>
          {userData?.interests ? (
            <>
              <p style={{ margin: '10px 0', fontSize: '14px' }}>
                Upcoming events from organizations matching your interests: <strong>{userData.interests}</strong>
                {selectedDistance !== 'all' && ` (within ${selectedDistance} miles)`}
              </p>
              {/*Events count bar */}
              <p className="number_of_events">
                You have {interestMatchedEvents.length} upcoming event{interestMatchedEvents.length !== 1 ? 's' : ''} matching your interests
                {selectedDistance !== 'all' && ` within ${selectedDistance} miles`}
              </p>
              {isLoadingLocation ? (
                <p>Loading events...</p>
              ) : interestMatchedEvents.length > 0 ? (
                <EventCardCarousel 
                  events={interestMatchedEvents} 
                  userType="student"  
                  renderCard={(event, userType) => <EventCard event={event} userType={userType} />}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#666', margin: '20px 0', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <p>No upcoming events found from organizations matching your current interests{selectedDistance !== 'all' && ` within ${selectedDistance} miles`}.</p>
                  {selectedDistance !== 'all' ? (
                    <p>Try increasing your distance range or check out the "Explore New Causes" section below!</p>
                  ) : (
                    <p>Check out the "Explore New Causes" section below to discover new opportunities!</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', margin: '20px 0', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p>Complete your profile to see personalized event recommendations!</p>
              <p>Visit your profile page to add your interests.</p>
            </div>
          )}
        </div>

        <div className="landing-page-explore">
          <h2 className="header-explore">Explore New Causes</h2>

          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search for upcoming events by title, location, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Show search results info */}
          {searchQuery.trim() && (
            <p style={{ margin: '10px 0', color: '#666', textAlign: 'center' }}>
              {exploreEvents.length} upcoming event{exploreEvents.length !== 1 ? 's' : ''} found for "{searchQuery}"
              {selectedDistance !== 'all' && ` within ${selectedDistance} miles`}
            </p>
          )}

          {/* Show limited events or search results - WITH LOCATION FILTERING */}
          {isLoadingLocation ? (
            <p style={{ textAlign: 'center', margin: '20px 0' }}>Loading events...</p>
          ) : (
            <EventCardGrid events={exploreEvents} userType="student"/>
          )}
          
          {/* Show message when not searching and there are more events */}
          {!searchQuery.trim() && !isLoadingLocation && searchFilteredEvents.length > 8 && (
            <p style={{ margin: '20px 0', color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
              Showing 8 of {searchFilteredEvents.length} upcoming events{selectedDistance !== 'all' && ` within ${selectedDistance} miles`}. Use the search bar to find specific events.
            </p>
          )}
          
          {/* Show message when no upcoming events are available */}
          {!isLoadingLocation && exploreEvents.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', margin: '20px 0', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <p>No upcoming events available{selectedDistance !== 'all' && ` within ${selectedDistance} miles`}.</p>
              {selectedDistance !== 'all' && <p>Try increasing your distance range to see more events!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
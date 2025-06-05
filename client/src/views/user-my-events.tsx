import NavBar from "../components/navBar";
import { dummyStudent } from "../constants/dummyStudent";
import EventCardCarousel from "../components/eventCardCarousel";
import { Event } from "../types/types";
import "./styles/UserMyEvents.css";
import EventCard from "../components/eventCard";
import EventCardGrid from "../components/eventCardGrid";
import { useState, useEffect } from "react";
import { getVolunteeredOpportunities } from "../utils/reserve-utils";

interface EventCardProps {
    events: Event[];
}

function MyEvents() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserData(userData);
        }

        // Fetch ONLY events the student has signed up for
        const volunteeredEvents = await getVolunteeredOpportunities();
        console.log('Student volunteered events:', volunteeredEvents);
        
        // Map the volunteered events to match Event type
        const mappedEvents = volunteeredEvents.map((event: any) => ({
          id: event.id,
          title: event.title,
          organization: event.nonprofit_name || 'Organization',
          body: event.description,
          createdDate: new Date().toISOString(),
          author_id: event.user_id,
          startDate: event.date,
          startTime: event.time,
          endDate: event.end_date || event.date,
          endTime: event.end_time || "",
          location: event.location,
          cause: event.cause || "",
          status: "upcoming",
          // Add formatted versions
          formattedDate: formatDateDisplay(event.date),
          formattedTime: formatTimeDisplay(event.time),
          rawTime: event.time
        }));
        
        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching student events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format time from military to 12-hour format
  const formatTimeDisplay = (timeString: string) => {
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

  // Function to categorize events by date/time
  const categorizeEvents = () => {
    const currentDateTime = new Date();
    const upcoming: Event[] = [];
    const past: Event[] = [];
    
    events.forEach((event: Event) => {
      try {
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
      } catch (error) {
        console.error('Error parsing event date/time:', error);
        // If date parsing fails, assume it's upcoming
        upcoming.push(event);
      }
    });
    
    return { upcoming, past };
  };
  
  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.organization && event.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <>
        <NavBar userType="student"/>
        <div className="loading-message">
          <p>Loading your events...</p>
        </div>
      </>
    );
  }

  // Get categorized events
  const { upcoming: upcomingEvents, past: pastEvents } = categorizeEvents();

  return(
    <>
      <NavBar userType="student"/>
      
      <div className="landing-page__content">
        <div className="landing-page-header">
          <h1 className="landing-page__greeting">
            Hello, <span className="highlight">{userData?.profile?.full_name || dummyStudent.full_name}</span>
          </h1>
          <p className="landing-page__welcome">
            Here are <span className="highlight">your registered events</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search your events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="landing-page-events">
        <h2 className="header-events">Upcoming Events You've Joined</h2>
        <p className="number_of_events">You have {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}</p>
        {upcomingEvents.length > 0 ? (
          <EventCardCarousel 
            events={searchQuery ? filteredEvents.filter(e => {
              try {
                const [year, month, day] = e.startDate.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day);
                const timeToUse = e.rawTime || e.startTime;
                const [hours, minutes] = timeToUse.split(':').map(Number);
                eventDate.setHours(hours, minutes, 0, 0);
                return eventDate > new Date();
              } catch {
                return true;
              }
            }) : upcomingEvents} 
            userType="student"  
            renderCard={(event, userType) => <EventCard event={event} userType={userType} />}
          />
        ) : (
          <div className="empty-state">
            <p>You haven't joined any upcoming events yet.</p>
            <p>Visit the <a href="/landing-page">homepage</a> to discover new opportunities!</p>
          </div>
        )}
      </div>

      <div className="header-pastEvents">
        <h2 className="header-pastOpps">Past Events You Participated In</h2>
      </div>

      <div className="past-opportunities-grid">
        {pastEvents.length > 0 ? (
          <EventCardGrid 
            events={searchQuery ? filteredEvents.filter(e => {
              try {
                const [year, month, day] = e.startDate.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day);
                const timeToUse = e.rawTime || e.startTime;
                const [hours, minutes] = timeToUse.split(':').map(Number);
                eventDate.setHours(hours, minutes, 0, 0);
                return eventDate <= new Date();
              } catch {
                return false;
              }
            }) : pastEvents} 
            userType="student"
          />
        ) : (
          <div className="empty-state">
            <p>No past events found.</p>
            <p>Events you've participated in will appear here after they're completed.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default MyEvents;